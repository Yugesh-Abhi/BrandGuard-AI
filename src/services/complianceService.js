
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_REPORTS } from '../data/mockData';

const SERVER_API_URL = import.meta.env.VITE_COMPLIANCE_API_URL;
const AUTH_USER_KEY = 'brandguard_auth_user';

const isDemoSession = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem(AUTH_USER_KEY) || 'null'
    );
    return Boolean(user?.isMock);
  } catch {
    return false;
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createPatternRegex = (pattern) => {
  const escaped = escapeRegex(pattern.trim())
    .replace(/\s+/g, '\\s+');

  return new RegExp(`\\b${escaped}\\b`, 'gi');
};

const splitPatterns = (pattern) =>
  (pattern || '')
    .split('|')
    .map(item => item.trim())
    .filter(Boolean);

const getDeduction = (severity) => {
  switch ((severity || 'warning').toLowerCase()) {
    case 'critical':
      return 14;
    case 'warning':
      return 8;
    case 'suggestion':
      return 4;
    default:
      return 6;
  }
};

const getSuggestedAlternative = (rule) =>
  rule.preferred_alternative || '';

const mapViolation = (row) => ({
  id: row.id,
  ruleId: row.rule_id,
  category: row.category,
  severity: row.severity,
  flaggedText: row.flagged_text,
  locationContext: row.location_context,
  startCharIndex: row.start_char_index,
  endCharIndex: row.end_char_index,
  rule: row.location_context || 'Brand guideline rule',
  explanation: row.issue_description,
  suggestedFix: row.suggested_fix,
  status: row.status
});

const mapReport = (row, violations = []) => {
  const raw = row.raw_analysis || {};

  return {
    ...raw,
    id: row.id,
    submissionId: row.submission_id,
    overallScore: Number(row.overall_score),
    grade: row.grade,
    verdict: row.verdict,
    analyzedAt: row.created_at,
    executionTimeMs: row.execution_time_ms,
    engineType: row.ai_model_used || 'Client Rule-Based Engine',
    isMock: false,
    categoryScores: {
      tone: Number(row.tone_score ?? 100),
      terminology: Number(row.terminology_score ?? 100),
      legal: Number(row.legal_score ?? 100),
      formatting: Number(row.formatting_score ?? 100)
    },
    summary: row.summary,
    improvedVersion: raw.improvedVersion || '',
    violations
  };
};

const fetchViolations = async (reportId) => {
  const { data, error } = await supabase
    .from('compliance_violations')
    .select('*')
    .eq('report_id', reportId)
    .order('start_char_index', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapViolation);
};

const persistReport = async (report, submissionId) => {
  if (!submissionId || isDemoSession()) {
    return report;
  }

  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Cannot save the compliance report.');
  }

  const categoryScores = report.categoryScores || {};

  const reportPayload = {
    submission_id: submissionId,
    overall_score: report.overallScore,
    grade: report.grade,
    verdict: report.verdict,
    tone_score: categoryScores.tone ?? 100,
    terminology_score: categoryScores.terminology ?? 100,
    legal_score: categoryScores.legal ?? 100,
    formatting_score: categoryScores.formatting ?? 100,
    summary: report.summary || 'Compliance audit completed.',
    suggested_improvements: report.improvedVersion || null,
    ai_model_used: report.engineType || 'Client Rule-Based Engine (Deterministic)',
    execution_time_ms: Number.isInteger(report.executionTimeMs)
      ? report.executionTimeMs
      : null,
    raw_analysis: {
      improvedVersion: report.improvedVersion || '',
      engineType: report.engineType || 'Client Rule-Based Engine (Deterministic)'
    }
  };

  const { data: savedReport, error: reportError } = await supabase
    .from('compliance_reports')
    .insert(reportPayload)
    .select()
    .single();

  if (reportError) throw reportError;

  const violations = (report.violations || []).map(violation => ({
    report_id: savedReport.id,
    rule_id: violation.ruleId || null,
    category: violation.category,
    severity: violation.severity || 'warning',
    flagged_text: violation.flaggedText || '',
    location_context: violation.rule || null,
    start_char_index: Number.isInteger(violation.startCharIndex)
      ? violation.startCharIndex
      : null,
    end_char_index: Number.isInteger(violation.endCharIndex)
      ? violation.endCharIndex
      : null,
    issue_description: violation.explanation || 'Brand guideline violation.',
    suggested_fix: violation.suggestedFix || null,
    status: 'open'
  }));

  if (violations.length > 0) {
    const { error: violationsError } = await supabase
      .from('compliance_violations')
      .insert(violations);

    if (violationsError) {
      throw new Error(
        `The report was saved, but its violations could not be saved: ${violationsError.message}`
      );
    }
  }

  const savedViolations = await fetchViolations(savedReport.id);
  const result = mapReport(savedReport, savedViolations);

  sessionStorage.setItem(
    `brandguard_report_${result.id}`,
    JSON.stringify(result)
  );

  return result;
};

export const complianceService = {
  async runComplianceCheck({
    contentBody,
    guideline,
    channel = 'Blog Post',
    submissionId = null
  }) {
    if (!contentBody?.trim()) {
      throw new Error('Please enter content before running the audit.');
    }

    if (!guideline) {
      throw new Error('Please select an active brand guideline.');
    }

    const startedAt = Date.now();
    let report;

    if (SERVER_API_URL) {
      try {
        const response = await fetch(SERVER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentBody,
            channel,
            guidelineId: guideline.id,
            brandRules: guideline.rules || [],
            requiredDisclaimers: guideline.requiredDisclaimers || [],
            toneTraits: guideline.toneTraits || []
          })
        });

        if (response.ok) {
          const remoteData = await response.json();

          report = {
            ...remoteData,
            engineType: 'Server-Side Compliance API',
            isMock: false
          };
        } else {
          console.warn(
            'Compliance API returned an error. Using local rule engine.'
          );
        }
      } catch (error) {
        console.warn(
          'Compliance API unavailable. Using local rule engine:',
          error.message
        );
      }
    }

    if (!report) {
      report = this.evaluateRulesLocally(
        contentBody,
        guideline,
        channel
      );
    }

    report.executionTimeMs = Date.now() - startedAt;

    if (submissionId && !isDemoSession()) {
      report = await persistReport(report, submissionId);
    } else {
      sessionStorage.setItem(
        `brandguard_report_${report.id}`,
        JSON.stringify(report)
      );
    }

    return report;
  },

  evaluateRulesLocally(text, guideline, channel = 'Blog Post') {
    const violations = [];
    const lowerText = text.toLowerCase();

    const deductionsByCategory = {
      tone: 0,
      terminology: 0,
      legal: 0,
      formatting: 0
    };

    let totalDeduction = 0;
    let improvedVersion = text;

    const databaseRules = Array.isArray(guideline?.rules)
      ? guideline.rules.filter(rule => rule.is_active !== false)
      : [];

    const rules = databaseRules.length
      ? databaseRules
      : (guideline?.bannedWords || []).map(item => ({
          id: item.id || null,
          category: item.category || 'terminology',
          rule_name: item.ruleName || 'Brand terminology rule',
          severity: item.severity || 'warning',
          banned_pattern: item.word || item,
          preferred_alternative: item.alternative || '',
          explanation: item.reason || 'Prohibited by the brand guideline.',
          is_active: true
        }));

    const addViolation = ({
      category,
      severity,
      flaggedText,
      ruleId = null,
      ruleName,
      explanation,
      suggestedFix = '',
      startCharIndex = null,
      endCharIndex = null
    }) => {
      const normalizedCategory =
        category === 'banned' ? 'terminology' : category;

      if (!Object.hasOwn(deductionsByCategory, normalizedCategory)) {
        return;
      }

      const deduction = getDeduction(severity);

      totalDeduction += deduction;
      deductionsByCategory[normalizedCategory] += deduction;

      violations.push({
        id: `viol-${Date.now()}-${violations.length}`,
        ruleId,
        category: normalizedCategory,
        severity: severity || 'warning',
        flaggedText,
        rule: ruleName,
        explanation,
        suggestedFix,
        startCharIndex,
        endCharIndex
      });
    };

    // 1. Evaluate active brand rules.
    rules.forEach(rule => {
      const category =
        rule.category === 'banned'
          ? 'terminology'
          : rule.category;

      if (!Object.hasOwn(deductionsByCategory, category)) {
        return;
      }

      const patterns = splitPatterns(rule.banned_pattern);

      patterns.forEach(pattern => {
        const regex = createPatternRegex(pattern);
        let match;

        if (
          category === 'formatting' &&
          /first mention/i.test(rule.rule_name || '')
        ) {
          match = regex.exec(text);

          if (match && match[0] !== pattern) {
            addViolation({
              category,
              severity: rule.severity,
              flaggedText: match[0],
              ruleId: rule.id || null,
              ruleName: rule.rule_name,
              explanation: rule.explanation,
              suggestedFix: pattern,
              startCharIndex: match.index,
              endCharIndex: match.index + match[0].length
            });

            improvedVersion = improvedVersion.replace(
              createPatternRegex(match[0]),
              pattern
            );
          }

          return;
        }

        while ((match = regex.exec(text)) !== null) {
          const alternative = getSuggestedAlternative(rule);

          addViolation({
            category,
            severity: rule.severity,
            flaggedText: match[0],
            ruleId: rule.id || null,
            ruleName: rule.rule_name,
            explanation: rule.explanation,
            suggestedFix: alternative,
            startCharIndex: match.index,
            endCharIndex: match.index + match[0].length
          });

          if (alternative) {
            improvedVersion = improvedVersion.replace(
              createPatternRegex(pattern),
              alternative
            );
          }
        }
      });
    });

    // 2. Check mandatory disclaimers.
    const disclaimers = guideline?.requiredDisclaimers || [];

    disclaimers.forEach(disclaimer => {
      const disclaimerText =
        typeof disclaimer === 'string'
          ? disclaimer
          : disclaimer.text;

      if (!disclaimerText?.trim()) return;

      const context =
        typeof disclaimer === 'string'
          ? 'all'
          : (disclaimer.context || 'all');

      const mandatory =
        typeof disclaimer === 'string'
          ? true
          : disclaimer.mandatory !== false;

      const normalizedContext = context.toLowerCase();
      const normalizedChannel = channel.toLowerCase();

      const appliesToChannel =
        normalizedContext === 'all' ||
        normalizedContext === 'general' ||
        normalizedContext === 'any' ||
        normalizedContext.includes(normalizedChannel) ||
        normalizedChannel.includes(normalizedContext);

      if (!appliesToChannel) return;

      if (!lowerText.includes(disclaimerText.toLowerCase())) {
        addViolation({
          category: 'legal',
          severity: mandatory ? 'critical' : 'warning',
          flaggedText: 'Required disclaimer missing',
          ruleId: null,
          ruleName: 'Mandatory Brand Disclaimer',
          explanation: `The required disclaimer for ${context} is missing from the submitted content.`,
          suggestedFix: `Add this disclaimer: ${disclaimerText}`
        });
      }
    });

    // 3. Calculate scores.
    const overallScore = Math.max(
      0,
      Math.min(100, 100 - totalDeduction)
    );

    const categoryScores = {
      tone: Math.max(0, 100 - deductionsByCategory.tone),
      terminology: Math.max(0, 100 - deductionsByCategory.terminology),
      legal: Math.max(0, 100 - deductionsByCategory.legal),
      formatting: Math.max(0, 100 - deductionsByCategory.formatting)
    };

    let verdict = 'Passed — Ready for Publication';

    if (overallScore < 70) {
      verdict = 'Action Required: Significant Brand & Legal Violations';
    } else if (overallScore < 90) {
      verdict = 'Needs Minor Revisions Before Approval';
    }

    const grade =
      overallScore >= 90 ? 'A' :
      overallScore >= 80 ? 'B' :
      overallScore >= 70 ? 'C' : 'F';

    return {
      id: `rep-${Date.now()}`,
      overallScore,
      grade,
      verdict,
      analyzedAt: new Date().toISOString(),
      executionTimeMs: null,
      engineType: 'Client Rule-Based Engine (Deterministic)',
      isMock: false,
      categoryScores,
      summary: violations.length > 0
        ? `Audit completed. Found ${violations.length} issue(s) across the active brand rules and applicable disclaimers. Review the suggested corrections before publication.`
        : 'Audit completed. No violations were detected in the active rules and applicable disclaimers.',
      violations,
      improvedVersion
    };
  },

  async getReportById(reportId) {
    if (!reportId) return null;

    // Demo reports remain local.
    if (isDemoSession() || String(reportId).startsWith('rep-')) {
      const cached = sessionStorage.getItem(
        `brandguard_report_${reportId}`
      );

      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          console.warn('Could not parse the cached compliance report.');
        }
      }

      return MOCK_REPORTS[reportId] || null;
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const violations = await fetchViolations(data.id);
    const report = mapReport(data, violations);

    sessionStorage.setItem(
      `brandguard_report_${report.id}`,
      JSON.stringify(report)
    );

    return report;
  },

  async getLatestReportForSubmission(submissionId) {
    if (!submissionId) return null;

    if (isDemoSession()) {
      return null;
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const violations = await fetchViolations(data.id);
    const report = mapReport(data, violations);

    sessionStorage.setItem(
      `brandguard_report_${report.id}`,
      JSON.stringify(report)
    );

    return report;
  },

  saveReport(report) {
    if (report?.id) {
      sessionStorage.setItem(
        `brandguard_report_${report.id}`,
        JSON.stringify(report)
      );
    }

    return report;
  }
};

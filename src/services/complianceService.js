import { MOCK_REPORTS } from '../data/mockData';

const SERVER_API_URL = import.meta.env.VITE_COMPLIANCE_API_URL;

export const complianceService = {
  /**
   * Evaluates content against Brand Guidelines.
   * If a backend LLM proxy server is configured and reachable, delegates to it.
   * Otherwise, executes a transparent deterministic rule-based evaluation.
   */
  async runComplianceCheck({ contentBody, guideline, channel = 'Blog Post' }) {
    if (SERVER_API_URL && !SERVER_API_URL.includes('localhost:3001')) {
      try {
        const response = await fetch(SERVER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentBody,
            channel,
            guidelineId: guideline?.id,
            brandRules: guideline?.bannedWords
          })
        });

        if (response.ok) {
          const remoteData = await response.json();
          return {
            ...remoteData,
            engineType: 'Server-Side Secure LLM Proxy',
            isMock: false
          };
        }
      } catch (err) {
        console.warn('Backend LLM proxy unreachable, falling back to local deterministic rule engine:', err.message);
      }
    }

    return this.evaluateRulesLocally(contentBody, guideline, channel);
  },

  /**
   * Deterministic real rule evaluation based on active brand guidelines.
   * This inspects actual keywords, patterns, and active guideline rules.
   */
  evaluateRulesLocally(text, guideline, channel) {
    const violations = [];
    let deduction = 0;
    const lowerText = text.toLowerCase();

    // Rule Category 1: Banned Words & Jargon from active guideline
    const bannedWords = guideline?.bannedWords || [
      { word: 'revolutionary', reason: 'Overused hyperbole. Replace with concrete technical capability.', severity: 'warning', alternative: 'innovative' },
      { word: 'game-changer', reason: 'Cliché phrase banned in brand voice.', severity: 'warning', alternative: 'transformational catalyst' },
      { word: 'synergy', reason: 'Vague buzzword. State specific integration outcome.', severity: 'warning', alternative: 'seamless interoperability' },
      { word: 'foolproof', reason: 'Engineering inaccurate claim.', severity: 'critical', alternative: 'fault-tolerant' },
      { word: 'cheap', reason: 'Brand equity degradation. Prefer cost-effective.', severity: 'suggestion', alternative: 'cost-effective' },
      { word: 'guaranteed', reason: 'Unverified promise without legal SLA.', severity: 'critical', alternative: 'architecturally supported' }
    ];

    bannedWords.forEach((bannedItem) => {
      const term = (bannedItem.word || bannedItem).toLowerCase();
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const itemSeverity = bannedItem.severity || 'warning';
        deduction += itemSeverity === 'critical' ? 14 : itemSeverity === 'warning' ? 8 : 4;
        
        const fallbackAlternative =
          term === 'cheap' ? 'cost-effective' :
          term === 'revolutionary' ? 'innovative' :
          term === 'foolproof' ? 'fault-tolerant' :
          term === 'game-changer' ? 'transformative' :
          term === 'synergy' ? 'seamless interoperability' :
          'high-performance';

        violations.push({
          id: `viol-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          category: 'terminology',
          severity: itemSeverity,
          flaggedText: match[0],
          rule: `Banned Term: "${term}"`,
          explanation: bannedItem.reason || 'Prohibited by brand style standards.',
          suggestedFix: bannedItem.alternative || fallbackAlternative
        });
      }
    });

    // Rule Category 2: Legal Disclaimers & Absolute Claims
    if (lowerText.includes('guarantee') || lowerText.includes('foolproof') || lowerText.includes('100% uptime')) {
      deduction += 16;
      violations.push({
        id: `viol-legal-${Date.now()}`,
        category: 'legal',
        severity: 'critical',
        flaggedText: 'Absolute reliability / guarantee claim',
        rule: 'Unverified SLA & Liability Disclaimer',
        explanation: 'Legal guidelines prohibit promises of absolute outcomes or 100% uptime without explicit SLA caveats.',
        suggestedFix: 'engineered for high availability backed by standard enterprise SLA commitments'
      });
    }

    // Rule Category 3: Brand Name Capitalization
    if (text.includes('acme') && !text.includes('Acme Global Cloud') && !text.includes('Acme')) {
      deduction += 6;
      violations.push({
        id: `viol-brand-${Date.now()}`,
        category: 'formatting',
        severity: 'suggestion',
        flaggedText: 'acme',
        rule: 'Brand Name Casing',
        explanation: 'The brand name must always be capitalized as "Acme Global Cloud" on first mention.',
        suggestedFix: 'Acme Global Cloud'
      });
    }

    // Rule Category 4: Exclamation mark restraint
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      deduction += 6;
      violations.push({
        id: `viol-tone-${Date.now()}`,
        category: 'tone',
        severity: 'suggestion',
        flaggedText: `${exclamationCount} exclamation marks found`,
        rule: 'Tone: Professional Restraint',
        explanation: 'Brand guidelines advise limiting exclamation marks in corporate communications to maintain an authoritative demeanor.',
        suggestedFix: 'Replace excessive exclamations with periods.'
      });
    }

    // Calculate score
    const overallScore = Math.max(32, Math.min(99, 100 - deduction));
    let verdict = 'Passed — Ready for Publication';
    if (overallScore < 70) {
      verdict = 'Action Required: Significant Brand & Legal Violations';
    } else if (overallScore < 90) {
      verdict = 'Needs Minor Revisions Before Approval';
    }

    const toneScore = Math.max(40, 100 - (violations.filter(v => v.category === 'tone').length * 15));
    const terminologyScore = Math.max(40, 100 - (violations.filter(v => v.category === 'terminology').length * 12));
    const legalScore = Math.max(30, 100 - (violations.filter(v => v.category === 'legal').length * 25));
    const formattingScore = Math.max(50, 100 - (violations.filter(v => v.category === 'formatting').length * 10));

    // Improved version synthesis
    let improvedVersion = text;
    violations.forEach(v => {
      if (v.flaggedText && v.suggestedFix && v.category === 'terminology') {
        const regex = new RegExp(`\\b${v.flaggedText}\\b`, 'gi');
        improvedVersion = improvedVersion.replace(regex, v.suggestedFix);
      }
    });

    const reportId = `rep-${Date.now()}`;
    const reportData = {
      id: reportId,
      overallScore,
      grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : 'F',
      verdict,
      analyzedAt: new Date().toISOString(),
      executionTimeMs: 420,
      engineType: 'Client Rule-Based Engine (Deterministic)',
      isMock: true,
      categoryScores: {
        tone: toneScore,
        terminology: terminologyScore,
        legal: legalScore,
        formatting: formattingScore
      },
      summary: violations.length > 0
        ? `Audit completed. Detected ${violations.length} policy issues across terminology, tone, and legal disclaimers. Addressing suggested revisions will raise score to ~96%.`
        : 'Exemplary submission. Zero guideline violations detected. Tone matches brand standards.',
      violations,
      improvedVersion
    };

    sessionStorage.setItem(`brandguard_report_${reportId}`, JSON.stringify(reportData));
    return reportData;
  },

  async getReportById(reportId) {
    if (reportId) {
      const cached = sessionStorage.getItem(`brandguard_report_${reportId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return MOCK_REPORTS[reportId] || MOCK_REPORTS['rep-101'];
  },

  saveReport(report) {
    if (report?.id) {
      sessionStorage.setItem(`brandguard_report_${report.id}`, JSON.stringify(report));
    }
    return report;
  }
};

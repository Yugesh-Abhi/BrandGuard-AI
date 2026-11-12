
import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  ShieldCheck,
  Download,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';

import { supabase } from '../../services/supabaseClient';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

const AUTH_USER_KEY = 'brandguard_auth_user';
const ACTIVE_ORGANISATION_KEY = 'brandguard_active_organisation';

const isDemoSession = () => {
  try {
    const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    return Boolean(user?.isMock);
  } catch {
    return false;
  }
};

const getDateLimit = range => {
  const now = new Date();
  const date = new Date(now);

  if (range === '30d') date.setDate(date.getDate() - 30);
  else if (range === '90d') date.setDate(date.getDate() - 90);
  else if (range === 'ytd') {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  } else {
    return null;
  }

  return date;
};

const getSeverity = severity => {
  const value = String(severity || '').toLowerCase();

  if (value === 'critical' || value === 'high') return 'Critical';
  if (value === 'medium') return 'Medium';
  return 'Low';
};

const formatMonth = date => date.toLocaleDateString('en-US', {
  month: 'short',
  year: '2-digit'
});

const DEMO_ANALYTICS = {
  averageScore: 91.4,
  auditedVolume: 248,
  cleanRate: 78.6,
  totalViolations: 136,

  monthlyTrend: [
    { month: 'Jun', score: 76 },
    { month: 'Jul', score: 81 },
    { month: 'Aug', score: 84 },
    { month: 'Sep', score: 87 },
    { month: 'Oct', score: 89 },
    { month: 'Nov', score: 91 }
  ],

  topViolations: [
    { rule: 'Unapproved terminology', category: 'Terminology', count: 42, severity: 'Critical', percentage: 100 },
    { rule: 'Missing legal disclaimer', category: 'Legal', count: 35, severity: 'Critical', percentage: 83 },
    { rule: 'Inconsistent brand tone', category: 'Tone', count: 28, severity: 'Medium', percentage: 67 },
    { rule: 'Incorrect product naming', category: 'Branding', count: 19, severity: 'Medium', percentage: 45 },
    { rule: 'Formatting inconsistency', category: 'Formatting', count: 12, severity: 'Low', percentage: 29 }
  ],

  departmentBreakdown: [
    { department: 'Marketing', items: 86, score: 94, passingRate: '84%' },
    { department: 'Sales', items: 64, score: 91, passingRate: '79%' },
    { department: 'Product', items: 58, score: 89, passingRate: '76%' },
    { department: 'Communications', items: 40, score: 90, passingRate: '75%' }
  ]
};


const escapeCSV = value =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

const calculateAnalytics = (submissions, reports, violations, range) => {
  const limit = getDateLimit(range);

  const filteredReports = reports.filter(report => {
    const date = new Date(report.created_at);
    return !limit || date >= limit;
  });

  const reportIds = new Set(filteredReports.map(report => report.id));
  const filteredViolations = violations.filter(
    violation => reportIds.has(violation.report_id)
  );

  const submissionMap = new Map(
    submissions.map(submission => [submission.id, submission])
  );

  const averageScore = filteredReports.length
    ? filteredReports.reduce(
        (total, report) => total + Number(report.overall_score || 0),
        0
      ) / filteredReports.length
    : 0;

  const cleanReports = filteredReports.filter(
    report => Number(report.overall_score || 0) >= 80
  ).length;

  const cleanRate = filteredReports.length
    ? (cleanReports / filteredReports.length) * 100
    : 0;

  const departmentMap = new Map();

  filteredReports.forEach(report => {
    const submission = submissionMap.get(report.submission_id);
    const department = submission?.department || 'Unspecified';

    if (!departmentMap.has(department)) {
      departmentMap.set(department, {
        department,
        items: 0,
        totalScore: 0,
        clean: 0
      });
    }

    const item = departmentMap.get(department);
    item.items += 1;
    item.totalScore += Number(report.overall_score || 0);

    if (Number(report.overall_score || 0) >= 80) {
      item.clean += 1;
    }
  });

  const departmentBreakdown = [...departmentMap.values()].map(item => ({
    ...item,
    score: Math.round(item.totalScore / item.items),
    passingRate: `${Math.round((item.clean / item.items) * 100)}%`
  }));

  const violationMap = new Map();

  filteredViolations.forEach(violation => {
    const key = violation.issue_description || violation.category || 'Other';

    if (!violationMap.has(key)) {
      violationMap.set(key, {
        rule: key,
        category: violation.category || 'Other',
        count: 0,
        severity: getSeverity(violation.severity)
      });
    }

    violationMap.get(key).count += 1;
  });

  const topViolations = [...violationMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maximumViolationCount = Math.max(
    1,
    ...topViolations.map(item => item.count)
  );

  topViolations.forEach(item => {
    item.percentage = Math.round(
      (item.count / maximumViolationCount) * 100
    );
  });

  const monthlyMap = new Map();

  filteredReports.forEach(report => {
    const date = new Date(report.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: formatMonth(date),
        total: 0,
        count: 0
      });
    }

    const item = monthlyMap.get(key);
    item.total += Number(report.overall_score || 0);
    item.count += 1;
  });

  const monthlyTrend = [...monthlyMap.values()]
    .map(item => ({
      month: item.month,
      score: Math.round(item.total / item.count)
    }))
    .slice(-6);

  return {
    averageScore,
    auditedVolume: filteredReports.length,
    cleanRate,
    totalViolations: filteredViolations.length,
    monthlyTrend,
    topViolations,
    departmentBreakdown
  };
};

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('90d');
  const [toastMessage, setToastMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const demo = isDemoSession();

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      if (demo) {
        setAnalytics({ demo: true, data: null });
        return;
      }

      const organisationId = localStorage.getItem(
        ACTIVE_ORGANISATION_KEY
      );

      if (!organisationId) {
        throw new Error('No active organisation selected.');
      }

      const {
        data: submissions,
        error: submissionError
      } = await supabase
        .from('content_submissions')
        .select(
          'id, organisation_id, department, channel, created_at'
        )
        .eq('organisation_id', organisationId);

      if (submissionError) throw submissionError;

      const submissionIds = (submissions || []).map(item => item.id);

      if (!submissionIds.length) {
        setAnalytics({
          demo: false,
          data: calculateAnalytics([], [], [], timeRange)
        });
        return;
      }

      const {
        data: reports,
        error: reportError
      } = await supabase
        .from('compliance_reports')
        .select('*')
        .in('submission_id', submissionIds)
        .order('created_at', { ascending: true });

      if (reportError) throw reportError;

      const reportIds = (reports || []).map(item => item.id);

      let violations = [];

      if (reportIds.length) {
        const {
          data,
          error: violationError
        } = await supabase
          .from('compliance_violations')
          .select('*')
          .in('report_id', reportIds);

        if (violationError) throw violationError;

        violations = data || [];
      }

      setAnalytics({
        demo: false,
        data: calculateAnalytics(
          submissions || [],
          reports || [],
          violations,
          timeRange
        )
      });
    } catch (err) {
      console.error('Analytics loading failed:', err);
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const displayedData = useMemo(() => {
    if (analytics?.demo) {
      return null;
    }

    return analytics?.data || null;
  }, [analytics]);

  const handleExportCSV = () => {
    if (!displayedData) {
      setError('There is no real analytics data available to export.');
      return;
    }

    const rows = [
      ['Metric', 'Value'],
      ['Average Compliance Score', `${displayedData.averageScore.toFixed(1)}%`],
      ['Audited Submissions', displayedData.auditedVolume],
      ['First-Pass Clean Rate', `${displayedData.cleanRate.toFixed(1)}%`],
      ['Total Violations', displayedData.totalViolations],
      [],
      ['Top Violations', 'Category', 'Count', 'Severity'],
      ...displayedData.topViolations.map(item => [
        item.rule,
        item.category,
        item.count,
        item.severity
      ]),
      [],
      ['Department', 'Audited Assets', 'Health Index', 'Pass Rate'],
      ...displayedData.departmentBreakdown.map(item => [
        item.department,
        item.items,
        `${item.score}%`,
        item.passingRate
      ])
    ];

    const csv = rows
      .map(row => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `BrandGuard-Analytics-${timeRange}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setToastMessage('Analytics CSV exported successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-slate-400">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading analytics from your workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5">
        <p className="font-semibold text-rose-300">Analytics could not load</p>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={loadAnalytics}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    );
  }

  
if (analytics?.demo) {
  const data = DEMO_ANALYTICS;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Enterprise Brand Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Brand compliance performance overview.
          </p>
        </div>
        <Badge variant="info">Demo Sample Data</Badge>
      </div>

      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-purple-200">
        <ShieldCheck className="mr-2 inline h-4 w-4" />
        Illustrative demo metrics for exploring BrandGuard AI.
        These are not live customer statistics.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Compliance Score"
          value={`${data.averageScore}%`}
          icon={ShieldCheck}
          accentColor="purple"
        />
        <StatCard
          title="Audited Reports"
          value={data.auditedVolume.toLocaleString()}
          icon={TrendingUp}
          accentColor="cyan"
        />
        <StatCard
          title="First-Pass Clean Rate"
          value={`${data.cleanRate}%`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Detected Violations"
          value={data.totalViolations}
          icon={AlertTriangle}
          accentColor="amber"
        />
      </div>

      <Card padding="p-6">
        <CardHeader>
          <div>
            <CardTitle icon={TrendingUp}>
              Monthly Compliance Score Trend
            </CardTitle>
            <CardDescription>
              Illustrative average compliance scores over six months.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="flex h-64 items-end justify-between gap-3 border-b border-[#182142] px-2 pb-2 pt-6">
          {data.monthlyTrend.map(item => (
            <div
              key={item.month}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs text-slate-300">
                {item.score}%
              </span>
              <div className="flex h-48 w-full max-w-[48px] items-end overflow-hidden rounded-t-xl bg-[#141C38] p-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-purple-700 to-purple-400"
                  style={{ height: `${item.score}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={AlertTriangle}>
                Top 5 Recurring Violations
              </CardTitle>
              <CardDescription>
                Most frequently detected sample issues.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            {data.topViolations.map((item, index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-[#161D3A] bg-[#090D1C] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">
                    {item.rule}
                  </span>
                  <Badge variant={item.severity.toLowerCase()}>
                    {item.severity}
                  </Badge>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{item.category}</span>
                  <span>{item.count} occurrences</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#161E38]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-rose-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={Users}>
                Department Compliance Scorecard
              </CardTitle>
              <CardDescription>
                Sample departmental performance.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2346] text-[10px] uppercase text-slate-400">
                  <th className="px-2 pb-3">Department</th>
                  <th className="px-2 pb-3">Reports</th>
                  <th className="px-2 pb-3">Score</th>
                  <th className="px-2 pb-3 text-right">Clean rate</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#151D3A]">
                {data.departmentBreakdown.map(item => (
                  <tr key={item.department}>
                    <td className="px-2 py-3 font-semibold text-slate-200">
                      {item.department}
                    </td>
                    <td className="px-2 py-3 text-slate-400">
                      {item.items}
                    </td>
                    <td className="px-2 py-3 font-bold text-purple-400">
                      {item.score}%
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-emerald-400">
                      {item.passingRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-500">
        Demo figures are illustrative and are separate from real workspace analytics.
      </p>
    </div>
  );
}


  const data = displayedData;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 border-b border-[#1A2346] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Enterprise Brand Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Actual compliance activity from your Supabase workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              {toastMessage}
            </span>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-[#192348] bg-[#0B0F20] p-1">
            {['30d', '90d', 'ytd', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#1D274D] bg-[#0D142B] p-3 text-xs text-slate-400">
        <Calendar className="h-4 w-4 text-purple-400" />
        Live workspace data · {timeRange.toUpperCase()} ·
        {data.auditedVolume} audited reports
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Compliance Score"
          value={`${data.averageScore.toFixed(1)}%`}
          icon={ShieldCheck}
          accentColor="purple"
        />
        <StatCard
          title="Audited Reports"
          value={data.auditedVolume.toLocaleString()}
          icon={TrendingUp}
          accentColor="cyan"
        />
        <StatCard
          title="First-Pass Clean Rate"
          value={`${data.cleanRate.toFixed(1)}%`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Detected Violations"
          value={data.totalViolations.toLocaleString()}
          icon={AlertTriangle}
          accentColor="amber"
        />
      </div>

      <Card padding="p-6">
        <CardHeader>
          <div>
            <CardTitle icon={TrendingUp}>
              Monthly Compliance Score Trend
            </CardTitle>
            <CardDescription>
              Average scores from saved compliance reports.
            </CardDescription>
          </div>
        </CardHeader>

        {data.monthlyTrend.length ? (
          <div className="flex h-64 items-end justify-between gap-3 border-b border-[#182142] px-2 pb-2 pt-6">
            {data.monthlyTrend.map((item, index) => (
              <div
                key={`${item.month}-${index}`}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-[10px] text-slate-400">
                  {item.score}%
                </span>
                <div className="flex h-48 w-full max-w-[48px] items-end overflow-hidden rounded-t-xl bg-[#141C38] p-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-purple-700 to-purple-400"
                    style={{
                      height: `${Math.max(2, item.score)}%`
                    }}
                  />
                </div>
                <span className="text-xs text-slate-300">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            No compliance reports found for this timeframe.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={AlertTriangle}>
                Top 5 Recurring Violations
              </CardTitle>
              <CardDescription>
                Issues recorded in saved compliance reports.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            {data.topViolations.length ? (
              data.topViolations.map((item, index) => (
                <div
                  key={`${item.rule}-${index}`}
                  className="space-y-2 rounded-xl border border-[#161D3A] bg-[#090D1C] p-3"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-white">
                      {item.rule}
                    </span>
                    <Badge variant={item.severity.toLowerCase()}>
                      {item.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{item.category}</span>
                    <span>{item.count} occurrences</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#161E38]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-rose-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No violations recorded in this timeframe.
              </p>
            )}
          </div>
        </Card>

        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={Users}>
                Department Compliance Scorecard
              </CardTitle>
              <CardDescription>
                Scores calculated from saved reports.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2346] text-[10px] uppercase text-slate-400">
                  <th className="px-2 pb-3">Department</th>
                  <th className="px-2 pb-3">Reports</th>
                  <th className="px-2 pb-3">Score</th>
                  <th className="px-2 pb-3 text-right">Clean rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D3A]">
                {data.departmentBreakdown.map(item => (
                  <tr key={item.department}>
                    <td className="px-2 py-3 font-semibold text-slate-200">
                      {item.department}
                    </td>
                    <td className="px-2 py-3 text-slate-400">
                      {item.items}
                    </td>
                    <td className="px-2 py-3 font-bold text-purple-400">
                      {item.score}%
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-emerald-400">
                      {item.passingRate}
                    </td>
                  </tr>
                ))}
                {!data.departmentBreakdown.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-500"
                    >
                      No department data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-500">
        Clean rate is calculated as reports with a compliance score of at least 80%.
        Statistics reflect saved reports, not estimated or projected values.
      </p>
    </div>
  );
};

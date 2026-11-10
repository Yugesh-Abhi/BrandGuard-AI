import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  ShieldCheck,
  Download,
  Calendar,
  Layers,
  Filter,
  Check
} from 'lucide-react';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('90d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const { monthlyTrend, topViolations, departmentBreakdown, channelDistribution } = MOCK_ANALYTICS;

  // Timeframe multiplier for dynamic data changes
  const multiplier = timeRange === '30d' ? 0.35 : timeRange === '90d' ? 1.0 : timeRange === 'ytd' ? 3.2 : 4.5;
  const baseVolume = Math.round(1482 * multiplier);
  const avgScore = timeRange === '30d' ? 95.4 : timeRange === '90d' ? 94.2 : timeRange === 'ytd' ? 91.8 : 89.6;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Department,Audited Assets,Health Index,Pass Rate\n';
    departmentBreakdown.forEach((d) => {
      csvContent += `"${d.department}",${d.items},${d.score}%,${d.passingRate}\n`;
    });
    csvContent += '\nRule,Category,Count,Severity\n';
    topViolations.forEach((v) => {
      csvContent += `"${v.rule}","${v.category}",${v.count},"${v.severity}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BrandGuard-Analytics-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setToastMessage('Exported Analytics CSV successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2346]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Brand Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Governance score velocity, recurring violation frequency, and department compliance across all channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> {toastMessage}
            </span>
          )}

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0F20] border border-[#192348]">
            {['30d', '90d', 'ytd', 'all'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-all cursor-pointer ${
                  timeRange === t ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="text-xs"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-3 rounded-xl bg-[#0D142B] border border-[#1D274D] flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Showing aggregated metrics for timeframe: <strong className="text-slate-200 uppercase">{timeRange}</strong> (Demo Dataset).</span>
        </span>
        <span className="font-mono text-purple-300 font-semibold text-[11px]">
          Sample Data Label
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Compliance Score"
          value={`${avgScore}%`}
          trend={{ value: '+4.8%', direction: 'up', label: 'vs previous period' }}
          icon={ShieldCheck}
          accentColor="purple"
        />
        <StatCard
          title="Audited Copy Volume"
          value={baseVolume.toLocaleString()}
          trend={{ value: '+26%', direction: 'up', label: 'throughput velocity' }}
          icon={TrendingUp}
          accentColor="cyan"
        />
        <StatCard
          title="First-Pass Clean Rate"
          value="78.4%"
          trend={{ value: '+8.2%', direction: 'up', label: 'fewer revisions needed' }}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Avg Review Turnaround"
          value="1.4 hrs"
          trend={{ value: '-35%', direction: 'down', label: 'faster sign-off speed' }}
          icon={BarChart3}
          accentColor="amber"
        />
      </div>

      {/* Monthly Trend Chart */}
      <Card padding="p-6">
        <CardHeader>
          <div>
            <CardTitle icon={TrendingUp}>Monthly Compliance Score Velocity</CardTitle>
            <CardDescription>Brand health progression as automated guidelines took effect across departments.</CardDescription>
          </div>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2.5 py-1 rounded-lg">
            Velocity: +13.0 pts
          </span>
        </CardHeader>

        {/* Visual CSS Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-[#182142]">
          {monthlyTrend.map((m, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[10px] font-mono text-slate-400 group-hover:text-purple-300 transition-colors">
                {m.score}%
              </div>
              <div className="w-full max-w-[48px] h-48 rounded-t-xl bg-[#141C38] overflow-hidden flex flex-col justify-end p-1 relative">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-purple-700 via-indigo-600 to-purple-400 transition-all duration-700 group-hover:from-purple-600 group-hover:to-indigo-300"
                  style={{ height: `${(m.score - 50) * 2}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-1">{m.month}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Split: Top Recurring Violations & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top Violations */}
        <div className="lg:col-span-6">
          <Card padding="p-6" className="h-full">
            <CardHeader>
              <div>
                <CardTitle icon={AlertTriangle}>Top 5 Recurring Policy Violations</CardTitle>
                <CardDescription>Most frequently detected breaches in writer drafts.</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-4 pt-1">
              {topViolations.map((v, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#090D1C] border border-[#161D3A] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{v.rule}</span>
                    <Badge variant={v.severity}>{v.severity}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Category: {v.category}</span>
                    <span className="font-mono text-purple-300 font-semibold">{v.count} occurrences ({v.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#161E38] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-rose-500"
                      style={{ width: `${v.percentage * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Department Compliance Scorecard */}
        <div className="lg:col-span-6">
          <Card padding="p-6" className="h-full">
            <CardHeader>
              <div>
                <CardTitle icon={Users}>Department Brand Scorecard</CardTitle>
                <CardDescription>Adherence rates across corporate teams.</CardDescription>
              </div>
            </CardHeader>

            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1A2346] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-2">Department</th>
                    <th className="pb-3 px-2">Audited Assets</th>
                    <th className="pb-3 px-2">Health Index</th>
                    <th className="pb-3 px-2 text-right">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151D3A]">
                  {departmentBreakdown.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#0E152E] transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-200">{d.department}</td>
                      <td className="py-3 px-2 text-slate-400 font-mono">{Math.round(d.items * multiplier)}</td>
                      <td className="py-3 px-2">
                        <span className="font-bold font-mono text-purple-400">{d.score}%</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-emerald-400 font-semibold">{d.passingRate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

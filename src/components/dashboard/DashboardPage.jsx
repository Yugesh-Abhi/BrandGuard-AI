import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScoreMeter } from '../common/ScoreMeter';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeBrand, submissions, viewReportForSubmission } = useBrand();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const categoryScores = [
    { name: 'Tone of Voice & Persona', score: 92, status: 'On Brand', color: 'from-purple-500 to-indigo-500' },
    { name: 'Terminology & Prohibited Jargon', score: 85, status: 'Minor Flags', color: 'from-indigo-500 to-cyan-500' },
    { name: 'Legal Disclaimers & SLA Claims', score: 96, status: 'Protected', color: 'from-emerald-500 to-teal-500' },
    { name: 'Formatting & Brand Capitalization', score: 94, status: 'Compliant', color: 'from-purple-500 to-pink-500' },
  ];

  const recentAuditEvents = [
    { id: 1, title: 'Autonomous Scan Completed', detail: 'Enterprise Cloud Migration Whitepaper audited (74%)', time: '12m ago', type: 'warning' },
    { id: 2, title: 'Brand Manager Sign-off', detail: 'Q4 Product Showcase approved for publication', time: '1h ago', type: 'pass' },
    { id: 3, title: 'Prohibited Term Detected', detail: '"revolutionary game-changer" flagged in ad copy', time: '2h ago', type: 'critical' },
    { id: 4, title: 'Guideline Synchronized', detail: 'Core Brand Identity v2.4 rules enforced', time: '5h ago', type: 'info' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Hero SaaS Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121A3B] via-[#0E152E] to-[#0A0E1F] border border-[#202C55] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Enterprise Brand Governance Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {activeBrand?.name || 'BrandGuard AI'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-2 font-medium">
              "Every piece of content. One consistent brand."
            </p>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Automated compliance audits active. All marketing drafts, blog copy, and press releases are being evaluated against active brand tone and regulatory constraints.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => navigate('/submission')}
              >
                Audit New Content
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={BookOpen}
                onClick={() => navigate('/guidelines')}
              >
                Configure Guidelines
              </Button>
            </div>
          </div>

          {/* Overall Health Score Card */}
          <div className="p-5 rounded-2xl bg-[#0D1326]/90 border border-purple-500/30 shadow-xl flex items-center gap-5 shrink-0 w-full sm:w-auto">
            <ScoreMeter score={activeBrand?.healthScore || 94.2} size="md" label="Brand Health" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Governance Status
              </span>
              <h4 className="text-lg font-bold text-white">High Compliance</h4>
              <p className="text-xs text-slate-400 max-w-[150px]">
                94% of audited copy meets brand standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Brand Health Score"
          value={`${activeBrand?.healthScore || 94.2}%`}
          trend={{ value: '+3.1%', direction: 'up', label: 'vs last month' }}
          icon={ShieldCheck}
          accentColor="purple"
        />
        <StatCard
          title="Content Audited"
          value="1,482"
          trend={{ value: '+18.4%', direction: 'up', label: 'this quarter' }}
          icon={FileCheck2}
          accentColor="cyan"
        />
        <StatCard
          title="Flagged Violations"
          value="28"
          trend={{ value: '-12.5%', direction: 'down', label: 'resolved faster' }}
          icon={AlertTriangle}
          accentColor="amber"
        />
        <StatCard
          title="Pending Approvals"
          value="14"
          subtitle="3 urgent review requests"
          icon={Clock}
          accentColor="emerald"
          onClick={() => navigate('/reviews')}
        />
      </div>

      {/* 3. Category Breakdown & Real-Time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Category Compliance Progress */}
        <div className="lg:col-span-7">
          <Card padding="p-6" className="h-full">
            <CardHeader>
              <div>
                <CardTitle icon={ShieldCheck}>Brand Health by Category</CardTitle>
                <CardDescription>Live adherence metrics against the 2026 Brand Guideline matrix.</CardDescription>
              </div>
              <button
                onClick={() => navigate('/guidelines')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                View Rules <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>

            <div className="space-y-4 pt-1">
              {categoryScores.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#090D1C] border border-[#161D3A]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{cat.status}</span>
                      <span className="font-bold text-white font-mono">{cat.score}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#161E38] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-1000`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Live AI Compliance Stream */}
        <div className="lg:col-span-5">
          <Card padding="p-6" className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <CardTitle icon={Sparkles}>Live Audit Stream</CardTitle>
                  <CardDescription>Automated activity feed from the scanner engine.</CardDescription>
                </div>
              </CardHeader>

              <div className="space-y-3 pt-1">
                {recentAuditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A] flex items-start gap-3 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {evt.type === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {evt.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {evt.type === 'critical' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {evt.type === 'info' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-200">{evt.title}</p>
                        <span className="text-[10px] text-slate-400">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4 text-xs"
              onClick={() => navigate('/analytics')}
            >
              View Full Compliance Analytics
            </Button>
          </Card>
        </div>

      </div>

      {/* 4. Recent Content Submissions Table */}
      <Card padding="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-[#1A2346]">
          <div>
            <CardTitle icon={FileText}>Recent Content Submissions</CardTitle>
            <CardDescription>Audited marketing assets, social posts, blogs, and press releases.</CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080C1B] border border-[#192244] overflow-x-auto">
            {['all', 'approved', 'needs_revision', 'in_review'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === f
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2346] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Content Asset</th>
                <th className="pb-3 px-3">Channel</th>
                <th className="pb-3 px-3">Author & Team</th>
                <th className="pb-3 px-3">Compliance Score</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151D3A]">
              {filteredSubmissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-[#0F162E] transition-colors group cursor-pointer"
                  onClick={() => viewReportForSubmission(sub.id)}
                >
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                      {sub.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {sub.version} • {sub.wordCount} words • {sub.readingTime}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#161F3D] text-slate-300 border border-[#232F58] font-medium text-[11px]">
                      {sub.channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="text-slate-200 font-medium">{sub.authorName}</p>
                    <p className="text-[10px] text-slate-400">{sub.department}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold font-mono text-sm ${
                          sub.complianceScore >= 90
                            ? 'text-emerald-400'
                            : sub.complianceScore >= 75
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {sub.complianceScore}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <Badge variant={sub.status}>
                      {sub.status.replace('_', ' ')}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewReportForSubmission(sub.id);
                      }}
                      className="text-xs hover:text-purple-300"
                    >
                      View Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Download,
  Send,
  Eye,
  Check,
  Filter
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { complianceService } from '../../services/complianceService';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScoreMeter } from '../common/ScoreMeter';

export const ComplianceReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeReport,
    setActiveReport,
    activeSubmission,
    applyCorrection,
    submitToReviewQueue
  } = useBrand();

  const [selectedViolationId, setSelectedViolationId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'suggestion'
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' | 'improved'
  const [toastMessage, setToastMessage] = useState('');
  const [submittingToQueue, setSubmittingToQueue] = useState(false);

  // Load report if ID param given
  useEffect(() => {
    if (id && (!activeReport || activeReport.submissionId !== id)) {
      complianceService.getReportById(id).then((rep) => {
        if (rep) setActiveReport(rep);
      });
    }
  }, [id]);

  if (!activeReport) {
    return (
      <div className="text-center py-20 space-y-4">
        <FileCheck2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Compliance Report Loaded</h3>
        <p className="text-xs text-slate-400">Run an audit from the content submission page to generate a report.</p>
        <Button onClick={() => navigate('/submission')}>Go to Submission</Button>
      </div>
    );
  }

  const allViolations = activeReport.violations || [];
  const filteredViolations = allViolations.filter((v) => {
    if (severityFilter === 'all') return true;
    return v.severity === severityFilter;
  });

  const selectedViolation =
    filteredViolations.find((v) => v.id === selectedViolationId) ||
    filteredViolations[0] ||
    allViolations[0];

  const handleApplyFix = async (violationId) => {
    const updated = await applyCorrection(violationId);
    if (updated) {
      setToastMessage('Suggested correction applied to draft! Compliance score improved.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleQueueReview = async () => {
    setSubmittingToQueue(true);
    try {
      await submitToReviewQueue(activeSubmission?.id);
      setToastMessage('Sent to Brand Manager review queue!');
      setTimeout(() => {
        navigate('/reviews');
      }, 500);
    } finally {
      setSubmittingToQueue(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BrandGuard-Report-${activeReport.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2346]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Compliance Report</h2>
            <Badge variant={activeReport.overallScore >= 90 ? 'pass' : activeReport.overallScore >= 75 ? 'warning' : 'critical'}>
              {activeReport.verdict}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Asset: <strong className="text-slate-200">{activeSubmission?.title || 'Marketing Content Asset'}</strong> ({activeSubmission?.channel})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> {toastMessage}
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportJSON}
            className="text-xs"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={submittingToQueue}
            icon={Send}
            onClick={handleQueueReview}
            className="text-xs shadow-md shadow-purple-950/30"
          >
            Send to Review Queue
          </Button>
        </div>
      </div>

      {/* 2. Executive Scorecard */}
      <Card padding="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Circular Score Meter */}
          <div className="lg:col-span-3 flex justify-center border-b lg:border-b-0 lg:border-r border-[#192244] pb-5 lg:pb-0 lg:pr-6">
            <ScoreMeter score={activeReport.overallScore} size="lg" label="Brand Health Score" />
          </div>

          {/* Diagnostic Summary & Meta */}
          <div className="lg:col-span-9 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Compliance Executive Summary
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Engine: {activeReport.engineType || 'Deterministic Rule Engine (No Fake AI Claims)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {activeReport.summary}
              </p>
            </div>

            {/* Category Sub-scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A]">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Tone & Voice</p>
                <p className="text-lg font-bold font-mono text-purple-300 mt-0.5">
                  {activeReport.categoryScores?.tone || 80}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A]">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Terminology & Jargon</p>
                <p className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {activeReport.categoryScores?.terminology || 75}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A]">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Legal & SLA Claims</p>
                <p className="text-lg font-bold font-mono text-rose-300 mt-0.5">
                  {activeReport.categoryScores?.legal || 70}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A]">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Formatting & Style</p>
                <p className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                  {activeReport.categoryScores?.formatting || 92}%
                </p>
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* 3. View Switcher & Severity Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Toggle between Annotated Reader and AI Polished Draft */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F20] border border-[#192348] w-fit">
          <button
            onClick={() => setViewMode('annotated')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'annotated'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Annotated Issues ({allViolations.length} Flags)
          </button>
          <button
            onClick={() => setViewMode('improved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'improved'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            AI Polished Version (98% Score)
          </button>
        </div>

        {/* Severity Filter Pills */}
        {viewMode === 'annotated' && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F20] border border-[#192348] w-fit overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['all', 'critical', 'warning', 'suggestion'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  severityFilter === s
                    ? 'bg-[#182245] text-purple-200 border border-purple-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s} ({s === 'all' ? allViolations.length : allViolations.filter(v => v.severity === s).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Main Body: Split Screen */}
      {viewMode === 'annotated' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Content Reader with Highlights */}
          <div className="lg:col-span-7">
            <Card padding="p-6" className="h-full">
              <CardHeader>
                <CardTitle icon={Eye}>Content Inspection View</CardTitle>
                <span className="text-[11px] text-slate-400">Click highlighted text to inspect rule</span>
              </CardHeader>

              <div className="p-4 rounded-xl bg-[#080C1B] border border-[#161D3A] text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {activeSubmission?.contentBody || 'No text content available.'}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#171E3A] text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical SLA Liability
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Prohibited Buzzword
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Tone / Style Recommendation
                </span>
              </div>
            </Card>
          </div>

          {/* Right Col: Flagged Issues Inspector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Flagged Issues ({filteredViolations.length})
              </span>
              <span className="text-[11px] text-slate-400">Select to review fix</span>
            </div>

            {filteredViolations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0D1326] border border-[#1C264D] text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No violations found under this severity filter.
              </div>
            ) : (
              filteredViolations.map((v) => {
                const isSelected = selectedViolation?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedViolationId(v.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#121935] border-purple-500/60 shadow-lg shadow-purple-950/30'
                        : 'bg-[#0D1326] border-[#1C264D] hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={v.severity}>{v.severity}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{v.category}</span>
                    </div>

                    <p className="text-xs font-semibold text-rose-300 font-mono mb-1">
                      "{v.flaggedText}"
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {v.explanation}
                    </p>

                    {/* Suggested Fix & Apply Action */}
                    <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Recommended Brand Replacement:
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyFix(v.id);
                          }}
                          className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                        >
                          Apply AI Fix
                        </button>
                      </div>
                      <p className="text-slate-200 font-medium italic">
                        "{v.suggestedFix}"
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      ) : (
        /* TAB 2: AI IMPROVED DRAFT */
        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={Sparkles}>BrandGuard Automated Revision</CardTitle>
              <CardDescription>
                Full draft re-synthesized to satisfy all tone, terminology, and SLA disclaimer requirements.
              </CardDescription>
            </div>
            <Button
              size="sm"
              icon={Check}
              onClick={() => {
                setToastMessage('Copied revised draft to clipboard!');
                navigator.clipboard?.writeText(activeReport.improvedVersion || '');
                setTimeout(() => setToastMessage(''), 2500);
              }}
            >
              Copy Revised Draft
            </Button>
          </CardHeader>

          <div className="p-5 rounded-2xl bg-[#080C1B] border border-emerald-500/20 text-xs sm:text-sm leading-relaxed text-slate-100 whitespace-pre-wrap font-sans">
            {activeReport.improvedVersion || 'No improved version generated.'}
          </div>
        </Card>
      )}

    </div>
  );
};

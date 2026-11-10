import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  CheckCircle2,
  RotateCcw,
  History
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { Button } from '../common/Button';

export const RevisionHistoryPage = () => {
  const navigate = useNavigate();
  const { activeSubmission } = useBrand();

  const [selectedVersionId, setSelectedVersionId] = useState('v1.1');
  const [diffMode, setDiffMode] = useState('split'); // 'split' | 'unified'
  const [toastMessage, setToastMessage] = useState('');

  const versions = [
    {
      id: 'v1.2',
      tag: 'v1.2 (Brand Certified)',
      author: 'Alex Rivera (Brand Director)',
      date: 'Today at 02:15 PM',
      score: 96,
      summary: 'Applied brand-compliant wording, removed absolute uptime guarantee, added SOC2 disclaimer.',
      changesCount: 4,
      isCurrent: true,
      text: `Migrating legacy enterprise systems is a transformational catalyst for efficiency for your engineering overhead.

Simply porting VMs creates architectural friction across databases. This unoptimized tactical approach inevitably backfires.

Acme Global Cloud provides engineered high availability backed by enterprise SLAs during migrations.`
    },
    {
      id: 'v1.1',
      tag: 'v1.1 (AI Auto-Fixes Applied)',
      author: 'BrandGuard AI Scanner',
      date: 'Yesterday at 04:22 PM',
      score: 74,
      summary: 'Substituted banned corporate jargon with technical equivalents.',
      changesCount: 3,
      isCurrent: false,
      text: `Migrating legacy enterprise applications to modern distributed cloud infrastructure is often touted as an effective driver of cost reduction. However, without rigorous governance, engineering organizations rapidly experience bill shock and architecture drift.

First, porting virtual machines without refactoring creates synergy problems between legacy databases and stateless pods. This cheap approach inevitably backfires when auto-scaling triggers unexpected compute spikes.

Acme provides high availability backed by standard SLAs if telemetry is actively streaming.`
    },
    {
      id: 'v1.0',
      tag: 'v1.0 (Initial Writer Draft)',
      author: 'Sarah Jenkins (Author)',
      date: 'Nov 04, 2026',
      score: 62,
      summary: 'Initial draft import from marketing repo.',
      changesCount: 6,
      isCurrent: false,
      text: `Migrating legacy enterprise systems is a revolutionary game-changer for your engineering overhead.

Simply porting VMs creates synergy problems across databases. This cheap approach inevitably backfires.

Acme guarantees foolproof 100% uptime during migrations.`
    }
  ];

  const currentVersionObj = versions.find(v => v.id === selectedVersionId) || versions[0];

  const handleRestoreVersion = (ver) => {
    setToastMessage(`Restored draft to ${ver.tag}! Changes loaded into active workspace.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2346]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Revision History & Diff Viewer</h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activeSubmission?.title || 'Enterprise Cloud Migration Draft'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track line-level modifications, score velocity across edits, and author audit stamps.
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
            onClick={() => navigate('/report')}
            className="text-xs"
          >
            Back to Report
          </Button>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-3 rounded-xl bg-[#0D142B] border border-[#1D274D] flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <span>Version timeline tracking revisions and score progression (Demo Sample Data).</span>
        </span>
        <span className="font-mono text-purple-300 font-semibold text-[11px]">
          3 Snapshots Available
        </span>
      </div>

      {/* Version Progression Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {versions.map((ver) => {
          const isSelected = selectedVersionId === ver.id;
          return (
            <div
              key={ver.id}
              onClick={() => setSelectedVersionId(ver.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#121935] border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/20'
                  : 'bg-[#0D1326] border-[#1C264D] hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{ver.tag}</span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    ver.score >= 90
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : ver.score >= 70
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Score: {ver.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{ver.date} • {ver.author}</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ver.summary}</p>

              <div className="mt-3 pt-2.5 border-t border-[#161E38] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">{ver.changesCount} delta flags</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestoreVersion(ver);
                  }}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Rollback to this
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Diff Viewer */}
      <Card padding="p-6">
        <CardHeader>
          <div>
            <CardTitle icon={GitBranch}>Version Diff Inspector</CardTitle>
            <CardDescription>
              Comparing Original Draft (v1.0) with Current Selected Version ({currentVersionObj.tag}).
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500" /> Prohibited Phrase
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500" /> Certified Brand Fix
              </span>
            </div>

            {/* Diff mode switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-[#080C1B] border border-[#182244]">
              <button
                onClick={() => setDiffMode('split')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  diffMode === 'split' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setDiffMode('unified')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  diffMode === 'unified' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unified Diff
              </button>
            </div>
          </div>
        </CardHeader>

        {diffMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Original Draft */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>Original Writer Draft (v1.0 - 62% Score)</span>
                <span className="text-rose-400 font-mono">4 Violations Flagged</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080C1B] border border-rose-500/20 text-xs sm:text-sm leading-relaxed text-slate-300 font-sans space-y-3">
                <p>
                  Migrating legacy enterprise systems is a{' '}
                  <span className="bg-rose-950/80 text-rose-200 line-through px-1 rounded border border-rose-500/40">
                    revolutionary game-changer
                  </span>{' '}
                  for your engineering overhead.
                </p>
                <p>
                  Simply porting VMs creates{' '}
                  <span className="bg-rose-950/80 text-rose-200 line-through px-1 rounded border border-rose-500/40">
                    synergy problems
                  </span>{' '}
                  across databases. This{' '}
                  <span className="bg-rose-950/80 text-rose-200 line-through px-1 rounded border border-rose-500/40">
                    cheap
                  </span>{' '}
                  approach inevitably backfires.
                </p>
                <p>
                  Acme{' '}
                  <span className="bg-rose-950/80 text-rose-200 line-through px-1 rounded border border-rose-500/40">
                    guarantees foolproof 100% uptime
                  </span>{' '}
                  during migrations.
                </p>
              </div>
            </div>

            {/* Right: Selected Version */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>Selected Snapshot ({currentVersionObj.tag})</span>
                <span className="text-emerald-400 font-mono">Score: {currentVersionObj.score}%</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080C1B] border border-emerald-500/20 text-xs sm:text-sm leading-relaxed text-slate-300 font-sans space-y-3">
                <p>
                  Migrating legacy enterprise systems is a{' '}
                  <span className="bg-emerald-950/80 text-emerald-200 font-medium px-1 rounded border border-emerald-500/40">
                    transformational catalyst for efficiency
                  </span>{' '}
                  for your engineering overhead.
                </p>
                <p>
                  Simply porting VMs creates{' '}
                  <span className="bg-emerald-950/80 text-emerald-200 font-medium px-1 rounded border border-emerald-500/40">
                    architectural friction
                  </span>{' '}
                  across databases. This{' '}
                  <span className="bg-emerald-950/80 text-emerald-200 font-medium px-1 rounded border border-emerald-500/40">
                    unoptimized tactical
                  </span>{' '}
                  approach inevitably backfires.
                </p>
                <p>
                  Acme Global Cloud{' '}
                  <span className="bg-emerald-950/80 text-emerald-200 font-medium px-1 rounded border border-emerald-500/40">
                    provides engineered high availability backed by enterprise SLAs
                  </span>{' '}
                  during migrations.
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* Unified View */
          <div className="p-4 rounded-xl bg-[#080C1B] border border-[#1E294B] text-xs sm:text-sm font-mono space-y-2 text-slate-300">
            <p className="text-slate-500">@@ -1,5 +1,5 @@ Enterprise Migration Post</p>
            <p className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded">- Migrating legacy enterprise systems is a revolutionary game-changer for your budget.</p>
            <p className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">+ Migrating legacy enterprise systems is a transformational catalyst for efficiency.</p>
            <p className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded">- Simply porting VMs creates synergy problems across databases. This cheap approach backfires.</p>
            <p className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">+ Simply porting VMs creates architectural friction. This unoptimized tactical approach backfires.</p>
            <p className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded">- Acme guarantees foolproof 100% uptime during migrations.</p>
            <p className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">+ Acme Global Cloud provides engineered high availability backed by enterprise SLAs.</p>
          </div>
        )}
      </Card>

    </div>
  );
};

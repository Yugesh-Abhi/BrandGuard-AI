import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanEye,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Clock,
  Terminal,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ComplianceAnalysisPage = () => {
  const navigate = useNavigate();
  const { isScanning: contextScanning, activeSubmission, activeReport, runAuditOnText, activeBrand, guidelines } = useBrand();

  const [localScanning, setLocalScanning] = useState(contextScanning);
  const [currentProgress, setCurrentProgress] = useState(contextScanning ? 40 : 100);
  const [scanLogs, setScanLogs] = useState([
    { time: '14:22:01', level: 'INFO', text: 'Initializing BrandGuard tokenizer & grammar parser...' },
    { time: '14:22:02', level: 'PASS', text: 'Target channel identified: Blog Post / Technical Article' },
    { time: '14:22:03', level: 'WARN', text: 'Prohibited phrase detected: "revolutionary game-changer" (Rule #102)' },
    { time: '14:22:04', level: 'WARN', text: 'Vague jargon detected: "synergy problems" (Rule #104)' },
    { time: '14:22:05', level: 'CRIT', text: 'Absolute uptime claim detected: "guarantees foolproof 100% uptime"' },
    { time: '14:22:06', level: 'INFO', text: 'Synthesizing line-level suggestions & computing final Brand Health index...' },
    { time: '14:22:07', level: 'DONE', text: 'Scan completed. Generated compliance report with 5 actionable revisions.' }
  ]);

  const scanSteps = [
    { title: 'Lexical Parsing & Target Channel Normalization', progressThreshold: 20 },
    { title: 'Banned Terms, Corporate Jargon & Cliché Detection', progressThreshold: 45 },
    { title: 'Tone of Voice & Audience Reading Level Analysis', progressThreshold: 70 },
    { title: 'Regulatory SLA, Liability & Mandatory Disclaimer Verification', progressThreshold: 90 },
    { title: 'Synthesizing Line-by-Line Diagnostics & Recommended Fixes', progressThreshold: 100 },
  ];

  const handleRerunScan = async () => {
    if (!activeSubmission) return;
    setLocalScanning(true);
    setCurrentProgress(10);
    setScanLogs([{ time: new Date().toLocaleTimeString(), level: 'INFO', text: 'Starting fresh audit against active brand guidelines...' }]);

    // Simulated log stream
    setTimeout(() => {
      setCurrentProgress(35);
      setScanLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), level: 'INFO', text: `Loaded ${guidelines[0]?.bannedWords?.length || 5} active brand rules from workspace.` }]);
    }, 400);

    setTimeout(() => {
      setCurrentProgress(65);
      setScanLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), level: 'WARN', text: 'Scanning prohibited vocabulary and absolute guarantee assertions...' }]);
    }, 800);

    setTimeout(() => {
      setCurrentProgress(90);
      setScanLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), level: 'PASS', text: 'Audience reading complexity evaluated at Grade 8.8 (Flesch-Kincaid).' }]);
    }, 1200);

    setTimeout(() => {
      setCurrentProgress(100);
      setLocalScanning(false);
      setScanLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), level: 'DONE', text: 'Deterministic inspection finished. Compliance report updated.' }]);
    }, 1600);
  };

  const isWorking = localScanning || contextScanning;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>BrandGuard Automated Inspection Engine</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {isWorking ? 'Auditing Content in Real Time...' : 'AI Scan Engine & Inspection Diagnostics'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {isWorking
            ? 'Scanning syntax, brand voice rules, prohibited vocabulary, and regulatory SLA claims against active guidelines.'
            : 'Interactive scanner control room. Review real-time parser events or trigger an on-demand audit.'}
        </p>

        {/* Demo Mode Notice Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono mt-2">
          <Terminal className="w-3 h-3" />
          <span>Scanner Engine: Deterministic Client Rule-Evaluator (Demo Mode)</span>
        </div>
      </div>

      {/* Main Radar & Progress Card */}
      <Card padding="p-8" className="relative overflow-hidden text-center">
        
        {/* Radar scanning circle visualizer */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border border-purple-500/20 ${isWorking ? 'animate-ping opacity-30' : 'opacity-10'}`} />
          <div className="absolute inset-2 rounded-full border border-indigo-500/30" />
          <div className="absolute inset-6 rounded-full border border-purple-500/40" />
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-900/50 relative z-10">
            {isWorking ? (
              <Loader2 className="w-9 h-9 animate-spin text-purple-200" />
            ) : (
              <FileCheck2 className="w-9 h-9 text-emerald-300" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">
              {isWorking ? 'Scan Progress' : 'Inspection Complete'}
            </span>
            <span className="font-mono text-purple-400 font-bold">{currentProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#151D3A] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Active Item Context Pill */}
        {activeSubmission && (
          <div className="max-w-md mx-auto mb-6 p-2.5 rounded-xl bg-[#080C1B] border border-[#161D3A] flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate max-w-[250px]">
              Asset: <strong className="text-slate-200">{activeSubmission.title}</strong>
            </span>
            <Badge variant="in_review">{activeSubmission.channel}</Badge>
          </div>
        )}

        {/* Milestone Steps checklist */}
        <div className="max-w-md mx-auto text-left space-y-2.5 pt-4 border-t border-[#192244]">
          {scanSteps.map((step, idx) => {
            const isDone = currentProgress >= step.progressThreshold;
            const isCurrent = isWorking && currentProgress < step.progressThreshold && currentProgress >= (step.progressThreshold - 25);
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-colors ${
                  isDone
                    ? 'bg-purple-950/20 border-purple-500/20 text-slate-200'
                    : isCurrent
                    ? 'bg-[#121A38] border-purple-500/50 text-purple-200'
                    : 'bg-[#090D1C] border-[#141B34] text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className="truncate">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-[#192244] flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={handleRerunScan}
            disabled={isWorking}
            className="text-xs"
          >
            Rerun Live Scan
          </Button>

          <Button
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/report')}
            className="shadow-xl shadow-purple-950/40 text-xs"
          >
            Open Full Compliance Report
          </Button>
        </div>
      </Card>

      {/* Live Stream Terminal Console */}
      <Card padding="p-5" className="bg-[#050710] border-[#161D3A]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141B34]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Scanner Event Stream
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Real-time tokenizer output</span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-2">
          {scanLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span
                className={`font-bold shrink-0 ${
                  log.level === 'CRIT' ? 'text-rose-400' :
                  log.level === 'WARN' ? 'text-amber-400' :
                  log.level === 'PASS' ? 'text-emerald-400' :
                  log.level === 'DONE' ? 'text-purple-400' :
                  'text-slate-400'
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-slate-300 leading-snug">{log.text}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

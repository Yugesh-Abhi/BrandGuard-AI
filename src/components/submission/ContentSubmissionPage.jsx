import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Send,
  RefreshCw,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextEditor } from '../common/TextEditor';

export const ContentSubmissionPage = () => {
  const { guidelines, runAuditOnText, activeBrand } = useBrand();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Blog Post');
  const [audience, setAudience] = useState('Enterprise Technology Leaders');
  const [contentBody, setContentBody] = useState('');
  const [guidelineId, setGuidelineId] = useState(guidelines[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const categories = [
    { id: 'Blog Post', label: 'Blog Post / Article', badge: 'Long-form' },
    { id: 'LinkedIn Social', label: 'LinkedIn / Social Media', badge: 'Micro-copy' },
    { id: 'Email Newsletter', label: 'Email Newsletter / Campaign', badge: 'Outbound' },
    { id: 'Ad Campaign Copy', label: 'Paid Ad Copy / Slogan', badge: 'Conversion' },
    { id: 'Press Release', label: 'Corporate Press Release', badge: 'Official PR' },
    { id: 'Website Landing Page', label: 'Website / Landing Page Copy', badge: 'Product' },
    { id: 'Technical Whitepaper', label: 'Technical Whitepaper', badge: 'Architecture' }
  ];

  // Presets for instant user testing
  const loadCompliantSample = () => {
    setTitle('Announcing Acme Distributed Observability Platform v4.0');
    setChannel('Blog Post');
    setAudience('Cloud Architects, Site Reliability Engineers');
    setContentBody(`Modern engineering teams shouldn't spend hours diagnosing transient microservices latency. Today, Acme Global Cloud is launching Real-Time Trace Analytics.

With distributed kernel-level sampling, teams cut mean time to resolution by 42% across multi-region clusters. 

Key architectural highlights:
• Automated root-cause clustering for stateless microservices
• Zero-overhead telemetry collectors integrated directly into eBPF
• Immediate compliance with SOC2 Type II and ISO 27001 data processing requirements

Acme Global Cloud provides engineered high availability backed by industry-standard enterprise SLAs. Explore our architectural whitepaper via the engineering portal.`);
    setValidationError('');
  };

  const loadViolationSample = () => {
    setTitle('Exclusive Flash Discount on Cloud Modernization Migration');
    setChannel('Email Newsletter');
    setAudience('VP of Engineering');
    setContentBody(`Migrating legacy enterprise systems is a revolutionary game-changer for your quarterly budget! 

Don't miss our dirt-cheap annual sale! Acme guarantees foolproof 100% uptime during migrations, saving you tons of cash with unprecedented synergy across databases! 

Click right now to claim our game-changer deal before licenses expire!!!`);
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Please provide a title for this content asset.');
      return;
    }
    if (!contentBody.trim()) {
      setValidationError('Content body cannot be empty. Enter or paste text to audit.');
      return;
    }

    setSubmitting(true);
    try {
      await runAuditOnText({
        title: title.trim(),
        contentBody,
        channel,
        audience: audience.trim() || 'Enterprise Audience',
        guidelineId: guidelineId || guidelines[0]?.id
      });
    } catch (err) {
      setValidationError(err.message || 'Audit execution failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#1A2346] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Submit Content for AI Audit</h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit marketing drafts, social posts, or press releases against active brand voice rules and SLA disclaimers.
          </p>
        </div>

        {/* Quick Sample Fill Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCompliantSample}
            className="text-xs"
          >
            Load Compliant Sample
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadViolationSample}
            className="text-xs text-amber-300 border-amber-500/30"
          >
            Load Violations Sample
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="p-6">
          <div className="space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Content Asset Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Enterprise Cloud Migration: 5 Traps to Avoid in 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0D142B] border border-[#1E294B] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30"
              />
            </div>

            {/* Content Category Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Content Category / Channel Selection
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = channel === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setChannel(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm shadow-purple-950/30'
                          : 'bg-[#0A0E1F] border-[#1A2346] text-slate-300 hover:border-purple-500/40 hover:bg-[#101732]'
                      }`}
                    >
                      <p className="text-xs font-semibold truncate">{cat.label}</p>
                      <span className="text-[10px] text-purple-300 font-mono mt-0.5 block">{cat.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience & Guideline Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Audience
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g., DevOps Leads, VP Engineering"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-[#0D142B] border border-[#1E294B] rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Applied Brand Guideline
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={guidelineId}
                    onChange={(e) => setGuidelineId(e.target.value)}
                    className="w-full bg-[#0D142B] border border-[#1E294B] rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  >
                    {guidelines.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.version})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reusable Rich Text Editor Component */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Content Body & Draft Editor
              </label>
              <TextEditor
                value={contentBody}
                onChange={setContentBody}
                placeholder="Write or paste marketing copy, social draft, or press announcement here..."
                minRows={11}
              />
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-xl bg-[#080C1B] border border-[#161D3A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                Active rules: Banned buzzwords, SLA liability claims, reading level & formatting.
              </span>
              <span className="text-purple-300 font-mono text-[11px] shrink-0">
                Deterministic Rule Engine Active
              </span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                icon={Sparkles}
                className="w-full sm:w-auto shadow-xl shadow-purple-950/40"
              >
                Run BrandGuard AI Check
              </Button>
            </div>

          </div>
        </Card>
      </form>

    </div>
  );
};

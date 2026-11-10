import React, { useState } from 'react';
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Trash2,
  Edit2,
  Tag,
  Save,
  RotateCcw,
  Check,
  Search
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { Card, CardHeader, CardTitle, CardDescription } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const BrandGuidelinesPage = () => {
  const {
    guidelines,
    addGuidelineRule,
    updateGuidelineRule,
    deleteGuidelineRule,
    resetGuidelineRules
  } = useBrand();

  const currentGuideline = guidelines[0] || {};

  const [activeTab, setActiveTab] = useState('banned'); // 'banned' | 'tone' | 'legal' | 'taglines'
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeRuleTarget, setActiveRuleTarget] = useState(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    category: 'banned',
    word: '',
    reason: '',
    severity: 'warning',
    alternative: '',
    disclaimer: '',
    tagline: '',
    traitName: '',
    traitRating: 80,
    traitDescription: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openAddModal = (category = activeTab) => {
    setFormData({
      category,
      word: '',
      reason: '',
      severity: 'warning',
      alternative: '',
      disclaimer: '',
      tagline: '',
      traitName: '',
      traitRating: 80,
      traitDescription: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (rule, category) => {
    setActiveRuleTarget({ rule, category });
    if (category === 'banned') {
      setFormData({
        category: 'banned',
        word: rule.word || rule,
        reason: rule.reason || '',
        severity: rule.severity || 'warning',
        alternative: rule.alternative || ''
      });
    } else if (category === 'legal') {
      setFormData({
        category: 'disclaimers',
        disclaimer: rule
      });
    } else if (category === 'taglines') {
      setFormData({
        category: 'taglines',
        tagline: rule
      });
    } else if (category === 'tone') {
      setFormData({
        category: 'tone',
        traitName: rule.trait,
        traitRating: rule.rating,
        traitDescription: rule.description
      });
    }
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (rule, category) => {
    setActiveRuleTarget({ rule, category });
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (formData.category === 'banned') {
      if (!formData.word.trim()) return;
      await addGuidelineRule({
        category: 'banned',
        word: formData.word,
        reason: formData.reason || 'Prohibited by brand style standards.',
        severity: formData.severity,
        alternative: formData.alternative
      });
      showToast(`Rule for "${formData.word}" added successfully!`);
    } else if (formData.category === 'disclaimers') {
      if (!formData.disclaimer.trim()) return;
      await addGuidelineRule({
        category: 'disclaimers',
        disclaimer: formData.disclaimer
      });
      showToast('Mandatory disclaimer added successfully!');
    } else if (formData.category === 'taglines') {
      if (!formData.tagline.trim()) return;
      await addGuidelineRule({
        category: 'taglines',
        tagline: formData.tagline
      });
      showToast('Approved tagline added successfully!');
    } else if (formData.category === 'tone') {
      if (!formData.traitName.trim()) return;
      await addGuidelineRule({
        category: 'tone',
        trait: {
          trait: formData.traitName,
          rating: Number(formData.traitRating),
          description: formData.traitDescription
        }
      });
      showToast(`Tone trait "${formData.traitName}" added!`);
    }

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeRuleTarget) return;

    const { rule, category } = activeRuleTarget;
    const ruleKey = category === 'banned' ? (rule.id || rule.word) :
                    category === 'tone' ? rule.trait : rule;

    await updateGuidelineRule(ruleKey, formData);
    showToast(`Rule updated successfully! Changes are active for future audits.`);
    setIsEditModalOpen(false);
    setActiveRuleTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!activeRuleTarget) return;
    const { rule, category } = activeRuleTarget;
    const ruleKey = category === 'banned' ? (rule.id || rule.word) :
                    category === 'tone' ? rule.trait : rule;

    await deleteGuidelineRule(ruleKey, category === 'legal' ? 'disclaimers' : category);
    showToast('Rule removed from guidelines.');
    setIsDeleteModalOpen(false);
    setActiveRuleTarget(null);
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all guidelines back to the verified enterprise presets?')) {
      await resetGuidelineRules();
      showToast('Guidelines reset to default verified presets.');
    }
  };

  const rawBanned = currentGuideline.bannedWords || [];
  const rawTone = currentGuideline.toneTraits || [];
  const rawDisclaimers = currentGuideline.requiredDisclaimers || [];
  const rawTaglines = currentGuideline.taglines || [];

  const bannedList = rawBanned.filter(b => {
    if (!searchTerm) return true;
    const word = (b.word || b).toLowerCase();
    const reason = (b.reason || '').toLowerCase();
    return word.includes(searchTerm.toLowerCase()) || reason.includes(searchTerm.toLowerCase());
  });

  const toneTraits = rawTone.filter(t => {
    if (!searchTerm) return true;
    return t.trait.toLowerCase().includes(searchTerm.toLowerCase()) || (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const disclaimers = rawDisclaimers.filter(d => {
    if (!searchTerm) return true;
    return d.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const taglines = rawTaglines.filter(t => {
    if (!searchTerm) return true;
    return t.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2346]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Brand Guidelines Management</h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {currentGuideline.version || 'v2.4'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Full Add, Edit, and Delete controls for brand rules. Any modification takes immediate effect in automated content scans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {toastMessage && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> {toastMessage}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-white"
            title="Reset to original presets"
          >
            Reset Presets
          </Button>

          <Button
            size="sm"
            icon={Plus}
            onClick={() => openAddModal(activeTab === 'legal' ? 'disclaimers' : activeTab)}
          >
            Add Rule
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0F20] border border-[#192348] w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('banned')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'banned'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Banned Jargon & Terms ({rawBanned.length})
          </button>

          <button
            onClick={() => setActiveTab('tone')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tone'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Tone & Voice Matrix ({rawTone.length})
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Mandatory Disclaimers ({rawDisclaimers.length})
          </button>

          <button
            onClick={() => setActiveTab('taglines')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'taglines'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Approved Taglines ({rawTaglines.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules in view..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D142B] border border-[#1E294B] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>
      </div>

      {/* TAB 1: BANNED JARGON & BUZZWORDS (FULL CRUD) */}
      {activeTab === 'banned' && (
        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={AlertTriangle}>Prohibited Vocabulary & Buzzwords</CardTitle>
              <CardDescription>
                BrandGuard scanner triggers score deductions and generates suggested replacements whenever these terms appear.
              </CardDescription>
            </div>
            <Button size="sm" icon={Plus} onClick={() => openAddModal('banned')}>
              Add Prohibited Term
            </Button>
          </CardHeader>

          {bannedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No banned terms configured yet. Click "Add Prohibited Term" to create a new rule.
            </div>
          ) : (
            <div className="divide-y divide-[#151D3A]">
              {bannedList.map((item, idx) => {
                const word = item.word || item;
                const severity = item.severity || 'warning';
                const alternative = item.alternative;

                return (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                          "{word}"
                        </span>
                        <Badge variant={severity}>{severity}</Badge>
                        {alternative && (
                          <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                            Prefer: "{alternative}"
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {item.reason || 'Prohibited by brand style standards.'}
                      </p>
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(item, 'banned')}
                        className="p-2 text-slate-400 hover:text-purple-300 hover:bg-[#162044] rounded-lg transition-colors cursor-pointer"
                        title="Edit rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item, 'banned')}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: TONE & VOICE TRAITS (FULL CRUD) */}
      {activeTab === 'tone' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Tone Dimensions ({toneTraits.length})
            </span>
            <Button size="sm" icon={Plus} onClick={() => openAddModal('tone')}>
              Add Tone Dimension
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {toneTraits.map((t, idx) => (
              <Card key={idx} padding="p-5" className="relative group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white tracking-tight">{t.trait}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-lg mr-1">
                      {t.rating}%
                    </span>
                    <button
                      onClick={() => openEditModal(t, 'tone')}
                      className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-[#162044] rounded-lg transition-colors"
                      title="Edit tone trait"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(t, 'tone')}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete tone trait"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#161D3A]">
                  <div className="w-full h-2 rounded-full bg-[#161E38] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${t.rating}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>Subdued</span>
                    <span>Balanced</span>
                    <span>Dominant</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANDATORY LEGAL DISCLAIMERS (FULL CRUD) */}
      {activeTab === 'legal' && (
        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={ShieldCheck}>Mandatory Legal Disclosures</CardTitle>
              <CardDescription>
                Regulatory text required when making promotional, financial, or technical benchmark assertions.
              </CardDescription>
            </div>
            <Button size="sm" icon={Plus} onClick={() => openAddModal('disclaimers')}>
              Add Disclaimer
            </Button>
          </CardHeader>

          <div className="space-y-4">
            {disclaimers.map((disc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#090D1C] border border-[#192244] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Requirement #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="pass" size="sm">Legal Verified</Badge>
                    <button
                      onClick={() => openEditModal(disc, 'legal')}
                      className="p-1.5 text-slate-400 hover:text-purple-300 rounded hover:bg-[#162044] transition-colors"
                      title="Edit disclaimer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(disc, 'legal')}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                      title="Delete disclaimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-mono bg-[#11172E] p-3 rounded-lg border border-[#1D274E] leading-relaxed">
                  {disc}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: APPROVED TAGLINES (FULL CRUD) */}
      {activeTab === 'taglines' && (
        <Card padding="p-6">
          <CardHeader>
            <div>
              <CardTitle icon={Tag}>Approved Marketing Taglines</CardTitle>
              <CardDescription>
                Official slogans and positioning statements authorized for marketing and website headers.
              </CardDescription>
            </div>
            <Button size="sm" icon={Plus} onClick={() => openAddModal('taglines')}>
              Add Tagline
            </Button>
          </CardHeader>

          <div className="space-y-3">
            {taglines.map((tag, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#090D1C] border border-[#192244] flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-white tracking-tight">"{tag}"</span>
                <div className="flex items-center gap-2">
                  <Badge variant="pass" size="sm">Official</Badge>
                  <button
                    onClick={() => openEditModal(tag, 'taglines')}
                    className="p-1.5 text-slate-400 hover:text-purple-300 rounded hover:bg-[#162044] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(tag, 'taglines')}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ADD RULE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Brand Guideline Rule"
        subtitle="This rule will be actively checked on all subsequent content audits."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Rule Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
            >
              <option value="banned">Prohibited Vocabulary / Banned Jargon</option>
              <option value="tone">Tone of Voice Dimension</option>
              <option value="disclaimers">Mandatory Legal Disclaimer</option>
              <option value="taglines">Approved Brand Tagline</option>
            </select>
          </div>

          {formData.category === 'banned' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prohibited Word / Phrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., disruptive, foolproof, silver bullet"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Violation Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  >
                    <option value="warning">Warning (-8 pts)</option>
                    <option value="critical">Critical (-14 pts)</option>
                    <option value="suggestion">Suggestion (-4 pts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Preferred Alternative
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., fault-tolerant, innovative"
                    value={formData.alternative}
                    onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Guidance & Justification
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this violates brand voice..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </>
          )}

          {formData.category === 'tone' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trait Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pragmatic, Direct"
                  value={formData.traitName}
                  onChange={(e) => setFormData({ ...formData, traitName: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Target Prominence</span>
                  <span className="font-mono text-purple-400 font-bold">{formData.traitRating}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.traitRating}
                  onChange={(e) => setFormData({ ...formData, traitRating: e.target.value })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clear technical phrasing with tangible proof points."
                  value={formData.traitDescription}
                  onChange={(e) => setFormData({ ...formData, traitDescription: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </>
          )}

          {formData.category === 'disclaimers' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Required Disclosure Copy</label>
              <textarea
                rows={3}
                required
                placeholder="Paste mandatory legal or SLA disclaimer..."
                value={formData.disclaimer}
                onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                className="w-full bg-[#111833] border border-[#1E294B] rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>
          )}

          {formData.category === 'taglines' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline Slogan</label>
              <input
                type="text"
                required
                placeholder="e.g., Precision cloud systems for mission-critical teams."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A2346]">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save Brand Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT RULE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Brand Guideline Rule"
        subtitle="Update rule parameters and recommendations."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formData.category === 'banned' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Prohibited Word / Phrase</label>
                <input
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  >
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Alternative</label>
                  <input
                    type="text"
                    value={formData.alternative}
                    onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                    className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Explanation</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </>
          )}

          {formData.category === 'disclaimers' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Disclaimer Text</label>
              <textarea
                rows={3}
                required
                value={formData.disclaimer}
                onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                className="w-full bg-[#111833] border border-[#1E294B] rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>
          )}

          {formData.category === 'taglines' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                required
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>
          )}

          {formData.category === 'tone' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trait Name</label>
                <input
                  type="text"
                  required
                  value={formData.traitName}
                  onChange={(e) => setFormData({ ...formData, traitName: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rating ({formData.traitRating}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.traitRating}
                  onChange={(e) => setFormData({ ...formData, traitRating: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.traitDescription}
                  onChange={(e) => setFormData({ ...formData, traitDescription: e.target.value })}
                  className="w-full bg-[#111833] border border-[#1E294B] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A2346]">
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Check}>
              Apply Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Rule Removal"
        subtitle="Are you sure you want to delete this brand rule?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Removing this rule will immediately disable detection for this item in automated compliance scans.
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A2346]">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Keep Rule
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} icon={Trash2}>
              Delete Rule
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

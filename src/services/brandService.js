
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_BRANDS, MOCK_GUIDELINES } from '../data/mockData';

const GUIDELINES_STORAGE_KEY = 'brandguard_guidelines_cache';

const readGuidelineCache = () => {
  try {
    return JSON.parse(
      localStorage.getItem(GUIDELINES_STORAGE_KEY) || '[]'
    );
  } catch {
    return [];
  }
};

// Convert database rules into the format used by BrandGuard AI.
const mapGuideline = (
  guideline,
  rules,
  disclaimers,
  taglines,
  toneTraits
) => {
  const activeRules = rules.filter(
    rule => rule.guideline_id === guideline.id && rule.is_active
  );

  // Split pipe-separated patterns into individual terms.
  const bannedWords = activeRules
    .filter(rule =>
      ['banned', 'terminology'].includes(rule.category)
    )
    .flatMap(rule =>
      (rule.banned_pattern || '')
        .split('|')
        .map(pattern => pattern.trim())
        .filter(Boolean)
        .map(pattern => ({
          id: rule.id,
          word: pattern,
          reason: rule.explanation,
          severity: rule.severity,
          alternative: rule.preferred_alternative || '',
          ruleName: rule.rule_name,
          category: rule.category
        }))
    );

  const guidelineDisclaimers = disclaimers
    .filter(item =>
      item.guideline_id === guideline.id && item.is_mandatory
    )
    .map(item => ({
      id: item.id,
      text: item.disclaimer_text,
      context: item.channel_or_context,
      mandatory: item.is_mandatory
    }));

  const guidelineTaglines = taglines
    .filter(item => item.guideline_id === guideline.id)
    .map(item => ({
      id: item.id,
      tagline: item.tagline,
      context: item.context_notes,
      isPrimary: item.is_primary
    }));

  const guidelineToneTraits = toneTraits
    .filter(item => item.guideline_id === guideline.id)
    .map(item => ({
      id: item.id,
      trait: item.trait,
      rating: item.rating,
      description: item.description
    }));

  return {
    ...guideline,

    // All active database rules.
    rules: activeRules,

    // Compatibility with the existing compliance evaluator.
    bannedWords,

    // Rules separated by category.
    legalRules: activeRules.filter(
      rule => rule.category === 'legal'
    ),

    terminologyRules: activeRules.filter(
      rule => rule.category === 'terminology'
    ),

    formattingRules: activeRules.filter(
      rule => rule.category === 'formatting'
    ),

    toneRules: activeRules.filter(
      rule => rule.category === 'tone'
    ),

    requiredDisclaimers: guidelineDisclaimers,
    taglines: guidelineTaglines,
    toneTraits: guidelineToneTraits
  };
};

export const brandService = {
  async getBrands(organisationId, { allowMock = false } = {}) {
    if (allowMock) {
      return MOCK_BRANDS;
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    if (!organisationId) {
      throw new Error('No active organisation selected.');
    }

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('name');

    if (error) throw error;

    return data || [];
  },

  async getGuidelines(brandId, { allowMock = false } = {}) {
    if (allowMock) {
      return brandId
        ? MOCK_GUIDELINES.filter(g => g.brandId === brandId)
        : MOCK_GUIDELINES;
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    if (!brandId) return [];

    const { data: guidelines, error } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('brand_id', brandId);

    if (error) throw error;

    if (!guidelines?.length) return [];

    const guidelineIds = guidelines.map(item => item.id);

    const [
      rulesResult,
      disclaimersResult,
      taglinesResult,
      toneResult
    ] = await Promise.all([
      supabase
        .from('brand_rules')
        .select('*')
        .in('guideline_id', guidelineIds),

      supabase
        .from('brand_disclaimers')
        .select('*')
        .in('guideline_id', guidelineIds),

      supabase
        .from('brand_taglines')
        .select('*')
        .in('guideline_id', guidelineIds),

      supabase
        .from('brand_tone_traits')
        .select('*')
        .in('guideline_id', guidelineIds)
    ]);

    if (rulesResult.error) throw rulesResult.error;
    if (disclaimersResult.error) throw disclaimersResult.error;
    if (taglinesResult.error) throw taglinesResult.error;
    if (toneResult.error) throw toneResult.error;

    return guidelines.map(guideline =>
      mapGuideline(
        guideline,
        rulesResult.data || [],
        disclaimersResult.data || [],
        taglinesResult.data || [],
        toneResult.data || []
      )
    );
  },

  async saveGuideline(guideline) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      brand_id: guideline.brand_id || guideline.brandId,
      name: guideline.name,
      version: guideline.version || 'v1.0',
      reading_level:
        guideline.reading_level || guideline.readingLevel,
      is_active: guideline.is_active ?? true
    };

    if (guideline.id) {
      payload.id = guideline.id;
    }

    const { data, error } = await supabase
      .from('brand_guidelines')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Existing local demo guideline editing.
  async addRule(
    guidelineId,
    {
      category,
      word,
      reason,
      severity = 'warning',
      alternative = '',
      disclaimer = '',
      tagline = '',
      trait = null
    }
  ) {
    const list = readGuidelineCache();
    const index = list.findIndex(g => g.id === guidelineId);

    if (index === -1) {
      throw new Error(
        'Guideline not found in local cache.'
      );
    }

    const guideline = { ...list[index] };

    if (category === 'banned') {
      const entry = {
        id: `rule-${Date.now()}`,
        word: word.trim().toLowerCase(),
        reason: reason.trim(),
        severity,
        alternative: alternative.trim() || undefined
      };

      guideline.bannedWords = [
        entry,
        ...(guideline.bannedWords || []).filter(
          item => (item.word || item).toLowerCase() !== entry.word
        )
      ];
    } else if (category === 'disclaimers') {
      guideline.requiredDisclaimers = [
        disclaimer.trim(),
        ...(guideline.requiredDisclaimers || [])
      ];
    } else if (category === 'taglines') {
      guideline.taglines = [
        tagline.trim(),
        ...(guideline.taglines || [])
      ];
    } else if (category === 'tone' && trait) {
      guideline.toneTraits = [
        ...(guideline.toneTraits || []).filter(
          item => item.trait !== trait.trait
        ),
        trait
      ];
    }

    list[index] = guideline;

    localStorage.setItem(
      GUIDELINES_STORAGE_KEY,
      JSON.stringify(list)
    );

    return guideline;
  },

  async updateRule(guidelineId, ruleKey, updatedData) {
    const list = readGuidelineCache();
    const index = list.findIndex(g => g.id === guidelineId);

    if (index === -1) return null;

    const guideline = { ...list[index] };

    if (updatedData.category === 'banned') {
      guideline.bannedWords = (guideline.bannedWords || []).map(item => {
        if ((item.id || item.word) !== ruleKey && item.word !== ruleKey) {
          return item;
        }

        return {
          ...item,
          word: updatedData.word.trim().toLowerCase(),
          reason: updatedData.reason.trim(),
          severity: updatedData.severity || item.severity || 'warning',
          alternative:
            updatedData.alternative?.trim() || item.alternative
        };
      });
    } else if (updatedData.category === 'disclaimers') {
      guideline.requiredDisclaimers =
        (guideline.requiredDisclaimers || []).map(item =>
          item === ruleKey ? updatedData.disclaimer.trim() : item
        );
    } else if (updatedData.category === 'taglines') {
      guideline.taglines = (guideline.taglines || []).map(item =>
        item === ruleKey ? updatedData.tagline.trim() : item
      );
    } else if (updatedData.category === 'tone') {
      guideline.toneTraits = (guideline.toneTraits || []).map(item =>
        item.trait === ruleKey ? { ...item, ...updatedData } : item
      );
    }

    list[index] = guideline;

    localStorage.setItem(
      GUIDELINES_STORAGE_KEY,
      JSON.stringify(list)
    );

    return guideline;
  },

  async deleteRule(guidelineId, ruleKey, category) {
    const list = readGuidelineCache();
    const index = list.findIndex(g => g.id === guidelineId);

    if (index === -1) return null;

    const guideline = { ...list[index] };

    if (category === 'banned') {
      guideline.bannedWords = (guideline.bannedWords || []).filter(
        item => (item.id || item.word) !== ruleKey && item.word !== ruleKey
      );
    } else if (category === 'disclaimers') {
      guideline.requiredDisclaimers =
        (guideline.requiredDisclaimers || []).filter(
          item => item !== ruleKey
        );
    } else if (category === 'taglines') {
      guideline.taglines = (guideline.taglines || []).filter(
        item => item !== ruleKey
      );
    } else if (category === 'tone') {
      guideline.toneTraits = (guideline.toneTraits || []).filter(
        item => item.trait !== ruleKey
      );
    }

    list[index] = guideline;

    localStorage.setItem(
      GUIDELINES_STORAGE_KEY,
      JSON.stringify(list)
    );

    return guideline;
  },

  async resetGuidelines(brandId) {
    const list = MOCK_GUIDELINES;

    localStorage.setItem(
      GUIDELINES_STORAGE_KEY,
      JSON.stringify(list)
    );

    return brandId
      ? list.filter(g => g.brandId === brandId)
      : list;
  }
};

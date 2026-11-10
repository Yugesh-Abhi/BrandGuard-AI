import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_BRANDS, MOCK_GUIDELINES } from '../data/mockData';

const GUIDELINES_STORAGE_KEY = 'brandguard_guidelines_cache';

export const brandService = {
  async getBrands() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('brands').select('*').order('name');
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getBrands fallback to mock:', err.message);
      }
    }
    return MOCK_BRANDS;
  },

  async getGuidelines(brandId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('brand_guidelines').select('*');
        if (brandId) query = query.eq('brand_id', brandId);
        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getGuidelines fallback to mock:', err.message);
      }
    }

    const stored = localStorage.getItem(GUIDELINES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (brandId) return parsed.filter(g => g.brandId === brandId);
        return parsed;
      } catch {
        // Fallback
      }
    }
    // Initialize storage with clone of mock guidelines
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(MOCK_GUIDELINES));
    return brandId ? MOCK_GUIDELINES.filter(g => g.brandId === brandId) : MOCK_GUIDELINES;
  },

  async saveGuideline(guideline) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('brand_guidelines').upsert(guideline).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase saveGuideline fallback:', err.message);
      }
    }

    const stored = localStorage.getItem(GUIDELINES_STORAGE_KEY);
    let list = stored ? JSON.parse(stored) : [...MOCK_GUIDELINES];
    const index = list.findIndex(g => g.id === guideline.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...guideline, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...guideline, id: guideline.id || `g-${Date.now()}`, createdAt: new Date().toISOString() });
    }
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(list));
    return guideline;
  },

  async addRule(guidelineId, { category, word, reason, severity = 'warning', alternative = '', disclaimer = '', tagline = '', trait = null }) {
    const list = await this.getGuidelines();
    const gIndex = list.findIndex(g => g.id === guidelineId);
    if (gIndex === -1) return null;

    const guideline = { ...list[gIndex] };

    if (category === 'banned') {
      const currentBanned = guideline.bannedWords || [];
      const newEntry = {
        id: `rule-${Date.now()}`,
        word: word.trim().toLowerCase(),
        reason: reason.trim(),
        severity,
        alternative: alternative.trim() || undefined
      };
      guideline.bannedWords = [newEntry, ...currentBanned.filter(b => (b.word || b).toLowerCase() !== newEntry.word)];
    } else if (category === 'disclaimers') {
      const currentDisc = guideline.requiredDisclaimers || [];
      guideline.requiredDisclaimers = [disclaimer.trim(), ...currentDisc];
    } else if (category === 'taglines') {
      const currentTags = guideline.taglines || [];
      guideline.taglines = [tagline.trim(), ...currentTags];
    } else if (category === 'tone' && trait) {
      const currentTone = guideline.toneTraits || [];
      guideline.toneTraits = [...currentTone.filter(t => t.trait !== trait.trait), trait];
    }

    list[gIndex] = guideline;
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(list));
    return guideline;
  },

  async updateRule(guidelineId, ruleKey, updatedData) {
    const list = await this.getGuidelines();
    const gIndex = list.findIndex(g => g.id === guidelineId);
    if (gIndex === -1) return null;

    const guideline = { ...list[gIndex] };

    if (updatedData.category === 'banned') {
      guideline.bannedWords = (guideline.bannedWords || []).map(b => {
        const itemKey = b.id || b.word;
        if (itemKey === ruleKey || b.word === ruleKey) {
          return {
            ...b,
            word: updatedData.word.trim().toLowerCase(),
            reason: updatedData.reason.trim(),
            severity: updatedData.severity || b.severity || 'warning',
            alternative: updatedData.alternative?.trim() || b.alternative
          };
        }
        return b;
      });
    } else if (updatedData.category === 'disclaimers') {
      guideline.requiredDisclaimers = (guideline.requiredDisclaimers || []).map(d =>
        d === ruleKey ? updatedData.disclaimer.trim() : d
      );
    } else if (updatedData.category === 'taglines') {
      guideline.taglines = (guideline.taglines || []).map(t =>
        t === ruleKey ? updatedData.tagline.trim() : t
      );
    } else if (updatedData.category === 'tone') {
      guideline.toneTraits = (guideline.toneTraits || []).map(t =>
        t.trait === ruleKey ? { ...t, ...updatedData } : t
      );
    }

    list[gIndex] = guideline;
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(list));
    return guideline;
  },

  async deleteRule(guidelineId, ruleKey, category) {
    const list = await this.getGuidelines();
    const gIndex = list.findIndex(g => g.id === guidelineId);
    if (gIndex === -1) return null;

    const guideline = { ...list[gIndex] };

    if (category === 'banned') {
      guideline.bannedWords = (guideline.bannedWords || []).filter(b => (b.id || b.word) !== ruleKey && b.word !== ruleKey);
    } else if (category === 'disclaimers') {
      guideline.requiredDisclaimers = (guideline.requiredDisclaimers || []).filter(d => d !== ruleKey);
    } else if (category === 'taglines') {
      guideline.taglines = (guideline.taglines || []).filter(t => t !== ruleKey);
    } else if (category === 'tone') {
      guideline.toneTraits = (guideline.toneTraits || []).filter(t => t.trait !== ruleKey);
    }

    list[gIndex] = guideline;
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(list));
    return guideline;
  },

  async resetGuidelines(brandId) {
    const list = [...MOCK_GUIDELINES];
    localStorage.setItem(GUIDELINES_STORAGE_KEY, JSON.stringify(list));
    return brandId ? list.filter(g => g.brandId === brandId) : list;
  }
};

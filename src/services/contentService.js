import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MOCK_SUBMISSIONS, MOCK_REVISIONS, MOCK_REVIEWS_QUEUE } from '../data/mockData';

const SUBMISSIONS_STORAGE_KEY = 'brandguard_submissions_cache';
const REVIEWS_STORAGE_KEY = 'brandguard_reviews_cache';

export const contentService = {
  async getSubmissions(brandId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('content_submissions').select('*').order('created_at', { ascending: false });
        if (brandId) query = query.eq('brand_id', brandId);
        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getSubmissions fallback:', err.message);
      }
    }

    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (brandId) return parsed.filter(s => s.brandId === brandId);
        return parsed;
      } catch {
        // Fallback
      }
    }
    // Initialize storage with initial clone
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(MOCK_SUBMISSIONS));
    return brandId ? MOCK_SUBMISSIONS.filter(s => s.brandId === brandId) : MOCK_SUBMISSIONS;
  },

  async getSubmissionById(id) {
    const list = await this.getSubmissions();
    return list.find(s => s.id === id) || null;
  },

  async createSubmission(payload) {
    const newSubmission = {
      id: payload.id || `sub-${Date.now()}`,
      brandId: payload.brandId || 'b0000000-0000-0000-0000-000000000001',
      guidelineId: payload.guidelineId || 'g-acme-main-2026',
      title: payload.title || 'Untitled Draft',
      channel: payload.channel || 'Blog Post',
      audience: payload.audience || 'General Enterprise Audience',
      authorName: payload.authorName || 'Current User',
      authorRole: payload.authorRole || 'Content Specialist',
      department: payload.department || 'Content Operations',
      submittedAt: new Date().toISOString(),
      status: payload.status || 'analyzing',
      complianceScore: payload.complianceScore || 0,
      version: 'v1.0',
      wordCount: payload.contentBody ? payload.contentBody.trim().split(/\s+/).length : 0,
      readingTime: `${Math.max(1, Math.ceil((payload.contentBody || '').trim().split(/\s+/).length / 200))} min read`,
      contentBody: payload.contentBody || '',
      violationsCount: payload.violationsCount || { critical: 0, warning: 0, suggestion: 0 },
      latestReportId: payload.latestReportId || null
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('content_submissions').insert([newSubmission]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createSubmission fallback:', err.message);
      }
    }

    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [...MOCK_SUBMISSIONS];
    list.unshift(newSubmission);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
    return newSubmission;
  },

  async updateSubmission(id, updatedFields) {
    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [...MOCK_SUBMISSIONS];
    const index = list.findIndex(s => s.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updatedFields };
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
      return list[index];
    }
    return null;
  },

  async updateSubmissionStatus(id, newStatus, score = null) {
    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [...MOCK_SUBMISSIONS];
    const index = list.findIndex(s => s.id === id);
    if (index >= 0) {
      list[index].status = newStatus;
      if (score !== null) list[index].complianceScore = score;
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
      return list[index];
    }
    return null;
  },

  async getReviewQueue() {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(MOCK_REVIEWS_QUEUE));
    return MOCK_REVIEWS_QUEUE;
  },

  async queueSubmissionForReview(submission, score = null) {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [...MOCK_REVIEWS_QUEUE];

    // Check if already in queue
    const existingIndex = list.findIndex(r => r.submissionId === submission.id);
    const reviewItem = {
      id: existingIndex >= 0 ? list[existingIndex].id : `rev-${Date.now()}`,
      submissionId: submission.id,
      title: submission.title,
      author: submission.authorName,
      channel: submission.channel,
      complianceScore: score !== null ? score : (submission.complianceScore || 75),
      status: 'In Review',
      submittedAgo: 'Just now',
      pendingWith: 'Brand Governance Committee',
      priority: score && score < 70 ? 'Critical' : 'High',
      commentsCount: 1,
      lastComment: 'Submitted for formal Brand Director publishing certification.'
    };

    if (existingIndex >= 0) {
      list[existingIndex] = reviewItem;
    } else {
      list.unshift(reviewItem);
    }
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));

    // Also update submission status
    await this.updateSubmissionStatus(submission.id, 'in_review', score);
    return reviewItem;
  },

  async updateReviewStatus(reviewId, action, comment, reviewerName = 'Brand Director') {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [...MOCK_REVIEWS_QUEUE];
    const item = list.find(r => r.id === reviewId);
    if (item) {
      let submissionStatus = 'in_review';
      if (action === 'approve') {
        item.status = 'Approved';
        submissionStatus = 'approved';
      } else if (action === 'reject') {
        item.status = 'Rejected';
        submissionStatus = 'rejected';
      } else if (action === 'request_revision') {
        item.status = 'Needs Revisions';
        submissionStatus = 'needs_revision';
      }
      if (comment) {
        item.lastComment = comment;
        item.commentsCount = (item.commentsCount || 0) + 1;
      }
      item.reviewedBy = reviewerName;
      item.reviewedAt = new Date().toISOString();
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));

      // Synchronize with content submission table
      if (item.submissionId) {
        await this.updateSubmissionStatus(item.submissionId, submissionStatus);
      }
    }
    return list;
  },

  async getRevisions(submissionId) {
    return MOCK_REVISIONS;
  }
};

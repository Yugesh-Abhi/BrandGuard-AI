
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  MOCK_SUBMISSIONS,
  MOCK_REVISIONS,
  MOCK_REVIEWS_QUEUE
} from '../data/mockData';

const SUBMISSIONS_STORAGE_KEY = 'brandguard_submissions_cache';
const REVIEWS_STORAGE_KEY = 'brandguard_reviews_cache';
const ACTIVE_ORGANISATION_KEY = 'brandguard_active_organisation';
const AUTH_USER_KEY = 'brandguard_auth_user';

const isDemoSession = () => {
  try {
    const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    return Boolean(user?.isMock);
  } catch {
    return false;
  }
};

const getActiveOrganisationId = () =>
  localStorage.getItem(ACTIVE_ORGANISATION_KEY);

const requireDatabase = () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }
};

const getAuthenticatedUser = async () => {
  requireDatabase();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Please sign in first.');

  return user;
};

const mapSubmission = row => ({
  ...row,
  brandId: row.brand_id,
  guidelineId: row.guideline_id,
  audience: row.target_audience,
  authorName: row.author_name,
  authorRole: row.author_role,
  submittedAt: row.created_at,
  complianceScore: row.latest_score,
  version: row.current_version,
  wordCount: row.word_count,
  contentBody: row.content_body
});

const readCache = (key, fallback = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const mapRevision = row => ({
  id: row.id,
  submissionId: row.submission_id,
  version: row.version_tag,
  versionTag: row.version_tag,
  createdAt: row.created_at,
  authorId: row.author_id,
  author: row.author_name,
  authorName: row.author_name,
  contentSnapshot: row.content_snapshot,
  changeSummary: row.change_summary,
  scoreAtRevision: row.score_at_revision
});

const mapReview = (submission, latestAction = null) => ({
  id: submission.id,
  submissionId: submission.id,
  title: submission.title,
  author: submission.author_name,
  authorName: submission.author_name,
  channel: submission.channel,
  complianceScore: submission.latest_score ?? 0,
  status: 'In Review',
  submittedAgo: 'Pending review',
  pendingWith: 'Brand Governance Committee',
  priority:
    submission.latest_score !== null && submission.latest_score < 70
      ? 'Critical'
      : 'High',
  commentsCount: latestAction ? 1 : 0,
  lastComment: latestAction?.comments || '',
  reviewedBy: latestAction?.reviewer_name || null,
  reviewerRole: latestAction?.reviewer_role || null
});

const getOrganisationAndUser = async () => {
  const user = await getAuthenticatedUser();
  const organisationId = getActiveOrganisationId();

  if (!organisationId) {
    throw new Error('No active private organisation selected.');
  }

  return { user, organisationId };
};

const nextVersion = currentVersion => {
  const match = String(currentVersion || 'v1.0').match(/^v(\d+)\.(\d+)$/);

  if (!match) return 'v1.1';

  return `v${match[1]}.${Number(match[2]) + 1}`;
};

export const contentService = {
  async getSubmissions(brandId) {
    if (isDemoSession()) {
      const list = readCache(SUBMISSIONS_STORAGE_KEY, MOCK_SUBMISSIONS);

      return brandId
        ? list.filter(item => item.brandId === brandId)
        : list;
    }

    const { organisationId } = await getOrganisationAndUser();

    let query = supabase
      .from('content_submissions')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (brandId) query = query.eq('brand_id', brandId);

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(mapSubmission);
  },

  async getSubmissionById(id) {
    const list = await this.getSubmissions();
    return list.find(item => item.id === id) || null;
  },

  async createSubmission(payload) {
    if (isDemoSession()) {
      const newSubmission = {
        id: payload.id || `sub-${Date.now()}`,
        brandId: payload.brandId,
        guidelineId: payload.guidelineId || null,
        title: payload.title || 'Untitled Draft',
        channel: payload.channel || 'Blog Post',
        audience: payload.audience || 'General Audience',
        authorName: payload.authorName || 'Demo User',
        authorRole: payload.authorRole || 'Content Creator',
        department: payload.department || 'Content Operations',
        submittedAt: new Date().toISOString(),
        status: payload.status || 'analyzing',
        complianceScore: payload.complianceScore || 0,
        version: 'v1.0',
        wordCount: (payload.contentBody || '').trim().split(/\s+/).filter(Boolean).length,
        contentBody: payload.contentBody || '',
        latestReportId: null
      };

      const list = readCache(SUBMISSIONS_STORAGE_KEY, MOCK_SUBMISSIONS);
      list.unshift(newSubmission);
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

      return newSubmission;
    }

    const { user, organisationId } = await getOrganisationAndUser();

    if (!payload.brandId) {
      throw new Error('Select a brand before submitting content.');
    }

    const contentBody = payload.contentBody || '';

    const databasePayload = {
      organisation_id: organisationId,
      brand_id: payload.brandId,
      guideline_id: payload.guidelineId || null,
      title: payload.title || 'Untitled Draft',
      channel: payload.channel || 'Blog Post',
      target_audience: payload.audience || null,
      author_id: user.id,
      author_name:
        payload.authorName ||
        user.user_metadata?.full_name ||
        user.email ||
        'User',
      author_role: payload.authorRole || null,
      department: payload.department || null,
      content_body: contentBody,
      status: payload.status || 'submitted',
      current_version: 'v1.0',
      word_count: contentBody.trim().split(/\s+/).filter(Boolean).length
    };

    const { data, error } = await supabase
      .from('content_submissions')
      .insert(databasePayload)
      .select()
      .single();

    if (error) throw error;

    return mapSubmission(data);
  },

  async updateSubmission(id, updatedFields) {
    if (isDemoSession()) {
      const list = readCache(SUBMISSIONS_STORAGE_KEY, MOCK_SUBMISSIONS);
      const index = list.findIndex(item => item.id === id);

      if (index === -1) return null;

      list[index] = { ...list[index], ...updatedFields };

      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

      return list[index];
    }

    const { user, organisationId } = await getOrganisationAndUser();
    const existing = await this.getSubmissionById(id);

    if (!existing) {
      throw new Error('Submission not found.');
    }

    const databaseFields = {};

    if ('contentBody' in updatedFields) {
      const newContent = updatedFields.contentBody || '';

      if (newContent !== existing.contentBody) {
        // Preserve the previous content before updating it.
        const { error: revisionError } = await supabase
          .from('revision_history')
          .insert({
            submission_id: id,
            version_tag: existing.version || 'v1.0',
            author_id: user.id,
            author_name:
              user.user_metadata?.full_name || user.email || 'User',
            content_snapshot: existing.contentBody || '',
            change_summary:
              updatedFields.changeSummary ||
              'Previous content saved before editing.',
            score_at_revision: existing.complianceScore ?? null
          });

        if (revisionError) {
          throw new Error(
            `Could not save revision history: ${revisionError.message}`
          );
        }

        databaseFields.content_body = newContent;
        databaseFields.word_count = newContent.trim().split(/\s+/).filter(Boolean).length;
        databaseFields.current_version = nextVersion(existing.version);
      }
    }

    if ('status' in updatedFields) {
      databaseFields.status = updatedFields.status;
    }

    if ('complianceScore' in updatedFields) {
      databaseFields.latest_score = updatedFields.complianceScore;
    }

    if ('title' in updatedFields) {
      databaseFields.title = updatedFields.title;
    }

    if ('channel' in updatedFields) {
      databaseFields.channel = updatedFields.channel;
    }

    if (Object.keys(databaseFields).length === 0) {
      return existing;
    }

    const { data, error } = await supabase
      .from('content_submissions')
      .update(databaseFields)
      .eq('id', id)
      .eq('organisation_id', organisationId)
      .select()
      .single();

    if (error) throw error;

    return mapSubmission(data);
  },

  async updateSubmissionStatus(id, newStatus, score = null) {
    if (isDemoSession()) {
      const list = readCache(SUBMISSIONS_STORAGE_KEY, MOCK_SUBMISSIONS);
      const index = list.findIndex(item => item.id === id);

      if (index === -1) return null;

      list[index].status = newStatus;

      if (score !== null) {
        list[index].complianceScore = score;
      }

      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

      return list[index];
    }

    const { organisationId } = await getOrganisationAndUser();

    const updateData = { status: newStatus };

    if (score !== null) updateData.latest_score = score;

    const { data, error } = await supabase
      .from('content_submissions')
      .update(updateData)
      .eq('id', id)
      .eq('organisation_id', organisationId)
      .select()
      .single();

    if (error) throw error;

    return mapSubmission(data);
  },

  async getReviewQueue() {
    if (isDemoSession()) {
      return readCache(REVIEWS_STORAGE_KEY, MOCK_REVIEWS_QUEUE);
    }

    const { organisationId } = await getOrganisationAndUser();

    const { data: submissions, error } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('organisation_id', organisationId)
      .eq('status', 'in_review')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (!submissions?.length) return [];

    const submissionIds = submissions.map(item => item.id);

    const { data: actions, error: actionError } = await supabase
      .from('review_actions')
      .select('*')
      .in('submission_id', submissionIds)
      .order('created_at', { ascending: false });

    if (actionError) throw actionError;

    const latestActionBySubmission = new Map();

    for (const action of actions || []) {
      if (!latestActionBySubmission.has(action.submission_id)) {
        latestActionBySubmission.set(action.submission_id, action);
      }
    }

    return submissions.map(submission =>
      mapReview(
        mapSubmission(submission),
        latestActionBySubmission.get(submission.id) || null
      )
    );
  },

  async queueSubmissionForReview(submission, score = null) {
    if (isDemoSession()) {
      const list = readCache(REVIEWS_STORAGE_KEY, MOCK_REVIEWS_QUEUE);

      const existingIndex = list.findIndex(
        item => item.submissionId === submission.id
      );

      const reviewItem = {
        id: existingIndex >= 0 ? list[existingIndex].id : `rev-${Date.now()}`,
        submissionId: submission.id,
        title: submission.title,
        author: submission.authorName,
        channel: submission.channel,
        complianceScore:
          score !== null ? score : submission.complianceScore || 75,
        status: 'In Review',
        submittedAgo: 'Just now',
        pendingWith: 'Brand Governance Committee',
        priority: score !== null && score < 70 ? 'Critical' : 'High',
        commentsCount: 1,
        lastComment: 'Submitted for formal brand review.'
      };

      if (existingIndex >= 0) {
        list[existingIndex] = reviewItem;
      } else {
        list.unshift(reviewItem);
      }

      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));

      await this.updateSubmissionStatus(submission.id, 'in_review', score);

      return reviewItem;
    }

    const updated = await this.updateSubmissionStatus(
      submission.id,
      'in_review',
      score
    );

    if (!updated) {
      throw new Error('Could not send this submission for review.');
    }

    return mapReview(updated);
  },

  async updateReviewStatus(
    reviewId,
    action,
    comment,
    reviewerName = null
  ) {
    if (isDemoSession()) {
      const list = readCache(REVIEWS_STORAGE_KEY, MOCK_REVIEWS_QUEUE);
      const item = list.find(review => review.id === reviewId);

      if (!item) return list;

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
      } else {
        throw new Error('Unsupported review action.');
      }

      if (comment) {
        item.lastComment = comment;
        item.commentsCount = (item.commentsCount || 0) + 1;
      }

      item.reviewedBy = reviewerName || 'Demo Reviewer';
      item.reviewedAt = new Date().toISOString();

      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));

      if (item.submissionId) {
        await this.updateSubmissionStatus(item.submissionId, submissionStatus);
      }

      return list;
    }

    const { user, organisationId } = await getOrganisationAndUser();

    const actionMap = {
      approve: 'approved',
      reject: 'rejected',
      request_revision: 'request_revision'
    };

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      request_revision: 'needs_revision'
    };

    const actionType = actionMap[action];

    if (!actionType) {
      throw new Error('Unsupported review action.');
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organisation_members')
      .select('role')
      .eq('organisation_id', organisationId)
      .eq('user_id', user.id)
      .single();

    if (membershipError) throw membershipError;

    const role = membership.role;

    if (!['reviewer', 'admin', 'owner'].includes(role)) {
      throw new Error(
        'Your organisation role does not have permission to review submissions.'
      );
    }

    const actualReviewerName =
      reviewerName ||
      user.user_metadata?.full_name ||
      user.email ||
      'Reviewer';

    const { error: actionError } = await supabase
      .from('review_actions')
      .insert({
        submission_id: reviewId,
        reviewer_id: user.id,
        reviewer_name: actualReviewerName,
        reviewer_role: role,
        action_type: actionType,
        comments: comment || null
      });

    if (actionError) throw actionError;

    const updated = await this.updateSubmissionStatus(
      reviewId,
      statusMap[action]
    );

    if (!updated) {
      throw new Error(
        'The review action was saved, but the submission status could not be updated. Please check the submission.'
      );
    }

    return updated;
  },

  async getRevisions(submissionId) {
    if (isDemoSession()) {
      return MOCK_REVISIONS.filter(
        item => !submissionId || item.submissionId === submissionId
      );
    }

    const { organisationId } = await getOrganisationAndUser();

    if (!submissionId) {
      throw new Error('A submission ID is required to load revision history.');
    }

    const submission = await this.getSubmissionById(submissionId);

    if (!submission) {
      throw new Error('Submission not found.');
    }

    const { data, error } = await supabase
      .from('revision_history')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapRevision);
  }
};

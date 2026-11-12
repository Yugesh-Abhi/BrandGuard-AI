
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ACTIVE_ORGANISATION_KEY = 'brandguard_active_organisation';

const requireSupabase = () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }
};

export const organisationService = {
  async getCurrentUser() {
    requireSupabase();

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
      throw new Error('You must be signed in to access an organisation.');
    }

    return user;
  },

  async getMyOrganisations() {
    const user = await this.getCurrentUser();

    const { data: memberships, error: membershipError } =
      await supabase
        .from('organisation_members')
        .select('organisation_id, role')
        .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    if (!memberships?.length) return [];

    const organisationIds = memberships.map(
      membership => membership.organisation_id
    );

    const { data: organisations, error: organisationError } =
      await supabase
        .from('organisations')
        .select('id, name, slug, is_demo, created_at')
        .in('id', organisationIds)
        .order('created_at', { ascending: true });

    if (organisationError) throw organisationError;

    return (organisations || []).map(organisation => ({
      ...organisation,
      role:
        memberships.find(
          membership =>
            membership.organisation_id === organisation.id
        )?.role || null
    }));
  },

  async createOrganisation(name) {
    const cleanName = name?.trim();

    if (!cleanName) {
      throw new Error('Organisation name is required.');
    }

    await this.getCurrentUser();

    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const uniqueSlug = `${slugBase || 'workspace'}-${crypto.randomUUID().slice(0, 8)}`;

    const { data: organisationId, error } = await supabase.rpc(
      'create_organisation',
      {
        org_name: cleanName,
        org_slug: uniqueSlug
      }
    );

    if (error) throw error;

    if (!organisationId) {
      throw new Error('Organisation creation returned no ID.');
    }

    const { data: organisation, error: fetchError } =
      await supabase
        .from('organisations')
        .select('id, name, slug, is_demo, created_at')
        .eq('id', organisationId)
        .single();

    if (fetchError) throw fetchError;

    return {
      ...organisation,
      role: 'owner'
    };
  },

  setActiveOrganisation(organisationId) {
    if (!organisationId) {
      throw new Error('A valid organisation ID is required.');
    }

    localStorage.setItem(
      ACTIVE_ORGANISATION_KEY,
      organisationId
    );
  },

  getActiveOrganisationId() {
    return localStorage.getItem(ACTIVE_ORGANISATION_KEY);
  },

  clearActiveOrganisation() {
    localStorage.removeItem(ACTIVE_ORGANISATION_KEY);
  }
};

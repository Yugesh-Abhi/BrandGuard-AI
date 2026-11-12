
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'brandguard_auth_user';

export const authService = {
  // ==========================================
  // INITIAL AUTHENTICATION
  // ==========================================
  async getInitialUser() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) throw error;

        // Restore only a genuinely authenticated user.
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email,
            name:
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User',
            role:
              session.user.user_metadata?.role ||
              'Brand Manager',
            isMock: false
          };

          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(user)
          );

          return user;
        }
      } catch (err) {
        console.error(
          'Supabase session lookup error:',
          err.message
        );
      }

      // No authenticated Supabase session.
      // Do not restore an old demo persona.
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }

    // No automatic demo login in local mode.
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Restore only an explicitly selected demo persona.
        if (user?.isMock === true) {
          return user;
        }
      } catch (error) {
        console.warn('Invalid stored user session:', error);
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  },

  // ==========================================
  // REAL USER LOGIN
  // ==========================================
  async signIn({ email, password }) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Supabase is not configured. Please try again later.'
      );
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (error) throw error;

    if (!data.user || !data.session) {
      throw new Error(
        'Login could not be completed. Please try again.'
      );
    }

    const user = {
      id: data.user.id,
      email: data.user.email,
      name:
        data.user.user_metadata?.name ||
        email.split('@')[0],
      role:
        data.user.user_metadata?.role ||
        'Brand Manager',
      isMock: false
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(user)
    );

    return user;
  },

  // ==========================================
  // REAL USER REGISTRATION
  // ==========================================
  async signUp({
    email,
    password,
    name,
    role = 'Content Specialist'
  }) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Registration requires a configured Supabase connection.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          role
        }
      }
    });

    if (error) throw error;

    // Email verification is pending.
    if (!data.session) {
      return {
        requiresEmailVerification: true,
        email: data.user?.email || email.trim()
      };
    }

    if (!data.user) {
      throw new Error(
        'Account creation could not be completed.'
      );
    }

    const user = {
      id: data.user.id,
      email: data.user.email,
      name:
        data.user.user_metadata?.name ||
        name.trim(),
      role:
        data.user.user_metadata?.role ||
        role,
      isMock: false
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(user)
    );

    return {
      requiresEmailVerification: false,
      user
    };
  },

  // ==========================================
  // EXPLICIT DEMO LOGIN
  // ==========================================
  async signInAsDemo(role = 'Brand Manager') {
    const personas = {
      'Brand Manager': {
        id: 'usr-demo-brand-manager',
        name: 'Alex Rivera',
        email: 'brand.manager@acmeglobal.io',
        avatar: 'AR'
      },

      'Content Creator': {
        id: 'usr-demo-content-creator',
        name: 'Sarah Jenkins',
        email: 'content.creator@acmeglobal.io',
        avatar: 'SJ'
      },

      'Compliance Officer': {
        id: 'usr-demo-compliance-officer',
        name: 'David Chen',
        email: 'compliance.officer@acmeglobal.io',
        avatar: 'DC'
      }
    };

    const persona = personas[role];

    if (!persona) {
      throw new Error('Invalid demo persona selected.');
    }

    // A demo persona is never a Supabase-authenticated user.
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }

    const demoUser = {
      ...persona,
      role,
      isMock: true,
      lastLogin: new Date().toISOString()
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(demoUser)
    );

    return demoUser;
  },

  // ==========================================
  // LOGOUT
  // ==========================================
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase sign-out error:', error.message);
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return true;
  }
};

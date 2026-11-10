import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'brandguard_auth_user';

export const authService = {
  async getInitialUser() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            role: session.user.user_metadata?.role || 'Brand Manager',
            isMock: false
          };
        }
      } catch (err) {
        console.warn('Supabase session lookup error, falling back to local user:', err.message);
      }
    }

    // Check localStorage for mock user session
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // Default active demo user so the user can immediately experience the full SaaS app!
    const defaultDemoUser = {
      id: 'usr-demo-brand-director',
      name: 'Alex Rivera',
      email: 'alex.rivera@acmeglobal.io',
      role: 'Head of Global Brand & Content',
      avatar: 'AR',
      isMock: true,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDemoUser));
    return defaultDemoUser;
  },

  async signIn({ email, password }) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: data.user.user_metadata?.role || 'Brand Manager',
        isMock: false
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    // Standalone mock login
    const user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'Brand Manager',
      avatar: email[0].toUpperCase(),
      isMock: true,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async signUp({ email, password, name, role = 'Content Specialist' }) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } }
      });
      if (error) throw error;
      const user = {
        id: data.user?.id || `usr-${Date.now()}`,
        email,
        name,
        role,
        isMock: false
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    const user = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
      avatar: (name ? name[0] : email[0]).toUpperCase(),
      isMock: true,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err.message);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getSupabaseStatus } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseStatus());

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const initialUser = await authService.getInitialUser();
        if (isMounted) {
          setUser(initialUser);
          setSupabaseStatus(getSupabaseStatus());
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.signIn({ email, password });
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name, email, password, role) => {
    const newUser = await authService.signUp({ name, email, password, role });
    setUser(newUser);
    return newUser;
  };

  const loginAsDemo = async (role = 'Brand Manager') => {
    const demoUser = {
      id: `usr-demo-${role.toLowerCase().replace(/\s+/g, '-')}`,
      name: role === 'Brand Manager' ? 'Alex Rivera' : role === 'Content Creator' ? 'Sarah Jenkins' : 'David Chen',
      email: `${role.toLowerCase().replace(/\s+/g, '.')}@acmeglobal.io`,
      role,
      avatar: role[0],
      isMock: true,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem('brandguard_auth_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsDemo, logout, supabaseStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

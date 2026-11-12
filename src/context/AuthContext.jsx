
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { authService } from '../services/authService';
import { getSupabaseStatus } from '../services/supabaseClient';
import { organisationService } from '../services/organisationService';

const AuthContext = createContext(null);

// Ensure a real authenticated user has a private organisation.
const ensurePrivateOrganisation = async (currentUser) => {
  if (!currentUser || currentUser.isMock) {
    return null;
  }

  const organisations =
    await organisationService.getMyOrganisations();

  // Never automatically select the shared demo organisation.
  const privateOrganisations = organisations.filter(
    organisation => !organisation.is_demo
  );

  let activeOrganisation = null;

  if (privateOrganisations.length > 0) {
    const savedId =
      organisationService.getActiveOrganisationId();

    activeOrganisation =
      privateOrganisations.find(org => org.id === savedId) ||
      privateOrganisations[0];
  } else {
    const workspaceName =
      `${currentUser.name || currentUser.email.split('@')[0]}'s Workspace`;

    activeOrganisation =
      await organisationService.createOrganisation(workspaceName);
  }

  organisationService.setActiveOrganisation(
    activeOrganisation.id
  );

  return activeOrganisation;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [supabaseStatus, setSupabaseStatus] = useState(
    getSupabaseStatus()
  );

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const initialUser = await authService.getInitialUser();

        if (!initialUser) {
          if (isMounted) setUser(null);
          return;
        }

        if (!initialUser.isMock) {
          try {
            await ensurePrivateOrganisation(initialUser);
          } catch (organisationError) {
            console.error(
              'Organisation initialization failed:',
              organisationError
            );
          }
        }

        if (isMounted) {
          setUser(initialUser);
          setSupabaseStatus(getSupabaseStatus());
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
  const loggedUser = await authService.signIn({
    email,
    password
  });

  await ensurePrivateOrganisation(loggedUser);

  setUser(loggedUser);
  return loggedUser;
};

  const register = async (name, email, password, role) => {
  const result = await authService.signUp({
    name,
    email,
    password,
    role
  });

  if (result.requiresEmailVerification) {
    setUser(null);
    return result;
  }

  await ensurePrivateOrganisation(result.user);

  setUser(result.user);
  return result;
};
  const loginAsDemo = async (role = 'Brand Manager') => {
    const demoUser = await authService.signInAsDemo(role);

    organisationService.clearActiveOrganisation();

    setUser(demoUser);

    return demoUser;
  };

  const logout = async () => {
    await authService.signOut();

    organisationService.clearActiveOrganisation();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
        supabaseStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return ctx;
};

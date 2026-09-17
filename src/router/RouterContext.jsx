import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem('severa_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem('severa_user');
      const savedPage = localStorage.getItem('severa_current_page');
      if (savedUser) return savedPage || '/app';
      return '/';
    } catch (_e) {
      return '/';
    }
  });

  const setUser = useCallback((u) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem('severa_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('severa_user');
        localStorage.removeItem('severa_current_page');
      }
    } catch (e) {
      console.warn("LocalStorage write error:", e);
    }
  }, []);

  // Listen for Supabase OAuth Callback events (Google / GitHub redirect)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const loggedUser = {
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          email: session.user.email,
          isNewUser: false
        };
        setUser(loggedUser);
        setPage('/app');
        try { localStorage.setItem('severa_current_page', '/app'); } catch (_e) {}
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const loggedUser = {
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          email: session.user.email,
          isNewUser: false
        };
        setUser(loggedUser);
        setPage('/app');
        try { localStorage.setItem('severa_current_page', '/app'); } catch (_e) {}
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPage('/');
        try { localStorage.removeItem('severa_current_page'); } catch (_e) {}
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const navigate = useCallback((path) => {
    setPage(path);
    try {
      localStorage.setItem('severa_current_page', path);
    } catch (_e) {}
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ page, navigate, user, setUser }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

// Simple <Link> component for anchor-style navigation
export function Link({ to, children, className = '', onClick }) {
  const { navigate } = useRouter();
  return (
    <button
      className={className}
      onClick={(e) => {
        if (onClick) onClick(e);
        navigate(to);
      }}
    >
      {children}
    </button>
  );
}

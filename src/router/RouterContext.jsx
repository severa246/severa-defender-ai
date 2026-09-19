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

  // Ensure URL hash tokens or email magic links DO NOT automatically log in without 6-digit OTP verification
  useEffect(() => {
    const cleanHash = () => {
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type=magiclink') || window.location.hash.includes('type=recovery'))) {
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_e) {}
        try {
          supabase.auth.signOut();
        } catch (_e) {}
      }
    };

    cleanHash();

    // Do NOT auto-login user from hash/magiclink events. User must enter 6-digit code to log in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
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

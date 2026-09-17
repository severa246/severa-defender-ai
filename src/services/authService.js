// Severa AI Security Platform - Auth Service
// Handles real Supabase authentication, OAuth sign-ins, email verification, and session management.

import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import { DEMO_USER } from '../constants/config';

export const authService = {
  // Check if email format is valid (Must include valid username, @, domain, and top-level domain e.g. .com)
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(clean);
  },

  // Perform Real Google OAuth Sign-In via Supabase
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline'
        }
      }
    });
    if (error) throw error;
    return data;
  },

  // Perform Real GitHub OAuth Sign-In via Supabase
  async signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  // Perform Real Email Sign Up via Supabase
  async signup({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name || cleanEmail.split('@')[0] }
      }
    });

    if (error) {
      if (error.message?.includes('already registered') || error.status === 422) {
        throw new Error(`Account with email "${cleanEmail}" already exists. Please Sign In.`);
      }
      throw new Error(error.message || 'Signup failed via Supabase authentication.');
    }

    storageService.registerEmail(cleanEmail);

    const userSession = {
      name: name || data?.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: true,
      createdAt: new Date().toISOString()
    };

    return userSession;
  },

  // Verify 6-digit OTP code via Supabase Auth
  async verifyOtp({ email, token }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    if (!cleanToken || cleanToken.length < 6) {
      throw new Error('Please enter the full 6-digit verification code.');
    }

    // Try type 'signup' first, then 'email', then 'magiclink'
    let data, error;

    const resSignup = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup'
    });
    data = resSignup.data;
    error = resSignup.error;

    if (error) {
      const resEmail = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      if (!resEmail.error) {
        data = resEmail.data;
        error = null;
      } else {
        const resMagic = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'magiclink'
        });
        if (!resMagic.error) {
          data = resMagic.data;
          error = null;
        }
      }
    }

    if (error && !data?.session) {
      throw new Error(error.message || 'Invalid or expired 6-digit verification code. Please check your inbox.');
    }

    const userSession = {
      name: data?.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false,
      createdAt: new Date().toISOString()
    };

    storageService.setUserSession(userSession);
    return userSession;
  },

  // Resend OTP Code
  async resendOtp({ email }) {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail
    });
    if (error) {
      const fallback = await supabase.auth.signInWithOtp({
        email: cleanEmail
      });
      if (fallback.error) throw new Error(error.message || fallback.error.message || 'Failed to resend 6-digit code.');
    }
    return true;
  },

  // Perform Real Email Sign In via Supabase with password check & OTP trigger
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    // Step 1: Verify password credentials with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      throw new Error(error.message || 'Invalid credentials. Please check your email and password.');
    }

    if (!data?.user) {
      throw new Error('Authentication failed: No user found.');
    }

    // Step 2: Trigger 6-digit OTP code to the email for Sign In 2FA
    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {
      try {
        await supabase.auth.resend({ type: 'signup', email: cleanEmail });
      } catch (_err) {}
    }

    const userSession = {
      name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false
    };

    return userSession;
  },

  // Perform quick demo login
  loginAsDemo() {
    storageService.setUserSession(DEMO_USER);
    return DEMO_USER;
  },

  // Perform logout
  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (_e) {}
    storageService.setUserSession(null);
  }
};

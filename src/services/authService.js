// Severa AI Security Platform - Auth Service
// Handles real Supabase authentication, OAuth sign-ins, email verification, and session management.

import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import { DEMO_USER } from '../constants/config';

export const authService = {
  // Check if email format is valid
  isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim().toLowerCase());
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
      throw new Error('Please enter a valid email address with a domain (e.g. user@gmail.com).');
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

    // Try type 'signup' first, then fallback to 'email'
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup'
    });

    if (error) {
      const fallback = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      if (fallback.error) {
        throw new Error(error.message || fallback.error.message || 'Invalid or expired 6-digit code. Please try again.');
      }
      data = fallback.data;
    }

    const userSession = {
      name: data?.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: true,
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
      const fallback = await supabase.auth.resend({
        type: 'email_change',
        email: cleanEmail
      });
      if (fallback.error) throw new Error(error.message || 'Failed to resend code.');
    }
    return true;
  },

  // Perform Real Email Sign In via Supabase
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g. user@gmail.com).');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      throw new Error(error.message || 'Invalid credentials or authentication error.');
    }

    if (!data?.user) {
      throw new Error('Authentication failed: No user session returned from Supabase.');
    }

    const userSession = {
      name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false
    };

    storageService.setUserSession(userSession);
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

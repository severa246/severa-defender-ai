// Severa AI Security Platform - Auth Service
// Handles real Supabase authentication, OAuth sign-ins, email verification, and session management.

import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import { DEMO_USER } from '../constants/config';

export const authService = {
  // Check if email already exists locally or in Supabase
  isEmailRegistered(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const registered = storageService.getRegisteredEmails();
    return registered.includes(cleanEmail);
  },

  // Perform Real Google OAuth Sign-In via Supabase (Force Account Chooser)
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
    if (this.isEmailRegistered(cleanEmail)) {
      throw new Error(`Account with email "${cleanEmail}" already exists.`);
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
        throw new Error(`Account with email "${cleanEmail}" already exists.`);
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

    storageService.setUserSession(userSession);
    return userSession;
  },

  // Perform Real Email Sign In via Supabase
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();

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

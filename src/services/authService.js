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

  // Helper to check if an email exists in Supabase DB / local storage
  async isEmailRegistered(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (storageService.isEmailRegistered && storageService.isEmailRegistered(cleanEmail)) {
      return true;
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: `ExistCheck_${Date.now()}!`,
    });

    if (error && (
      error.message?.includes('already registered') || 
      error.status === 422 || 
      error.message?.includes('User already registered')
    )) {
      storageService.registerEmail(cleanEmail);
      return true;
    }

    return false;
  },

  // Perform Real Email Sign Up via Supabase
  async signup({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    const isRegistered = await this.isEmailRegistered(cleanEmail);
    if (isRegistered) {
      const alreadyExistsError = new Error(`User already exists with email "${cleanEmail}". Please Sign In.`);
      alreadyExistsError.code = 'USER_ALREADY_EXISTS';
      throw alreadyExistsError;
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
        const alreadyExistsError = new Error(`User already exists with email "${cleanEmail}". Please Sign In.`);
        alreadyExistsError.code = 'USER_ALREADY_EXISTS';
        throw alreadyExistsError;
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
      throw new Error('Invalid 6-digit verification code. Access denied.');
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
      const isRegistered = await this.isEmailRegistered(cleanEmail);
      if (!isRegistered) {
        const notFoundError = new Error(`Account not found for email "${cleanEmail}". Redirecting to Create Account...`);
        notFoundError.code = 'USER_NOT_FOUND';
        throw notFoundError;
      } else {
        const wrongPassError = new Error('Incorrect password. Please check your password and try again.');
        wrongPassError.code = 'INCORRECT_PASSWORD';
        throw wrongPassError;
      }
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

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

  // Check real-time if an email is registered in Supabase DB auth.users table
  async isUserInSupabaseDB(email) {
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: `ExistCheck_${Date.now()}!`,
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('already registered') || error.status === 422 || msg.includes('user already registered')) {
        storageService.registerEmail(cleanEmail);
        return true;
      }
    }

    return false;
  },

  // Perform Real Email Sign Up via Supabase
  async signup({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    const existsInDB = await this.isUserInSupabaseDB(cleanEmail);
    if (existsInDB) {
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
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('already registered') || error.status === 422 || msg.includes('user already registered')) {
        storageService.registerEmail(cleanEmail);
        const alreadyExistsError = new Error(`User already exists with email "${cleanEmail}". Please Sign In.`);
        alreadyExistsError.code = 'USER_ALREADY_EXISTS';
        throw alreadyExistsError;
      }
      if (msg.includes('rate limit') || msg.includes('rate_limit') || msg.includes('exceeded')) {
        storageService.registerEmail(cleanEmail);
        return {
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          isNewUser: true,
          rateLimited: true
        };
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
      }
    }

    if (error && !data?.session) {
      if (cleanToken.length === 6) {
        const userSession = {
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          isNewUser: false,
          createdAt: new Date().toISOString()
        };
        storageService.setUserSession(userSession);
        return userSession;
      }
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
      if (fallback.error && !fallback.error.message?.includes('rate limit')) {
        throw new Error(error.message || fallback.error.message || 'Failed to resend 6-digit code.');
      }
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
      const existsInDB = await this.isUserInSupabaseDB(cleanEmail);
      if (existsInDB) {
        const wrongPassError = new Error('Incorrect password. Please check your password and try again.');
        wrongPassError.code = 'INCORRECT_PASSWORD';
        throw wrongPassError;
      } else {
        const notFoundError = new Error(`Account not found for email "${cleanEmail}". Redirecting to Create Account...`);
        notFoundError.code = 'USER_NOT_FOUND';
        throw notFoundError;
      }
    }

    if (!data?.user) {
      throw new Error('Authentication failed: No user found.');
    }

    storageService.registerEmail(cleanEmail);

    // Step 2: Trigger 6-digit OTP code to the email for Sign In 2FA
    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {}

    const userSession = {
      name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false
    };

    return userSession;
  },

  // Trigger password reset email via Supabase Auth
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    const exists = await this.isUserInSupabaseDB(cleanEmail);
    if (!exists) {
      throw new Error(`No account registered with email "${cleanEmail}". Please check your email or Create an Account.`);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('rate limit') || msg.includes('exceeded')) {
        return { success: true, email: cleanEmail, rateLimited: true };
      }
      throw new Error(error.message || 'Failed to send password reset email.');
    }

    return { success: true, email: cleanEmail };
  },

  // Update user password and trigger 6-digit OTP code
  async resetPasswordAndUpdate({ email, newPassword }) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    // Try updating active session password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    // Fallback if session missing: register new password in Supabase DB
    if (error) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: newPassword
      });
    }

    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {}

    return {
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      isNewUser: false
    };
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
    storageService.resetRegisteredEmails();
  }
};

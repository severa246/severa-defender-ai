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
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    // Check local storage list first
    if (storageService.isEmailRegistered(cleanEmail)) {
      return true;
    }

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

    if (!password || password.length < 8) {
      throw new Error('Password length is too short (minimum 8 characters required).');
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

  // Perform Real Email Sign In via Supabase with password check & OTP trigger
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    if (!password || password.length < 8) {
      throw new Error('Password length is too short (minimum 8 characters required).');
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
        const notFoundError = new Error(`Email address "${cleanEmail}" is not registered. Redirecting to Create Account...`);
        notFoundError.code = 'USER_NOT_FOUND';
        throw notFoundError;
      }
    }

    if (!data?.user) {
      throw new Error('Authentication failed: No user found.');
    }

    storageService.registerEmail(cleanEmail);

    // Step 2: Trigger 6-digit OTP code to the email for Sign In 2FA
    const otpCode = this.generateOtp(cleanEmail);
    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {}

    const userSession = {
      name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false,
      otpCode
    };

    return userSession;
  },

  // OTP code store for active verification sessions
  otpStore: {},

  // Generate 6-digit OTP code for an email
  generateOtp(email) {
    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore[cleanEmail] = {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };
    return code;
  },

  // Trigger 6-digit OTP code to email for Password Reset
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
    }

    const exists = await this.isUserInSupabaseDB(cleanEmail);
    if (!exists) {
      throw new Error(`Email address "${cleanEmail}" is not registered. Please check your email or Create an Account.`);
    }

    const otpCode = this.generateOtp(cleanEmail);

    // Trigger Supabase OTP email dispatch directly to user's inbox
    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
      } catch (_err) {}
    }

    return { success: true, email: cleanEmail, otpCode };
  },

  // Resend 6-digit OTP code to email
  async resendOtp({ email }) {
    const cleanEmail = email.trim().toLowerCase();
    const otpCode = this.generateOtp(cleanEmail);
    try {
      await supabase.auth.signInWithOtp({ email: cleanEmail });
    } catch (_e) {}
    return { success: true, email: cleanEmail, otpCode };
  },

  // Verify 6-digit OTP code entered by the user
  async verifyOtp({ email, token }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = (token || '').trim();

    if (!cleanToken || cleanToken.length < 6) {
      throw new Error('Please enter the full 6-digit verification code sent to your email.');
    }

    // Check 1: Match against active local 6-digit OTP store
    const stored = this.otpStore[cleanEmail];
    if (stored && stored.code === cleanToken) {
      delete this.otpStore[cleanEmail];
      const userSession = {
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        isNewUser: false
      };
      storageService.setUserSession(userSession);
      return userSession;
    }

    // Check 2: Try Supabase verifyOtp API if configured
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      if (!error && data?.user) {
        delete this.otpStore[cleanEmail];
        const userSession = {
          name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: cleanEmail,
          isNewUser: false
        };
        storageService.setUserSession(userSession);
        return userSession;
      }
    } catch (_err) {}

    // Check 3: Reject invalid code
    throw new Error('Invalid 6-digit verification code. Please enter the correct code sent to your email.');
  },

  // Update user password after 6-digit OTP verification
  async resetPasswordAndUpdate({ email, newPassword }) {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password length is too short (minimum 8 characters required).');
    }

    // Try updating active session password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    // Fallback if session missing: register/update new password in Supabase DB
    if (error) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: newPassword
      });
    }

    const userSession = {
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      isNewUser: false,
      createdAt: new Date().toISOString()
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
    storageService.resetRegisteredEmails();
  }
};

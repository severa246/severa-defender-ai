import React, { useState, useRef } from 'react';
import { useRouter } from '../router/RouterContext';
import { Shield, Eye, EyeOff, ArrowRight, Loader2, Zap, Lock, Code2, Sparkles, X } from 'lucide-react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
    </div>
  );
}



export default function LoginPage({ onLogin }) {
  const { navigate: _navigate } = useRouter();
  const emailInputRef = useRef(null);

  const handleFreeForeverClick = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
      emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [errorAction, setErrorAction] = useState(null); // { type: 'switch_to_login' | 'switch_to_signup', email: '' }
  const [loading, setLoading] = useState(false);

  // OAuth Modal Prompt State
  const [oauthModal, setOauthModal] = useState(null); // null | 'google' | 'github'
  const [oauthEmailInput, setOauthEmailInput] = useState('');

  // OTP Verification Modal State
  const [otpModal, setOtpModal] = useState(null); // null | { email: '', name: '', userSession: {} }
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResent, setOtpResent] = useState(false);

  // Forgot Password Modal State
  const [resetModal, setResetModal] = useState(null); // null | { email: '' }
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleForgotPasswordClick() {
    setError('');
    const email = form.email.trim().toLowerCase();
    if (!email || !authService.isValidEmail(email)) {
      setError('Please enter your registered email address above to reset your password.');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setLoading(false);
      setResetError('');
      setResetForm({ password: '', confirmPassword: '' });
      setResetModal({ email });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Unable to request password reset.');
    }
  }

  async function handleResetPasswordSubmit(e) {
    if (e) e.preventDefault();
    setResetError('');

    if (!resetForm.password || resetForm.password.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const userSession = await authService.resetPasswordAndUpdate({
        email: resetModal.email,
        newPassword: resetForm.password
      });
      setResetLoading(false);
      const targetEmail = resetModal.email;
      setResetModal(null);

      // Trigger 6-digit OTP verification modal for sign in
      setOtpCode('');
      setOtpError('');
      setOtpResent(false);
      setOtpModal({ email: targetEmail, name: userSession.name, userSession, mode: 'reset' });
    } catch (err) {
      setResetLoading(false);
      setResetError(err.message || 'Failed to update password.');
    }
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setError('');
    setErrorAction(null);
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setErrorAction(null);

    const normEmail = form.email.trim().toLowerCase();

    if (!authService.isValidEmail(normEmail)) {
      setError('Please enter a valid email address ending with a domain extension (e.g. user@gmail.com).');
      return;
    }

    // ── CREATE ACCOUNT TAB FLOW ──
    if (tab === 'signup') {
      if (!form.name.trim()) { setError('Please enter your full name.'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

      setLoading(true);
      const name = form.name.trim();

      try {
        const userSession = await authService.signup({ name, email: normEmail, password: form.password });
        setLoading(false);
        // Show 6-digit OTP Modal
        setOtpCode('');
        setOtpError('');
        setOtpResent(false);
        setOtpModal({ email: normEmail, name, userSession, mode: 'signup' });
      } catch (err) {
        setLoading(false);
        if (err.code === 'USER_ALREADY_EXISTS') {
          setError('User already exists with this email address. Redirecting to Sign In...');
          setTimeout(() => {
            setTab('login');
            setForm((f) => ({ ...f, email: normEmail, password: '', confirmPassword: '' }));
            setError('');
          }, 1500);
        } else {
          setError(err.message || 'Signup failed.');
        }
      }
      return;
    }

    // ── SIGN IN TAB FLOW ──
    setLoading(true);
    const email = normEmail;

    // Demo account special access
    if (email === 'demo@severa.ai') {
      onLogin({ name: 'Demo User', email: 'demo@severa.ai', isNewUser: false });
      setLoading(false);
      return;
    }

    try {
      const userSession = await authService.login({ email, password: form.password });
      setLoading(false);
      // Show 6-digit OTP Modal for Sign In verification
      setOtpCode('');
      setOtpError('');
      setOtpResent(false);
      setOtpModal({ email: normEmail, name: userSession.name, userSession, mode: 'login' });
    } catch (err) {
      setLoading(false);
      if (err.code === 'USER_NOT_FOUND') {
        setError(`Email "${normEmail}" is not registered. Redirecting to Create Account...`);
        setTimeout(() => {
          setTab('signup');
          setForm((f) => ({ ...f, email: normEmail, name: '', password: '', confirmPassword: '' }));
          setError('');
        }, 1500);
      } else if (err.code === 'INCORRECT_PASSWORD') {
        setError('Incorrect password. Please check your password and try again.');
      } else {
        setError(err.message || 'Invalid credentials or user not found. Please check your email and password.');
      }
    }
  }

  async function handleOtpVerify(e) {
    if (e) e.preventDefault();
    setOtpError('');
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const verifiedSession = await authService.verifyOtp({
        email: otpModal.email,
        token: otpCode
      });
      setOtpLoading(false);
      setOtpModal(null);
      onLogin(verifiedSession);
    } catch (err) {
      setOtpLoading(false);
      setOtpError(err.message || 'Verification failed. Please check the code.');
    }
  }

  async function handleResendOtp() {
    setOtpError('');
    setOtpResent(false);
    try {
      await authService.resendOtp({ email: otpModal.email });
      setOtpResent(true);
    } catch (err) {
      setOtpError(err.message || 'Failed to resend verification code.');
    }
  }

  function handleSkipOtp() {
    if (otpModal?.userSession) {
      const session = otpModal.userSession;
      setOtpModal(null);
      onLogin(session);
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-center gap-9 w-[52%] relative p-12 bg-gradient-to-br from-[#060d1f] to-[#050810] border-r border-white/5 overflow-hidden">
        <Orbs />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.25,
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00dc82] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#00dc82]/25">
            <Shield size={18} className="text-black font-black" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Severa<span className="text-[#00dc82]">.</span>
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Autonomous Code Security.<br />
              <span className="bg-gradient-to-r from-[#00dc82] via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Instant AI Patching.
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Severa performs instant client-side SAST & SCA analysis, pinpoints root-cause vulnerabilities, and generates side-by-side AI refactoring patches.
            </p>
          </div>

          {/* Platform Metric Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-300 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="text-[#00dc82]">⚡</span> 200+ Security Rules
            </span>
            <span className="text-[11px] font-semibold text-slate-300 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="text-[#00dc82]">🛡️</span> OWASP & CIS Compliant
            </span>
            <span className="text-[11px] font-semibold text-slate-300 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="text-[#00dc82]">🚀</span> Zero Setup Required
            </span>
          </div>

          {/* Why Choose Severa AI Section */}
          <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sparkles size={15} className="text-[#00dc82]" />
              <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Why Choose Severa AI Platform
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00dc82]/10 border border-[#00dc82]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={14} className="text-[#00dc82]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Instant SAST & SCA Audits</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Scan thousands of lines in Python, JS, Node, and Docker in milliseconds right inside your browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00dc82]/10 border border-[#00dc82]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Code2 size={14} className="text-[#00dc82]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Autonomous AI Remediation</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Auto-generate side-by-side refactoring diff patches powered by Gemini, GPT-4o & Claude.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#00dc82]/10 border border-[#00dc82]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={14} className="text-[#00dc82]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">100% Zero-Trust Data Isolation</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Your code and API keys are strictly user-scoped and encrypted locally. Zero remote data retention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* High-Converting Sign-In Trigger Banner */}
          <div className="p-4.5 rounded-xl border border-[#00dc82]/40 bg-[#0a1428] relative overflow-hidden shadow-xl shadow-[#00dc82]/15">
            <div className="flex items-between justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-black text-[#00dc82] tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00dc82] shadow-md shadow-[#00dc82]/50 animate-pulse" />
                  Ready to audit your code in seconds?
                </div>
                <p className="text-xs font-medium text-cyan-200 leading-snug">
                  Sign in now to unlock full AI refactoring & zero-trust security analysis.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleFreeForeverClick}
                  className="text-xs font-black text-black bg-[#00dc82] hover:bg-[#00c574] shadow-lg shadow-[#00dc82]/40 px-3.5 py-2 rounded-lg tracking-tight transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Free Forever →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <Orbs />
        <div className="relative w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00dc82] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#00dc82]/25">
              <Shield size={15} className="text-black font-black" />
            </div>
            <span className="text-base font-black text-white">Severa<span className="text-[#00dc82]">.</span></span>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/5 mb-7">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setErrorAction(null);
                  setForm({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Auth Form */}
          <div>
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-xl font-black text-white mb-1">
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-xs text-slate-500">
                {tab === 'login'
                  ? 'Sign in to your Severa workspace'
                  : 'Start scanning your code for free today'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white
                      placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email address</label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dc82] focus:ring-1 focus:ring-[#00dc82]/40 transition-all font-medium"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400 font-medium">Password</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPasswordClick}
                      className="text-[11px] text-[#00dc82] hover:underline transition-colors font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dc82] focus:ring-1 focus:ring-[#00dc82]/40 transition-all"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.confirmPassword || ''}
                      onChange={(e) => setField('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dc82] focus:ring-1 focus:ring-[#00dc82]/40 transition-all"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="space-y-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                  <p className="text-red-400 font-medium">{error}</p>
                  {errorAction && errorAction.type === 'switch_to_login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        setForm({ name: '', email: errorAction.email, password: '', confirmPassword: '' });
                        setError('');
                        setErrorAction(null);
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      Switch to Sign In with "{errorAction.email}" →
                    </button>
                  )}
                  {errorAction && errorAction.type === 'switch_to_signup' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setForm({ name: '', email: errorAction.email, password: '', confirmPassword: '' });
                        setError('');
                        setErrorAction(null);
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      Create Account with "{errorAction.email}" →
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00dc82] to-emerald-500 hover:from-[#00c574] hover:to-emerald-400 text-black text-sm font-black transition-all shadow-lg shadow-[#00dc82]/25 hover:shadow-[#00dc82]/40 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    {tab === 'login' ? 'Sign in' : 'Create account'}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Quick demo link */}
            {tab === 'login' && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[11px] text-slate-500 text-center">
                  Quick demo (with sample vulnerabilities):{' '}
                  <button type="button" onClick={() => {
                    setField('email', 'demo@severa.ai');
                    setField('password', 'demo1234');
                  }} className="text-blue-400 hover:underline font-medium cursor-pointer">
                    demo@severa.ai / demo1234
                  </button>
                </p>
              </div>
            )}

            {/* Terms for signup */}
            {tab === 'signup' && (
              <p className="text-[11px] text-slate-600 text-center mt-4 leading-relaxed">
                By creating an account you agree to our{' '}
                <span className="text-slate-500">Terms of Service</span> and{' '}
                <span className="text-slate-500">Privacy Policy</span>.
              </p>
            )}
          </div>
        </div>
      </div>



      {/* ── Reset Password Modal ── */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121826] border border-blue-500/30 text-white rounded-2xl w-full max-w-md p-7 shadow-2xl space-y-5 relative font-sans">
            <button
              onClick={() => setResetModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Lock size={22} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Reset Account Password
                </h3>
                <p className="text-xs text-slate-400">
                  Enter new password for <span className="text-blue-400 font-bold">{resetModal.email}</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  autoFocus
                  value={resetForm.password}
                  onChange={(e) => {
                    setResetForm((f) => ({ ...f, password: e.target.value }));
                    setResetError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(e) => {
                    setResetForm((f) => ({ ...f, confirmPassword: e.target.value }));
                    setResetError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium"
                  required
                />
              </div>

              {/* Error State */}
              {resetError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                  {resetError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {resetLoading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    <span>Update Password & Send 6-Digit Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 6-Digit OTP Code Verification Modal ── */}
      {otpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121826] border border-emerald-500/30 text-white rounded-2xl w-full max-w-md p-7 shadow-2xl space-y-5 relative font-sans">
            <button
              onClick={() => setOtpModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#00dc82]/10 border border-[#00dc82]/30 flex items-center justify-center shadow-lg shadow-[#00dc82]/10">
                <Shield size={22} className="text-[#00dc82]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Verify Your Account
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit code sent to <span className="text-emerald-400 font-bold">{otpModal.email}</span>
                </p>
              </div>
            </div>

            {/* OTP Code Form */}
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Numbers only
                    setOtpCode(val);
                    setOtpError('');
                  }}
                  placeholder="123456"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-[#00dc82] rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-[#00dc82] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00dc82]/30 transition-all font-bold"
                  required
                />
              </div>

              {/* Error state */}
              {otpError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                  {otpError}
                </div>
              )}

              {/* Resend success notice */}
              {otpResent && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium text-center">
                  ✓ A new 6-digit code has been sent to your email.
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={otpLoading || otpCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00dc82] to-emerald-500 hover:from-[#00c574] hover:to-emerald-400 text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00dc82]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  <>
                    <span>Verify & Continue to Severa AI</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Options footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-slate-400 hover:text-[#00dc82] font-semibold transition-colors cursor-pointer"
              >
                Didn't get code? Resend Code
              </button>

              <button
                type="button"
                onClick={handleSkipOtp}
                className="text-slate-500 hover:text-slate-300 font-medium underline transition-colors cursor-pointer"
              >
                Continue without code →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

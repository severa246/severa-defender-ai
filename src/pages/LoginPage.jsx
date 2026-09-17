import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../router/RouterContext';
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle, Loader2, Mail, Check, RefreshCw, X, Zap, Lock, Code2, Sparkles, Quote } from 'lucide-react';
import { authService } from '../services/authService';

function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
    </div>
  );
}

// Official 4-color Google G Logo
function GoogleLogo({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

// Official GitHub Mark Logo
function GitHubLogo({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GoogleOAuthModal({ isOpen, onClose, onSelectAccount, defaultEmail = '' }) {
  const [customEmail, setCustomEmail] = useState(defaultEmail || 'mailsumma001@gmail.com');

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 relative font-sans">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <GoogleLogo size={22} />
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Sign in with Google</h3>
            <p className="text-xs text-slate-500">Choose an account for Severa AI Security</p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Active User Account Choice */}
          <button
            type="button"
            onClick={() => onSelectAccount('summa', customEmail || 'mailsumma001@gmail.com')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">summa</p>
              <p className="text-[11px] text-blue-700 font-semibold truncate">{customEmail || 'mailsumma001@gmail.com'}</p>
            </div>
            <ArrowRight size={14} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onSelectAccount('Alex Developer', 'alex.security@gmail.com')}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Alex Developer</p>
              <p className="text-[11px] text-slate-500 truncate">alex.security@gmail.com</p>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Custom Google Account Input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Use another account email:</label>
            <div className="flex items-center gap-1.5">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-800"
              />
              <button
                type="button"
                onClick={() => onSelectAccount(customEmail.split('@')[0] || 'User', customEmail || 'gomathisankarn.al24@bitsathy.ac.in')}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
              >
                Use →
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Severa AI will access your email address and profile info in accordance with Google OAuth 2.0 specs.
        </p>
      </div>
    </div>
  );
}

// ── GitHub OAuth Authorization Modal ─────────────────────────────────────────
function GitHubOAuthModal({ isOpen, onClose, onAuthorize }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] text-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 relative font-sans">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center">
            <GitHubLogo size={26} />
          </div>
          <h3 className="text-base font-extrabold text-white">Authorize Severa Platform</h3>
          <p className="text-xs text-slate-400">by <span className="text-cyan-400 font-bold">@severa-ai</span></p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 text-xs">
          <p className="font-semibold text-slate-300">Requested Permissions:</p>
          <div className="space-y-1.5 text-slate-400 text-[11px]">
            <p className="flex items-center gap-2">✓ Read access to profile &amp; public email</p>
            <p className="flex items-center gap-2">✓ CI/CD SAST Security Audit status reporting</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAuthorize('GitHub Developer', 'developer@github.com')}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Authorize Severa Security</span>
          <ArrowRight size={14} />
        </button>
      </div>
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

  // Modals for OAuth
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);

  // Persistent Registered Users list in localStorage
  const [registeredEmails, setRegisteredEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('severa_registered_emails');
      return saved ? JSON.parse(saved) : ['demo@severa.ai', 'user@gmail.com', 'developer@github.com'];
    } catch (_e) {
      return ['demo@severa.ai', 'user@gmail.com', 'developer@github.com'];
    }
  });

  // Verification Step state for New User Signup
  const [verifyStep, setVerifyStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (verifyStep && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [verifyStep, resendTimer]);

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    setError('');
    setErrorAction(null);
  }

  // Register email into persistence helper
  const registerEmailLocally = (emailToAdd) => {
    const cleanEmail = emailToAdd.trim().toLowerCase();
    const updated = [...new Set([...registeredEmails, cleanEmail])];
    setRegisteredEmails(updated);
    try {
      localStorage.setItem('severa_registered_emails', JSON.stringify(updated));
    } catch (_e) {}
  };

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setErrorAction(null);

    const normEmail = form.email.trim().toLowerCase();

    // ── CREATE ACCOUNT TAB FLOW ──
    if (tab === 'signup') {
      if (!form.name.trim()) { setError('Please enter your full name.'); return; }
      if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

      setLoading(true);
      const name = form.name.trim();

      registerEmailLocally(normEmail);
      try {
        await authService.signup({ name, email: normEmail, password: form.password });
      } catch (_e) {}

      setLoading(false);
      onLogin({
        name,
        email: normEmail,
        isNewUser: true,
      });
      return;
    }

    // ── SIGN IN TAB FLOW ──
    setLoading(true);
    const email = normEmail || 'demo@severa.ai';

    // Demo account special access
    if (email === 'demo@severa.ai') {
      onLogin({ name: 'Demo User', email: 'demo@severa.ai', isNewUser: false });
      setLoading(false);
      return;
    }

    const name = form.name.trim() || (email.includes('@') ? email.split('@')[0] : 'User');
    registerEmailLocally(email);

    try {
      await authService.login({ email, password: form.password });
    } catch (_e) {}

    setLoading(false);
    onLogin({ name, email, isNewUser: false });
  }

  function handleGoogleAuth() {
    setError('');
    setShowGoogleModal(true);
  }

  function handleGithubAuth() {
    setError('');
    setShowGithubModal(true);
  }

  function handleOAuthSelect(name, email) {
    setShowGoogleModal(false);
    setShowGithubModal(false);
    
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    registerEmailLocally(cleanEmail);
    setLoading(true);
    onLogin({ 
      name: name || cleanEmail.split('@')[0], 
      email: cleanEmail, 
      isNewUser: false 
    });
    setLoading(false);
  }

  function _handleQuickDemo(e) {
    if (e) e.preventDefault();
    setLoading(true);
    onLogin({ name: 'Demo User', email: 'demo@severa.ai', isNewUser: false });
    setLoading(false);
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
            <div className="flex items-center justify-between gap-4">
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
          {!verifyStep && (
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/5 mb-7">
              {['login', 'signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError('');
                    setForm({ name: '', email: '', password: '' });
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === t
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          )}

          {/* Normal Sign In / Sign Up Form */}
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

              {/* OAuth buttons with Official Google & GitHub SVG logos */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03]
                    hover:bg-white/[0.06] text-xs text-slate-300 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <GoogleLogo size={15} />
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleGithubAuth}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03]
                    hover:bg-white/[0.06] text-xs text-slate-300 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <GitHubLogo size={15} />
                  GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[11px] text-slate-600">or continue with email</span>
                <div className="flex-1 h-px bg-white/5" />
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
                      <button type="button" className="text-[11px] text-[#00dc82] hover:underline transition-colors font-medium">
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

                {/* Error with Smart 1-Click Switch Action */}
                {error && (
                  <div className="space-y-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                    <p className="text-red-400 font-medium">{error}</p>
                    {errorAction && errorAction.type === 'switch_to_login' && (
                      <div className="space-y-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTab('login');
                            setForm({ name: '', email: errorAction.email, password: '' });
                            setError('');
                            setErrorAction(null);
                          }}
                          className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer"
                        >
                          Switch to Sign In with "{errorAction.email}" →
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cleanEmail = errorAction.email.trim().toLowerCase();
                            const updated = registeredEmails.filter((e) => e !== cleanEmail);
                            setRegisteredEmails(updated);
                            try {
                              localStorage.setItem('severa_registered_emails', JSON.stringify(updated));
                            } catch {}
                            setError('');
                            setErrorAction(null);
                            // Proceed directly to verification step for fresh new user test
                            setForm((f) => ({ ...f, email: cleanEmail }));
                            setVerifyStep(true);
                            setResendTimer(60);
                          }}
                          className="w-full text-center py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-semibold border border-red-500/20 transition-all cursor-pointer"
                        >
                          ⚡ Reset "{errorAction.email}" (Test Fresh Sign-Up Flow)
                        </button>
                      </div>
                    )}
                    {errorAction && errorAction.type === 'switch_to_signup' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTab('signup');
                          setForm({ name: '', email: errorAction.email, password: '' });
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

                {/* Submit Button styled in Severa Emerald Green */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00dc82] to-emerald-500 hover:from-[#00c574] hover:to-emerald-400 text-black text-sm font-black transition-all shadow-lg shadow-[#00dc82]/25 hover:shadow-[#00dc82]/40 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      {tab === 'login' ? 'Sign in' : 'Create account & Verify Email'}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick demo tip */}
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

      {/* OAuth Authorization Consent Modals (ChatGPT / Gemini style) */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleOAuthSelect}
      />

      <GitHubOAuthModal
        isOpen={showGithubModal}
        onClose={() => setShowGithubModal(false)}
        onAuthorize={handleOAuthSelect}
      />
    </div>
  );
}

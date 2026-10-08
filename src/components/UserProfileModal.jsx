import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Cpu, 
  Copy, 
  Check, 
  LogOut, 
  X, 
  Sparkles, 
  Lock, 
  Zap, 
  ShieldAlert,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { authService } from '../services/authService';

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenModelsModal,
  selectedProvider = 'Gemini',
  selectedModel = 'gemini-2.5-flash',
  apiKey = '',
  customEndpoint = '',
  scanMetrics = {}
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: null });

  if (!isOpen || !user) return null;

  const hasKey = Boolean(apiKey || (selectedProvider === 'ollama' && customEndpoint));

  const email = user.email || 'user@example.com';
  const name = user.name || email.split('@')[0] || 'User';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleRequestPasswordReset = async () => {
    setResetStatus({ loading: true, success: false, error: null });
    try {
      await authService.requestPasswordReset(email);
      setResetStatus({ loading: false, success: true, error: null });
    } catch (err) {
      setResetStatus({ 
        loading: false, 
        success: false, 
        error: err.message || 'Failed to dispatch security code to your email.' 
      });
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      {/* Modal Container Centered on Screen */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0c101d] border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto"
      >
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Account & Security Profile
              </h3>
              <p className="text-xs text-slate-400">Severa AI Security Enterprise Workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main User Info Card */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex items-start gap-4">
          {/* Avatar with Status Badge */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-cyan-500/20">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Active Session">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white truncate">{name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate font-mono">{email}</span>
              <button
                onClick={handleCopyEmail}
                className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                title="Copy Email ID"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero-Trust Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Security & Workspace Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Security & Privacy */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Data Protection</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              100% Client-Side Local Isolation. No sensitive tokens or code sent to 3rd party logs.
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              🔒 Encrypted & Isolated
            </span>
          </div>

          {/* Card 2: AI Model Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Cpu className={`w-4 h-4 ${hasKey ? 'text-emerald-400' : 'text-cyan-400'}`} />
                <span>AI Engine</span>
              </div>
              {hasKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Live API Connected" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-cyan-400" title="Built-in Local Engine" />
              )}
            </div>
            <p className={`text-xs font-bold truncate uppercase tracking-tight ${hasKey ? 'text-emerald-300' : 'text-cyan-300'}`}>
              {hasKey ? `${selectedProvider} / ${selectedModel}` : 'Severa Local Security Engine'}
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenModelsModal) onOpenModelsModal();
              }}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <span>{hasKey ? 'Manage Models' : 'Connect Live API Key'}</span> &rarr;
            </button>
          </div>
        </div>

        {/* Security Quick Action: Reset Password */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Password & Security</span>
            </div>
            <span className="text-[10px] text-slate-400">Send 6-Digit Code</span>
          </div>

          <p className="text-xs text-slate-400">
            Need to change or update your account password? Request a 6-digit security OTP sent to <span className="text-slate-200 font-mono font-medium">{email}</span>.
          </p>

          {resetStatus.success ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Security code dispatched! Check your email inbox.</span>
              </div>
              <button
                onClick={() => setResetStatus({ loading: false, success: false, error: null })}
                className="text-[10px] underline hover:text-white"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleRequestPasswordReset}
                disabled={resetStatus.loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                {resetStatus.loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Sending 6-Digit Security Code...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send Password Reset OTP to Email</span>
                  </>
                )}
              </button>

              {resetStatus.error && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{resetStatus.error}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Severa Defender v2.4</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

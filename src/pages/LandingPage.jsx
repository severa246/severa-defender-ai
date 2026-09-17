import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  Shield, Zap, Eye, GitBranch, Lock, Server, CheckCircle,
  ArrowRight, ChevronRight, Code2, Cpu, Globe, Layers, BarChart3,
  ShieldCheck, AlertTriangle, FileCode, Sparkles, Menu, X,
  Terminal, Copy, Check, Package, GitPullRequest, FileText,
  Users, Star, Tag
} from 'lucide-react';

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Home', action: () => scrollToSection('home') },
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'Quick Start', action: () => scrollToSection('quickstart') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-[#0d0f18]/95 backdrop-blur-xl border-b border-white/5' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Shield size={14} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">SEVERA AI</span>
            <span className="block text-[8px] font-semibold text-slate-500 uppercase tracking-widest -mt-0.5">Open-Source Security</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Launch Platform
            <ArrowRight size={12} />
          </button>
        </div>

        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0d0f18]/95 backdrop-blur-xl px-5 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="block w-full text-left text-sm text-slate-400 hover:text-white py-1.5"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-2 py-2.5 rounded-lg bg-emerald-500 text-black text-sm font-black"
          >
            Launch Platform
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Animated terminal ──────────────────────────────────────────────────────────
const TERMINAL_STEPS = [
  {
    tab: 'Step 1: SAST Scan',
    text: '$ severa scan run --repo github.com/acme/core-api --profile owasp-top10',
    title: 'Code Ingestion & Vulnerability Detection',
    info: '[INFO] Cloned 142 repository files (38,420 lines) · SAST Engine v2.4',
    items: [
      { label: 'Repository Cloned & AST Tree Indexed', value: 'Done', done: true },
      { label: 'AST Security Rules Loaded (248 Rules)', value: 'Done', done: true },
      { label: 'Flaw Flagged: SQL Injection (CWE-89) in auth.py:L42', value: 'Critical', done: true, badge: 'text-red-400' },
      { label: 'Flaw Flagged: Hardcoded JWT Secret (CWE-798) in config.py:L12', value: 'High', done: true, badge: 'text-amber-400' },
      { label: 'Flaw Flagged: Reflected DOM XSS (CWE-79) in views.py:L88', value: 'Medium', done: true, badge: 'text-yellow-400' },
      { label: 'SAST Scan Complete — 3 Security Vulnerabilities Found', value: 'Finished', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    tab: 'Step 2: AI Remediation',
    text: '$ severa ai remediate --finding SEC-2024-89 --engine gemini-1.5-flash',
    title: 'AI Auto-Patching & Code Refactoring',
    info: '[INFO] Connected to Severa AI Engine (Gemini 1.5 Flash)',
    items: [
      { label: 'Targeting AST Sink Node: auth.py:L42', value: 'Done', done: true },
      { label: 'Generating Parametrized Prepared Statement', value: 'Done', done: true },
      { label: 'Verifying Fix Against Regression Test Suite', value: 'Passed', done: true, badge: 'text-emerald-400' },
      { label: 'Security Grade Upgraded: Grade C → Grade A+', value: 'Upgraded', done: true, badge: 'text-cyan-400' },
      { label: 'Diff Prepared (+3 lines, -1 line)', value: 'Applied', done: true, badge: 'text-emerald-400' },
      { label: 'Automated Patch Refactor Verified', value: 'Ready', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    tab: 'Step 3: Severa Defender',
    text: '$ severa defender explain --file auth.py --flaw SEC-2024-89',
    title: 'AI Security Assistant & Prevention Strategy',
    info: '[INFO] Severa Defender AI Agent inspecting vulnerability context',
    items: [
      { label: 'Analyzing Root Cause: Raw string concatenation in SQL query', value: 'Analyzed', done: true },
      { label: 'Mapping Attack Vector: SQL Injection bypassing authentication', value: 'Mapped', done: true },
      { label: 'Generating Future Prevention Guidelines & Linter Rules', value: 'Generated', done: true, badge: 'text-emerald-400' },
      { label: 'Creating Developer Security Checklist & CI/CD Pre-commit Hook', value: 'Saved', done: true, badge: 'text-cyan-400' },
      { label: 'Interactive Q&A Session Active', value: 'Active', done: true, badge: 'text-emerald-400' },
      { label: 'Defense Blueprint Ready', value: 'Complete', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    tab: 'Step 4: Audit & PR',
    text: '$ severa report generate --format pdf --pr-create',
    title: 'Executive PDF Audit & GitHub PR Automation',
    info: '[INFO] Generating Executive Security Audit & GitHub Pull Request',
    items: [
      { label: 'Generating Executive Compliance Summary', value: 'Done', done: true },
      { label: 'Exporting PDF Audit Report (severa-audit-2026.pdf)', value: 'Exported', done: true },
      { label: 'Creating GitHub PR #104 "fix(sec): remediate SQLi & JWT secrets"', value: 'Opened', done: true, badge: 'text-cyan-400' },
      { label: 'Attaching Severa Defender AI Patch Explanation', value: 'Attached', done: true },
      { label: 'CI/CD Pipeline Security Check Status: Passed', value: 'Passed', done: true, badge: 'text-emerald-400' },
      { label: 'All Security Gates Cleared — Production Ready', value: 'Ready to Merge', done: true, badge: 'text-emerald-400' },
    ]
  }
];

function DemoTerminal() {
  const [activeStep, setActiveStep] = useState(0);
  const [revealedOutput, setRevealedOutput] = useState(1);

  const step = TERMINAL_STEPS[activeStep];

  useEffect(() => {
    setRevealedOutput(1);
  }, [activeStep]);

  useEffect(() => {
    if (revealedOutput >= step.items.length) return;
    const t = setTimeout(() => setRevealedOutput(r => r + 1), 600);
    return () => clearTimeout(t);
  }, [revealedOutput, activeStep, step.items.length]);

  return (
    <div className="bg-[#080b12] border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-xs text-slate-400 font-mono flex-1">severa-cli — zsh</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5">● LIVE DEMO</span>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TERMINAL_STEPS.map((s, i) => (
          <button
            key={s.tab}
            onClick={() => setActiveStep(i)}
            className={`px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              i === activeStep
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>

      {/* Command line */}
      <div className="px-4 py-3 border-b border-white/5 bg-black/30">
        <p className="font-mono text-xs text-emerald-300">{step.text}</p>
      </div>

      {/* Terminal Body */}
      <div className="p-4 space-y-2.5 min-h-[220px]">
        {/* Header line */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Shield size={10} className="text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400">{step.title}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono animate-pulse">● LIVE</span>
        </div>

        <p className="text-[11px] text-slate-500 font-mono mb-3">
          {step.info}
        </p>

        {/* Output lines */}
        {step.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between text-[11px] font-mono transition-all duration-300 ${
              i < revealedOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={i < revealedOutput - 1 ? 'text-emerald-400' : 'text-emerald-500/70'}>
                {i < revealedOutput - 1 ? '✓' : '⦿'}
              </span>
              <span className={i < revealedOutput - 1 ? 'text-slate-300' : 'text-slate-400 font-semibold'}>
                {item.label}
              </span>
            </div>
            <span className={`text-[10px] font-bold ${item.badge || (i < revealedOutput - 1 ? 'text-emerald-400' : 'text-slate-500')}`}>
              {i < revealedOutput - 1 ? item.value : 'Processing...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({ number, icon: Icon, title, desc, iconColor = 'text-emerald-400', iconBg = 'bg-emerald-500/10 border-emerald-500/20' }) {
  return (
    <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/8 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-black text-slate-700 tracking-widest">STEP {String(number).padStart(2,'0')}</span>
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Contributor avatar row ─────────────────────────────────────────────────────
const CONTRIB_COLORS = ['from-blue-500 to-violet-500','from-emerald-500 to-cyan-500','from-rose-500 to-pink-500','from-amber-500 to-orange-500','from-purple-500 to-indigo-500'];
function ContribAvatars({ count = 5 }) {
  return (
    <div className="flex items-center">
      {Array(count).fill(0).map((_, i) => (
        <div
          key={i}
          style={{ zIndex: count - i, marginLeft: i === 0 ? 0 : -8 }}
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${CONTRIB_COLORS[i % CONTRIB_COLORS.length]} border-2 border-[#0d0f18] flex items-center justify-center text-[9px] font-black text-white`}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { navigate } = useRouter();

  const DOCKER_CMD = 'docker run -d -p 3000:3000 severaai/severa:latest';

  return (
    <div className="min-h-screen bg-[#0d0f18] text-white font-sans overflow-x-hidden">
      <Navbar navigate={navigate} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20">
        {/* subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8 text-[11px]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open Source &amp; Self-Hostable Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-5">
              Build Secure<br />
              Software{' '}
              <span className="text-emerald-400">Faster</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md">
              Open-source AI security platform for intelligent code review,
              vulnerability detection, automated remediation, and developer workflows.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
              >
                <Eye size={14} className="text-slate-400" />
                View Demo
              </button>
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
              >
                <FileCode size={14} className="text-slate-400" />
                Read Docs
              </button>
            </div>

            {/* Docker quick-start */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-300 max-w-md">
              <Terminal size={12} className="text-emerald-400 shrink-0" />
              <span className="flex-1 truncate">$ {DOCKER_CMD}</span>
              <CopyButton text={DOCKER_CMD} />
            </div>
          </div>

          {/* Right — terminal */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl pointer-events-none" />
            <DemoTerminal />
          </div>
        </div>
      </section>

      {/* ── WORKFLOW PIPELINE ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px] font-semibold mb-4">
              <Layers size={11} />
              Developer Workflow Pipeline
            </span>
            <h2 className="text-3xl font-black text-white mb-4">End-to-End Automated Code Defense</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Severa replaces fragmented security scanners with a unified open-source workflow
              pipeline built specifically for modern developer teams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StepCard number={1} icon={Code2} iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20"
              title="Repository Analysis"
              desc="Deep AST parsing across 30+ languages. Automatically indexes dependencies, branches, and code call graphs." />
            <StepCard number={2} icon={Lock} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20"
              title="Secret Detection"
              desc="Real-time detection for hardcoded API keys, JWT secrets, AWS tokens, SSH keys, and private certificates." />
            <StepCard number={3} icon={Package} iconColor="text-violet-400" iconBg="bg-violet-500/10 border-violet-500/20"
              title="Dependency Analysis"
              desc="SCA scanning against OSV, NVD, and GitHub Advisory Database to catch vulnerable npm, PyPI, and Go packages." />
            <StepCard number={4} icon={Sparkles} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20"
              title="AI Review Engine"
              desc="LLM-powered security reviews using Google Gemini 1.5 Pro, Anthropic Claude 3.7, or local Ollama / LM Studio." />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <StepCard number={5} icon={Zap} iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20"
              title="Automated Fixes"
              desc="Context-aware security patch synthesis. Generates clean, tested code diffs that preserve style and type safety." />
            <StepCard number={6} icon={GitPullRequest} iconColor="text-rose-400" iconBg="bg-rose-500/10 border-rose-500/20"
              title="Pull Request Synthesis"
              desc="One-click GitHub & GitLab PR creation with complete vulnerability context, remediation rationale, and test cases." />
            <StepCard number={7} icon={FileText} iconColor="text-orange-400" iconBg="bg-orange-500/10 border-orange-500/20"
              title="Export Security Report"
              desc="Generate interactive executive summaries, OWASP Top 10 matrices, MITRE ATT&CK maps, and SBOM compliance exports." />
          </div>
        </div>
      </section>



      {/* ── CTA / QUICK START ─────────────────────────────────────────────── */}
      <section id="quickstart" className="py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free &amp; Open Source Security Platform
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Start securing your codebase today</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Deploy in minutes. No vendor lock-in. No usage limits.
            Your code stays on your infrastructure.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-7 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 px-7 py-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Eye size={13} />
              Live Demo
            </button>
          </div>

          {/* Quick-start block */}
          <div className="mt-10 text-left bg-black/40 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[11px] text-slate-600 font-mono">Quick Start CLI</span>
            </div>
            <div className="p-5 space-y-2 font-mono text-xs">
              {[
                { prompt: '$', cmd: 'git clone https://github.com/severaai/severa-core', color: 'text-slate-300' },
                { prompt: '$', cmd: 'cd severa-core && docker compose up -d', color: 'text-slate-300' },
                { prompt: '$', cmd: 'open http://localhost:3000', color: 'text-emerald-300' },
              ].map(({ prompt, cmd, color }) => (
                <div key={cmd} className="flex items-center gap-2 group">
                  <span className="text-emerald-400 shrink-0">{prompt}</span>
                  <span className={color}>{cmd}</span>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Shield size={12} className="text-emerald-400" />
            </div>
            <span className="text-xs font-black text-white">SEVERA AI</span>
            <span className="text-[9px] text-slate-600 uppercase tracking-widest">Open-Source Platform</span>
          </div>
          <p className="text-xs text-slate-600">Apache 2.0 License · © 2026 Severa AI</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById('quickstart')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Quick Start
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hover:text-emerald-400 font-semibold transition-colors cursor-pointer text-slate-400"
            >
              Launch Platform →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

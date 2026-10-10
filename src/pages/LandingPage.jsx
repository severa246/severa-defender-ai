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
      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <div
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">SEVERA AI</span>
            <span className="block text-xs sm:text-[13px] font-bold text-emerald-400/90 uppercase tracking-wider">Enterprise Security</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-9 sm:gap-11 text-base lg:text-[17px] font-semibold text-slate-200">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="hover:text-emerald-400 transition-colors cursor-pointer font-semibold"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-sm sm:text-base font-bold text-slate-100 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm sm:text-base font-black transition-all shadow-lg shadow-emerald-500/25 cursor-pointer hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            Launch Platform
            <ArrowRight size={16} />
          </button>
        </div>

        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0d0f18]/95 backdrop-blur-xl px-6 py-5 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setMobileOpen(false); }}
              className="block w-full text-left text-base text-slate-300 hover:text-white py-2 font-medium"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-xl border border-white/10 text-white text-base font-semibold"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-emerald-500 text-black text-base font-black flex items-center justify-center gap-2"
            >
              Launch Platform
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Animated terminal ──────────────────────────────────────────────────────────
const TERMINAL_STEPS = [
  {
    stepNum: 'Step 1',
    title: 'SAST Scan',
    mobileTitle: 'SAST',
    tab: 'Step 1: SAST Scan',
    text: '$ severa scan run --repo github.com/acme/core-api --profile owasp-top10',
    headerTitle: 'Code Ingestion & Vulnerability Detection',
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
    stepNum: 'Step 2',
    title: 'AI Remediation',
    mobileTitle: 'AI Fix',
    tab: 'Step 2: AI Remediation',
    text: '$ severa ai remediate --finding SEC-2024-89 --engine gemini-1.5-flash',
    headerTitle: 'AI Auto-Patching & Code Refactoring',
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
    stepNum: 'Step 3',
    title: 'Severa Defender',
    mobileTitle: 'Defender',
    tab: 'Step 3: Severa Defender',
    text: '$ severa defender explain --file auth.py --flaw SEC-2024-89',
    headerTitle: 'AI Security Assistant & Prevention Strategy',
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
    stepNum: 'Step 4',
    title: 'Audit & PR',
    mobileTitle: 'Audit & PR',
    tab: 'Step 4: Audit & PR',
    text: '$ severa report generate --format pdf --pr-create',
    headerTitle: 'Executive PDF Audit & GitHub PR Automation',
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
    if (revealedOutput < step.items.length) {
      const t = setTimeout(() => setRevealedOutput((r) => r + 1), 450);
      return () => clearTimeout(t);
    } else {
      // Once all terminal lines for the current step are revealed, wait 1.8s then auto-advance to next step
      const loopTimer = setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % TERMINAL_STEPS.length);
      }, 1800);
      return () => clearTimeout(loopTimer);
    }
  }, [revealedOutput, activeStep, step.items.length]);

  return (
    <div className="bg-[#080b12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 w-full">
      {/* Chrome bar */}
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/10 bg-white/[0.03]">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-slate-300 font-mono flex-1 truncate">severa-cli — zsh</span>
        <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shrink-0">● LIVE DEMO</span>
      </div>

      {/* Step tabs — 4 equal columns across the entire width, NO scrollbar */}
      <div className="grid grid-cols-4 w-full border-b border-white/10 bg-black/40">
        {TERMINAL_STEPS.map((s, i) => {
          const isActive = i === activeStep;
          return (
            <button
              key={s.stepNum}
              type="button"
              onClick={() => setActiveStep(i)}
              className={`py-2 sm:py-2.5 px-1 sm:px-2 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1.5 text-center transition-all border-b-2 cursor-pointer select-none ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] font-medium'
              }`}
            >
              <span className={`text-[10px] sm:text-xs tracking-tight shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {s.stepNum}
                <span className="hidden md:inline">:</span>
              </span>
              <span className="text-[11px] sm:text-xs truncate max-w-full">
                <span className="hidden sm:inline">{s.title}</span>
                <span className="inline sm:hidden">{s.mobileTitle || s.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Command line */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-white/10 bg-black/50 overflow-hidden">
        <p className="font-mono text-xs sm:text-sm md:text-base text-emerald-300 truncate">{step.text}</p>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3 min-h-[240px]">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Shield size={13} className="text-emerald-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 truncate">{step.headerTitle || step.title}</span>
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-400 font-mono font-bold animate-pulse shrink-0">● LIVE</span>
        </div>

        <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 font-mono mb-2.5 truncate">
          {step.info}
        </p>

        {/* Output lines */}
        {step.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-2 text-[11px] sm:text-xs md:text-sm font-mono transition-all duration-300 ${
              i < revealedOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`shrink-0 ${i < revealedOutput - 1 ? 'text-emerald-400 font-bold' : 'text-emerald-500/80 font-bold'}`}>
                {i < revealedOutput - 1 ? '✓' : '⦿'}
              </span>
              <span className={`truncate ${i < revealedOutput - 1 ? 'text-slate-200' : 'text-slate-300 font-medium'}`}>
                {item.label}
              </span>
            </div>
            <span className={`shrink-0 text-[10px] sm:text-xs md:text-sm font-bold ${item.badge || (i < revealedOutput - 1 ? 'text-emerald-400' : 'text-slate-400')}`}>
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
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon size={22} />
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md tracking-wider">
          STEP {String(number).padStart(2,'0')}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed font-normal">{desc}</p>
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
    <div className="min-h-screen bg-[#0d0f18] text-white font-sans overflow-x-hidden relative">
      {/* Seamless fixed background grid design throughout the home page */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <Navbar navigate={navigate} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-28 pb-20">

        <div className="relative w-full px-6 sm:px-10 lg:px-14 xl:px-20 grid lg:grid-cols-12 gap-10 xl:gap-16 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-[13px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open Source &amp; Self-Hostable Security Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-5">
              Build Secure<br />
              Software{' '}
              <span className="text-emerald-400">Faster</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-[17px] text-slate-300 leading-relaxed mb-6 max-w-xl font-normal">
              Open-source AI security platform for intelligent code review,
              vulnerability detection, automated remediation, and developer workflows.
            </p>

            <div className="flex flex-wrap gap-3.5 mb-7">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5.5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm sm:text-base font-black transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-4.5 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye size={16} className="text-slate-300" />
                View Demo
              </button>
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-4.5 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <FileCode size={16} className="text-slate-300" />
                Read Docs
              </button>
            </div>

            {/* Docker quick-start */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm text-slate-200 max-w-lg">
              <Terminal size={14} className="text-emerald-400 shrink-0" />
              <span className="flex-1 truncate">$ {DOCKER_CMD}</span>
              <CopyButton text={DOCKER_CMD} />
            </div>
          </div>

          {/* Right — terminal */}
          <div className="relative lg:col-span-5">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/15 to-transparent blur-xl pointer-events-none" />
            <DemoTerminal />
          </div>
        </div>
      </section>

      {/* ── WORKFLOW PIPELINE ─────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-20 border-t border-white/10">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold mb-4">
              <Layers size={14} />
              Developer Workflow Pipeline
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">End-to-End Automated Code Defense</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Severa replaces fragmented security scanners with a unified open-source workflow
              pipeline built specifically for modern developer teams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
          <div className="grid sm:grid-cols-3 gap-6">
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
      <section id="quickstart" className="relative z-10 py-24 border-t border-white/10">
        <div className="w-full max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free &amp; Open Source Security Platform
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Start securing your codebase today</h2>
          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            Deploy in minutes. No vendor lock-in. No usage limits.
            Your code stays on your infrastructure.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-base font-black transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Eye size={15} />
              Live Demo
            </button>
          </div>

          {/* Quick-start block */}
          <div className="mt-12 text-left bg-black/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-xs text-slate-300 font-mono font-semibold">Quick Start CLI</span>
            </div>
            <div className="p-6 space-y-3 font-mono text-sm sm:text-base">
              {[
                { prompt: '$', cmd: 'git clone https://github.com/severaai/severa-core', color: 'text-slate-200' },
                { prompt: '$', cmd: 'cd severa-core && docker compose up -d', color: 'text-slate-200' },
                { prompt: '$', cmd: 'open http://localhost:3000', color: 'text-emerald-300 font-bold' },
              ].map(({ prompt, cmd, color }) => (
                <div key={cmd} className="flex items-center gap-3 group">
                  <span className="text-emerald-400 font-bold shrink-0">{prompt}</span>
                  <span className={color}>{cmd}</span>
                  <CopyButton text={cmd} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Shield size={16} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-black text-white">SEVERA AI</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Open-Source Platform</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">© 2026 Severa AI</p>
          <div className="flex gap-6 text-sm text-slate-300">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById('quickstart')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Quick Start
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hover:text-emerald-400 font-bold transition-colors cursor-pointer text-emerald-400"
            >
              Launch Platform →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

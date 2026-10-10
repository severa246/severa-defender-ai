import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  Shield, Zap, Eye, GitBranch, Lock, Server, CheckCircle,
  ArrowRight, ChevronRight, ChevronLeft, Code2, Cpu, Globe, Layers, BarChart3,
  ShieldCheck, AlertTriangle, FileCode, Sparkles, Menu, X,
  Terminal, Copy, Check, Package, GitPullRequest, FileText,
  Users, Star, Tag, CheckCircle2
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <div
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight">SEVERA AI</span>
            <span className="block text-xs font-bold text-emerald-400/90 uppercase tracking-wider">Enterprise Security</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3.5">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Launch Platform
            <ArrowRight size={14} />
          </button>
        </div>

        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
    <div className="bg-[#080b12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
      {/* Chrome bar */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-sm text-slate-300 font-mono flex-1">severa-cli — zsh</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">● LIVE DEMO</span>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto bg-black/40">
        {TERMINAL_STEPS.map((s, i) => (
          <button
            key={s.tab}
            onClick={() => setActiveStep(i)}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              i === activeStep
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>

      {/* Command line */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-black/50">
        <p className="font-mono text-sm sm:text-base text-emerald-300">{step.text}</p>
      </div>

      {/* Terminal Body */}
      <div className="p-5 space-y-3 min-h-[240px]">
        {/* Header line */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield size={14} className="text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-emerald-400">{step.title}</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse">● LIVE</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-mono mb-3">
          {step.info}
        </p>

        {/* Output lines */}
        {step.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between text-xs sm:text-sm font-mono transition-all duration-300 ${
              i < revealedOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={i < revealedOutput - 1 ? 'text-emerald-400 font-bold' : 'text-emerald-500/80 font-bold'}>
                {i < revealedOutput - 1 ? '✓' : '⦿'}
              </span>
              <span className={i < revealedOutput - 1 ? 'text-slate-200' : 'text-slate-300 font-medium'}>
                {item.label}
              </span>
            </div>
            <span className={`text-xs sm:text-sm font-bold ${item.badge || (i < revealedOutput - 1 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {i < revealedOutput - 1 ? item.value : 'Processing...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Workflow Steps Definition ──────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Repository Analysis',
    short: 'Repo AST Scan',
    tag: 'AST Parsing Engine',
    icon: Code2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    headline: 'Multi-Language AST Call Graph & Syntax Indexing',
    desc: 'Analyzes project architecture across 30+ programming languages. Maps dangerous data flows from HTTP entry points directly into SQL queries, system commands, and deserialization sinks.',
    points: [
      'Cross-file taint analysis & data flow tracking',
      'Instant AST indexing across 30+ languages',
      'Deterministic call-graph tracing with zero false positives'
    ],
    previewType: 'ast',
  },
  {
    step: 2,
    title: 'Secret Detection',
    short: 'Secret Scan',
    tag: 'Entropy & Pattern Match',
    icon: Lock,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    headline: 'Real-Time Hardcoded Token & Credential Interception',
    desc: 'Catches private keys, AWS access secrets, JWT signing tokens, database passwords, and API keys before they ever reach remote Git repositories.',
    points: [
      'High-entropy regex and cloud provider credential masks',
      'Live validation against token providers',
      'Pre-commit hook & CI pipeline gatekeeper'
    ],
    previewType: 'secret',
  },
  {
    step: 3,
    title: 'Dependency Analysis',
    short: 'SCA Audit',
    tag: 'CVE & OSV Database',
    icon: Package,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    headline: 'Automated Supply Chain & Vulnerable Package Shield',
    desc: 'Scans package manifests against OSV, GitHub Advisory Database, and National Vulnerability Database (NVD) to identify vulnerable transitive dependencies.',
    points: [
      'Continuous OSV and CVE vulnerability scanning',
      'Direct vs transitive dependency graph parsing',
      'One-click safe version patch recommendations'
    ],
    previewType: 'sca',
  },
  {
    step: 4,
    title: 'AI Review Engine',
    short: 'AI Review',
    tag: 'Multi-LLM Engine',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    headline: 'Context-Aware Security Analysis via Leading LLMs',
    desc: 'Pairs static rule verification with deep LLM reasoning from Google Gemini 1.5 Pro, Claude 3.7 Sonnet, or local Ollama instances to eliminate false positives.',
    points: [
      'OWASP Top 10 & CWE threat classification',
      'Full function context with sanitization verification',
      'Choice of Cloud LLMs or 100% offline local models'
    ],
    previewType: 'ai',
  },
  {
    step: 5,
    title: 'Automated Fixes',
    short: 'Auto Patch',
    tag: 'Diff Synthesis',
    icon: Zap,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    headline: 'Instant Context-Preserving Security Remediation Diffs',
    desc: 'Synthesizes clean, production-ready code diffs that preserve indentation, variable naming, and type safety, replacing insecure calls with verified secure alternatives.',
    points: [
      'Parameterized query & sanitization replacement',
      'Syntax-valid drop-in replacement diffs',
      'Unit test verification to prevent functional regressions'
    ],
    previewType: 'fix',
  },
  {
    step: 6,
    title: 'Pull Request Synthesis',
    short: 'PR Creation',
    tag: 'Git Automation',
    icon: GitPullRequest,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    headline: 'One-Click GitHub & GitLab Pull Request Synthesis',
    desc: 'Packages remediation patches directly into signed Git commits and opens automated Pull Requests equipped with security explanations and test reproduction steps.',
    points: [
      'Automated branch creation & signed commits',
      'Detailed PR description with vulnerability context',
      'Ready for developer review and instant merge'
    ],
    previewType: 'pr',
  },
  {
    step: 7,
    title: 'Export Security Report',
    short: 'Audit Report',
    tag: 'Executive Compliance',
    icon: FileText,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    headline: 'Executive Summaries, OWASP Matrices & Compliance Exports',
    desc: 'Generates comprehensive compliance audit reports in PDF, SARIF, JSON, and CSV formats, complete with OWASP Top 10 matrices and MITRE ATT&CK mappings.',
    points: [
      'Interactive executive scorecards & charts',
      'Industry-standard SARIF format for CI/CD',
      'OWASP Top 10 & SOC 2 audit readiness'
    ],
    previewType: 'report',
  },
];

// ── Step Visual Preview Mockups ───────────────────────────────────────────────
function StepVisualPreview({ step }) {
  if (step.previewType === 'ast') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
            <span className="text-slate-300 font-semibold">AST Analysis Engine · Taint Call Graph</span>
          </div>
          <span className="text-[11px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            30+ Languages
          </span>
        </div>
        <div className="p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
            <span>Target: <strong className="text-slate-200">src/api/auth.py</strong></span>
            <span className="text-emerald-400 font-semibold">AST Parsed: 1,420 nodes</span>
          </div>
          <div className="space-y-1.5 pl-2 border-l-2 border-blue-500/40">
            <div className="text-slate-400 flex items-center gap-2">
              <span className="text-blue-400 font-bold">ENTRY</span>
              <span className="text-slate-200">def login_route(request):</span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 pl-4">
              <span className="text-amber-400 font-bold">SOURCE</span>
              <span>raw_email = request.args.get('email')</span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 pl-4">
              <span className="text-rose-400 font-bold">TAINT</span>
              <span className="text-rose-300 bg-rose-500/10 px-1 rounded">f"SELECT * FROM users WHERE email='&#123;raw_email&#125;'"</span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 pl-4">
              <span className="text-rose-400 font-bold">SINK</span>
              <span className="text-rose-400 font-bold">cursor.execute(sql)</span>
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle size={15} className="text-rose-400 shrink-0" />
              <span className="font-bold">CWE-89: SQL Injection Taint Path Traced</span>
            </div>
            <span className="text-[10px] text-rose-400 font-bold">CONFIDENCE: 99.8%</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.previewType === 'secret') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="text-slate-300 font-semibold">Real-Time Secret Interceptor</span>
          </div>
          <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            Pre-Commit Guard
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-slate-400 text-xs flex items-center justify-between border-b border-white/5 pb-2">
            <span>File: <strong className="text-slate-200">config/production_secrets.env</strong></span>
            <span className="text-amber-400 font-bold">Line 14</span>
          </div>
          <div className="p-3 rounded-lg bg-black/60 border border-amber-500/20 font-mono text-xs space-y-1">
            <div className="text-slate-500"># Cloud Provider Production Credentials</div>
            <div className="text-slate-300">AWS_DEFAULT_REGION="us-east-1"</div>
            <div className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded">
              AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            </div>
            <div className="text-slate-300">JWT_SIGNING_SECRET="shh-top-secret-signing-key-99"</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <Lock size={15} className="text-amber-400 shrink-0" />
              <span className="font-bold">CWE-798: Hardcoded AWS Secret Intercepted</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              AUTO-QUARANTINED
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step.previewType === 'sca') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500/80" />
            <span className="text-slate-300 font-semibold">Software Supply Chain (SCA) Match</span>
          </div>
          <span className="text-[11px] text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
            OSV &amp; NVD Indexed
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
            <span>Manifest: <strong className="text-slate-200">package.json</strong></span>
            <span className="text-violet-300">38 Packages Scanned</span>
          </div>
          <div className="p-3 rounded-lg bg-black/60 border border-violet-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">axios @ 0.21.1</span>
              <span className="text-rose-400 font-bold text-[11px] bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                CVSS 7.5 HIGH
              </span>
            </div>
            <p className="text-slate-300 text-xs font-sans">
              CVE-2021-3749: Server-Side Request Forgery (SSRF) via insecure follow-redirect handling.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs border-t border-white/5">
              <span className="text-slate-400">Fixed in: <strong className="text-emerald-400">axios &gt;= 0.21.4</strong></span>
              <span className="text-emerald-400 font-bold">0 Breaking Changes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step.previewType === 'ai') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-slate-300 font-semibold">Gemini 1.5 Pro Security Reasoner</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            99.4% Precision
          </span>
        </div>
        <div className="p-4 space-y-3 font-sans">
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <h5 className="font-bold text-white text-sm">Security Impact &amp; Rationale</h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              "The HTTP query parameter 'email' flows directly into SQL statement construction without escaping. An attacker can inject ' OR 1=1 -- to bypass authentication."
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase">CWE ID</div>
              <div className="text-white font-bold">CWE-89</div>
            </div>
            <div className="p-2 rounded bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase">OWASP</div>
              <div className="text-amber-400 font-bold">A03:2021</div>
            </div>
            <div className="p-2 rounded bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase">Remediation</div>
              <div className="text-emerald-400 font-bold">Synthesized</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step.previewType === 'fix') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80" />
            <span className="text-slate-300 font-semibold">Synthesized Patch Diff · auth.py</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
            Type-Safe Patch
          </span>
        </div>
        <div className="p-4 space-y-2 font-mono text-xs">
          <div className="text-slate-500">@@ -18,4 +18,4 @@ def authenticate_user(email):</div>
          <div className="p-2 rounded bg-rose-500/10 text-rose-300 border-l-2 border-rose-500 line-through">
            - cursor.execute("SELECT * FROM users WHERE email = '" + email + "'")
          </div>
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500 font-bold">
            + cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs mt-3">
            <span className="text-cyan-300 font-semibold">✓ Style preserved · PEP-8 checked</span>
            <span className="text-emerald-400 font-bold">READY TO APPLY</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.previewType === 'pr') {
    return (
      <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="text-slate-300 font-semibold">GitHub Pull Request Automation</span>
          </div>
          <span className="text-[11px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
            Open PR #42
          </span>
        </div>
        <div className="p-4 space-y-3 font-sans">
          <div className="flex items-start gap-2.5">
            <GitPullRequest size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-white text-sm">
                fix(security): resolve CWE-89 SQL injection via parameterized query
              </h5>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                severa:patch-cwe89-auth → main · by severa-ai[bot]
              </p>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs space-y-1">
            <div className="text-emerald-400 font-semibold">✓ Security CI Checks: 14/14 Passed</div>
            <div className="text-slate-400">✓ Unit tests: 88 passing (0 regressions)</div>
            <div className="text-slate-400">✓ Signed commit verified by GPG</div>
          </div>
        </div>
      </div>
    );
  }

  // default: report
  return (
    <div className="bg-[#050811] border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
      <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500/80" />
          <span className="text-slate-300 font-semibold">Severa Executive Security Scorecard</span>
        </div>
        <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
          SOC 2 &amp; SARIF
        </span>
      </div>
      <div className="p-4 space-y-3 font-sans">
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded bg-black/50 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase">Security Score</div>
            <div className="text-xl font-black text-emerald-400">98/100</div>
          </div>
          <div className="p-2.5 rounded bg-black/50 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase">OWASP Matrix</div>
            <div className="text-xl font-black text-cyan-400">100%</div>
          </div>
          <div className="p-2.5 rounded bg-black/50 border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase">Open High CWEs</div>
            <div className="text-xl font-black text-slate-200">0</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-between text-xs">
          <span className="text-orange-300 font-semibold">Export Formats: PDF · SARIF 2.1.0 · JSON · CSV</span>
          <span className="text-emerald-400 font-bold">READY TO EXPORT</span>
        </div>
      </div>
    </div>
  );
}

// ── Interactive Workflow Pipeline Section ─────────────────────────────────────
function WorkflowPipelineSection({ navigate }) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const scrollRef = useRef(null);

  const activeStep = WORKFLOW_STEPS[activeStepIdx];

  const handleSelectStep = (idx) => {
    setActiveStepIdx(idx);
    if (scrollRef.current) {
      const cards = scrollRef.current.children;
      if (cards && cards[idx]) {
        cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handlePrev = () => {
    const nextIdx = activeStepIdx === 0 ? WORKFLOW_STEPS.length - 1 : activeStepIdx - 1;
    handleSelectStep(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = activeStepIdx === WORKFLOW_STEPS.length - 1 ? 0 : activeStepIdx + 1;
    handleSelectStep(nextIdx);
  };

  return (
    <section id="features" className="relative z-10 py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold mb-4">
            <Layers size={14} />
            Developer Workflow Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            End-to-End Automated Code Defense
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Switch or scroll through the 7 automated security defense stages built specifically for modern developer teams.
          </p>
        </div>

        {/* Step Switcher Tabs (01 - 07) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {WORKFLOW_STEPS.map((s, idx) => {
              const isActive = idx === activeStepIdx;
              return (
                <button
                  key={s.step}
                  onClick={() => handleSelectStep(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300'
                  }`}>
                    {s.step}
                  </span>
                  <span>{s.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Active Step Showcase (2 Columns: Details + Interactive Mockup) */}
        <div className="relative bg-gradient-to-b from-[#0f1422] to-[#0a0d16] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Step Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 tracking-wider">
                  STAGE {String(activeStep.step).padStart(2, '0')} / 07
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  {activeStep.tag}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${activeStep.iconBg} ${activeStep.iconColor}`}>
                    <activeStep.icon size={20} />
                  </div>
                  {activeStep.title}
                </h3>
                <h4 className="text-sm sm:text-base font-semibold text-emerald-400/90 mb-3">
                  {activeStep.headline}
                </h4>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {activeStep.desc}
                </p>
              </div>

              {/* Key capabilities list */}
              <div className="space-y-2.5 pt-2">
                {activeStep.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Switcher Controls (Prev / Next & CTA) */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  title="Previous Stage"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                  title="Next Stage"
                >
                  Next Stage
                  <ChevronRight size={14} />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="ml-auto text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Launch Workspace <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Right: Interactive Security Preview Visual */}
            <div className="lg:col-span-7">
              <StepVisualPreview step={activeStep} />
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Card Track ("scrolling it from one to one") */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Scroll or click any stage to switch:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Scroll Previous"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-slate-400 font-bold px-1.5">{activeStepIdx + 1} / 7</span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Scroll Next"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory custom-scrollbar"
          >
            {WORKFLOW_STEPS.map((s, idx) => {
              const isSelected = idx === activeStepIdx;
              const CardIcon = s.icon;
              return (
                <div
                  key={s.step}
                  onClick={() => handleSelectStep(idx)}
                  className={`snap-center shrink-0 w-72 p-5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10 translate-y-[-2px]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${s.iconBg} ${s.iconColor}`}>
                      <CardIcon size={18} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-400'
                    }`}>
                      0{s.step}
                    </span>
                  </div>
                  <h4 className={`text-base font-bold mb-1.5 ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
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

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10 xl:gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-semibold">
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Open Source &amp; Self-Hostable Security Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Build Secure<br />
              Software{' '}
              <span className="text-emerald-400">Faster</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
              Open-source AI security platform for intelligent code review,
              vulnerability detection, automated remediation, and developer workflows.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-base font-black transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye size={16} className="text-slate-300" />
                View Demo
              </button>
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-base font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <FileCode size={16} className="text-slate-300" />
                Read Docs
              </button>
            </div>

            {/* Docker quick-start */}
            <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl px-5 py-3 font-mono text-sm text-slate-200 max-w-xl">
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

      {/* ── WORKFLOW PIPELINE (INTERACTIVE SWITCHER & SCROLLER) ─────────────── */}
      <WorkflowPipelineSection navigate={navigate} />

      {/* ── CTA / QUICK START ─────────────────────────────────────────────── */}
      <section id="quickstart" className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
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
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Shield size={16} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-black text-white">SEVERA AI</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Open-Source Platform</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">© 2026 Severa AI · Enterprise Application Security Platform</p>
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

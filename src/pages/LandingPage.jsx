import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  Shield, Zap, Eye, GitBranch, Lock, Server, CheckCircle,
  ArrowRight, ChevronRight, ChevronLeft, Code2, Cpu, Globe, Layers, BarChart3,
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

// ── 7-Stage End-to-End Workflow Stages Data (Matches Image 5 Design) ───────────────
const WORKFLOW_STAGES = [
  {
    id: 1,
    tab: '1 Repo AST Scan',
    stageNumber: 'STAGE 01 / 07',
    engineTag: 'AST PARSING ENGINE',
    icon: Code2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Repository Analysis',
    subtitle: 'Multi-Language AST Call Graph & Syntax Indexing',
    desc: 'Analyzes project architecture across 30+ programming languages. Maps dangerous data flows from HTTP entry points directly into SQL queries, system commands, and deserialization sinks.',
    bullets: [
      'Cross-file taint analysis & data flow tracking',
      'Instant AST indexing across 30+ languages',
      'Deterministic call-graph tracing with zero false positives'
    ],
    preview: {
      engine: 'AST Analysis Engine · Taint Call Graph',
      badge: '30+ Languages',
      target: 'src/api/auth.py',
      meta: 'AST Parsed: 1,420 nodes',
      code: [
        { type: 'entry', label: 'ENTRY', text: "def login_route(request):" },
        { type: 'source', label: 'SOURCE', text: "raw_email = request.args.get('email')" },
        { type: 'taint', label: 'TAINT', text: "f\"SELECT * FROM users WHERE email='{raw_email}'\"" },
        { type: 'sink', label: 'SINK', text: "cursor.execute(sql)" }
      ],
      alertIcon: '⚠️',
      alertText: 'CWE-89: SQL Injection Taint Path Traced',
      alertConfidence: 'CONFIDENCE: 99.8%',
      alertType: 'warning'
    }
  },
  {
    id: 2,
    tab: '2 Secret Scan',
    stageNumber: 'STAGE 02 / 07',
    engineTag: 'ENTROPY SCAN ENGINE',
    icon: Lock,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Secret & Token Detection',
    subtitle: 'High-Entropy Real-Time API Key & Token Auditing',
    desc: 'Detects exposed API keys, OAuth client secrets, AWS IAM tokens, private keys, and database passwords with zero false positives across full git history.',
    bullets: [
      'Real-time entropy and regex scanning across 200+ token providers',
      'Git commit history & staged pre-commit shield verification',
      'Automated secret revoking & rotation instructions'
    ],
    preview: {
      engine: 'Secret Scanner · High-Entropy Engine',
      badge: '200+ Providers',
      target: 'config/production.env',
      meta: 'Entropy: 4.86 bits/byte',
      code: [
        { type: 'comment', label: 'CHECK', text: "# Production Environment Credentials" },
        { type: 'taint', label: 'LEAK', text: "OPENAI_API_KEY = \"sk-proj-98dF843jK9200491xM...\"" },
        { type: 'source', label: 'AWS', text: "AWS_SECRET_KEY = \"wJalrXUtnFEMI/K7MDENG/bPxRfi...\"" },
        { type: 'sink', label: 'REVOKE', text: "STRIPE_SECRET_KEY = \"sk_live_51M8Xz92kL...\"" }
      ],
      alertIcon: '🚨',
      alertText: 'High Entropy Production API Key Exposed',
      alertConfidence: 'IMMEDIATE REVOCATION',
      alertType: 'danger'
    }
  },
  {
    id: 3,
    tab: '3 SCA Audit',
    stageNumber: 'STAGE 03 / 07',
    engineTag: 'DEPENDENCY AUDIT ENGINE',
    icon: Package,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    title: 'Dependency SCA Analysis',
    subtitle: 'Vulnerability Detection across OSV, NVD & GitHub Advisory',
    desc: 'Analyzes transitive package manifests to pinpoint vulnerable dependencies, CVE exposures, license violations, and poisoned package versions in your software supply chain.',
    bullets: [
      'Live CVE feeds from OSV, NVD & GitHub Security Advisories',
      'Transitive call-path reachability verification',
      'Automated safe version recommendation with zero breaking changes'
    ],
    preview: {
      engine: 'Supply Chain Analyzer · CVE Feed',
      badge: 'NVD / OSV Live',
      target: 'package.json',
      meta: 'Dependencies: 42 audited',
      code: [
        { type: 'comment', label: 'MANIFEST', text: "\"dependencies\": {" },
        { type: 'taint', label: 'VULN', text: "  \"jsonwebtoken\": \"^8.5.1\"   // CVE-2022-23529 (High)" },
        { type: 'source', label: 'VULN', text: "  \"axios\": \"^0.21.1\"          // CVE-2021-3749 (Medium)" },
        { type: 'sink', label: 'PATCH', text: "  \"lodash\": \"4.17.20\"          // CVE-2021-23337 (High)" }
      ],
      alertIcon: '🛡️',
      alertText: 'CVE-2022-23529: Upgrade jsonwebtoken to ^9.0.2',
      alertConfidence: 'CVSS 7.8 HIGH',
      alertType: 'warning'
    }
  },
  {
    id: 4,
    tab: '4 AI Review',
    stageNumber: 'STAGE 04 / 07',
    engineTag: 'LLM REASONING ENGINE',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'AI Security Review Engine',
    subtitle: 'Context-Aware Multi-LLM Reasoning & Triage',
    desc: 'Powered by Gemini 1.5 Pro, Claude 3.7, and local Ollama models. Analyzes full codebase business logic to catch subtle authentication bypasses, IDORs, and race conditions.',
    bullets: [
      'Deep context reasoning beyond simple static regex rules',
      'Zero hallucination verified against parsed syntax call-graphs',
      'Multi-model provider support: Gemini, Claude, Ollama & LM Studio'
    ],
    preview: {
      engine: 'Severa AI Core · Gemini 1.5 Pro',
      badge: '128k Context',
      target: 'controllers/payments.ts',
      meta: 'Severity: Critical',
      code: [
        { type: 'comment', label: 'LOGIC', text: "// Insecure authorization business check:" },
        { type: 'source', label: 'AUTH', text: "if (user.role === 'admin' || user.id === req.targetId) {" },
        { type: 'taint', label: 'FLAW', text: "  processRefund(req.targetId, req.amount); // Bypasses 2FA!" },
        { type: 'sink', label: 'RESULT', text: "}" }
      ],
      alertIcon: '🤖',
      alertText: 'AI Agent Verdict: Broken Object Level Authorization (IDOR)',
      alertConfidence: 'CONFIDENCE: 98.4%',
      alertType: 'danger'
    }
  },
  {
    id: 5,
    tab: '5 Auto Patch',
    stageNumber: 'STAGE 05 / 07',
    engineTag: 'PATCH SYNTHESIS ENGINE',
    icon: Zap,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Automated Code Remediation',
    subtitle: 'Context-Aware Verified Security Patch Synthesis',
    desc: 'Synthesizes surgical, production-ready code diffs that eliminate vulnerabilities while preserving code readability, existing variable conventions, and type safety.',
    bullets: [
      'Generates unified patch diffs tested for regression stability',
      'Preserves original coding style, import formatting, and types',
      'Automated one-click in-browser patch verification'
    ],
    preview: {
      engine: 'Patch Synthesizer · Unified Diff',
      badge: 'Auto-Generated',
      target: 'src/api/auth.py',
      meta: 'Lines: +3, -1',
      code: [
        { type: 'sink', label: 'DIFF -', text: "- cursor.execute(f\"SELECT * FROM users WHERE email='{raw_email}'\")" },
        { type: 'source', label: 'DIFF +', text: "+ query = \"SELECT * FROM users WHERE email = %s\"" },
        { type: 'source', label: 'DIFF +', text: "+ cursor.execute(query, (raw_email,))" },
        { type: 'comment', label: 'VERIFY', text: "# Parameterized SQL query prevents arbitrary string injection" }
      ],
      alertIcon: '✅',
      alertText: 'Patch Verified: SQL Injection remediated with prepared query',
      alertConfidence: 'SYNTAX VALIDATED',
      alertType: 'success'
    }
  },
  {
    id: 6,
    tab: '6 PR Creation',
    stageNumber: 'STAGE 06 / 07',
    engineTag: 'CI/CD DISPATCH ENGINE',
    icon: GitPullRequest,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    title: 'Pull Request Synthesis',
    subtitle: 'Automated GitHub & GitLab PRs with Full Security Context',
    desc: 'Generates structured pull requests complete with vulnerability explanations, OWASP and CWE classifications, remediation rationale, and test validation checklists.',
    bullets: [
      'One-click GitHub & GitLab PR creation from within Severa',
      'Automated branch creation with signed remediation commits',
      'Executive summary markdown generated for engineering review'
    ],
    preview: {
      engine: 'Git Integration · Branch: fix/sqli-cwe-89',
      badge: 'GitHub PR #42',
      target: 'severaai/severa-core',
      meta: 'Ready to Merge',
      code: [
        { type: 'comment', label: 'TITLE', text: "## 🛡️ Security Fix: SQL Injection in auth.py (CWE-89)" },
        { type: 'source', label: 'REASON', text: "- Problem: Unsanitized input interpolated into SQL query" },
        { type: 'source', label: 'FIX', text: "- Solution: Parameterized prepared statement applied" },
        { type: 'sink', label: 'TESTS', text: "- Test suite: 28/28 passed (Regression tests verified)" }
      ],
      alertIcon: '🚀',
      alertText: 'Pull Request Ready: github.com/severaai/severa-core/pull/42',
      alertConfidence: 'READY TO MERGE',
      alertType: 'success'
    }
  },
  {
    id: 7,
    tab: '7 Audit Report',
    stageNumber: 'STAGE 07 / 07',
    engineTag: 'COMPLIANCE & EXPORT ENGINE',
    icon: FileText,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Export Security Reports',
    subtitle: 'OWASP Top 10, MITRE ATT&CK & SARIF 2.1.0 Exports',
    desc: 'Export standard compliance documents for CISO review, compliance audits, and GitHub code scanning integration in SARIF, PDF, JSON, and ZIP formats.',
    bullets: [
      'Standard SARIF 2.1.0 output for GitHub Advanced Security & CI/CD',
      'OWASP Top 10 & MITRE ATT&CK matrix compliance mapping',
      'One-click download of patched project code in folder .zip'
    ],
    preview: {
      engine: 'Report Generator · SARIF & OWASP',
      badge: 'Export Ready',
      target: 'audit-report-2026.sarif',
      meta: 'Score: 98/100 (A+)',
      code: [
        { type: 'comment', label: 'FORMAT', text: "{\n  \"version\": \"2.1.0\",\n  \"$schema\": \"https://sarif.json\"" },
        { type: 'source', label: 'TOOL', text: "  \"tool\": { \"name\": \"Severa Defender AI\", \"version\": \"2.4.0\" }," },
        { type: 'sink', label: 'STATUS', text: "  \"runs\": [{ \"results\": [], \"invocations\": [{ \"success\": true }] }]" },
        { type: 'comment', label: 'END', text: "}" }
      ],
      alertIcon: '📊',
      alertText: 'CISO Audit Ready: OWASP Compliant · Zero Critical Findings',
      alertConfidence: 'GRADE: A+ (98/100)',
      alertType: 'success'
    }
  }
];

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
  const [activeStage, setActiveStage] = useState(0);

  const DOCKER_CMD = 'docker run -d -p 3000:3000 severaai/severa:latest';
  const currentStage = WORKFLOW_STAGES[activeStage] || WORKFLOW_STAGES[0];

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

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10 xl:gap-14 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            {/* Info bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-semibold">
              <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Open Source &amp; Self-Hostable Security Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-6">
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

      {/* ── WORKFLOW PIPELINE (INTERACTIVE 7-STAGE SWITCHER / SCROLLER - IMAGE 5) ──────────────── */}
      <section id="features" className="relative z-10 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold mb-4">
              <Layers size={14} />
              Developer Workflow Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">End-to-End Automated Code Defense</h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Switch or scroll through the 7 automated security defense stages built specifically for modern developer teams.
            </p>
          </div>

          {/* 7 Stage Pills / Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2">
            {WORKFLOW_STAGES.map((s, idx) => {
              const isActive = idx === activeStage;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStage(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10'
                      : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{s.tab.replace(/^\d+\s*/, '')}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Showcase Card */}
          <div className="bg-[#090c15] border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Top Meta Line */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                {currentStage.stageNumber}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                {currentStage.engineTag}
              </span>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (Stage Information) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${currentStage.iconBg} ${currentStage.iconColor}`}>
                    <currentStage.icon size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-white">{currentStage.title}</h3>
                </div>

                <p className="text-sm font-semibold text-emerald-400">
                  {currentStage.subtitle}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {currentStage.desc}
                </p>

                {/* Bullets with green check */}
                <div className="space-y-2.5 pt-2">
                  {currentStage.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setActiveStage((prev) => (prev - 1 + WORKFLOW_STAGES.length) % WORKFLOW_STAGES.length)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <button
                    onClick={() => setActiveStage((prev) => (prev + 1) % WORKFLOW_STAGES.length)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Next Stage
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="ml-auto text-xs sm:text-sm text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                  >
                    Launch Workspace →
                  </button>
                </div>
              </div>

              {/* Right Column (Code & Live Analysis Preview) */}
              <div className="lg:col-span-7 bg-[#05070d] border border-white/10 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
                {/* Chrome header */}
                <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
                    <span className="text-slate-300 text-xs font-semibold">{currentStage.preview.engine}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                    {currentStage.preview.badge}
                  </span>
                </div>

                {/* Target line */}
                <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-slate-400 text-xs">
                  <span>Target: <span className="text-slate-200">{currentStage.preview.target}</span></span>
                  <span className="text-emerald-400 font-semibold">{currentStage.preview.meta}</span>
                </div>

                {/* Code body */}
                <div className="p-4 space-y-2 bg-[#05070d] min-h-[170px] font-mono text-xs sm:text-sm">
                  {currentStage.preview.code.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                        line.type === 'entry' ? 'bg-blue-500/20 text-blue-400' :
                        line.type === 'source' ? 'bg-emerald-500/20 text-emerald-400' :
                        line.type === 'taint' ? 'bg-amber-500/20 text-amber-400' :
                        line.type === 'sink' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {line.label}
                      </span>
                      <span className={`leading-relaxed ${
                        line.type === 'taint' ? 'text-amber-300 font-semibold' :
                        line.type === 'sink' ? 'text-rose-300 font-semibold' :
                        line.type === 'source' ? 'text-emerald-300' :
                        'text-slate-300'
                      }`}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Alert banner */}
                <div className={`px-4 py-2.5 border-t flex items-center justify-between text-xs font-semibold ${
                  currentStage.preview.alertType === 'danger'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : currentStage.preview.alertType === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{currentStage.preview.alertIcon}</span>
                    <span>{currentStage.preview.alertText}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/40">
                    {currentStage.preview.alertConfidence}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Switcher Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scroll or click any stage to switch:</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveStage((prev) => (prev - 1 + WORKFLOW_STAGES.length) % WORKFLOW_STAGES.length)}
                className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Previous Stage"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {WORKFLOW_STAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStage(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === activeStage ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Go to Stage ${i + 1}`}
                  />
                ))}
              </div>

              <span className="text-slate-300 font-bold ml-1">
                {activeStage + 1} / {WORKFLOW_STAGES.length}
              </span>

              <button
                onClick={() => setActiveStage((prev) => (prev + 1) % WORKFLOW_STAGES.length)}
                className="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Next Stage"
              >
                <ChevronRight size={16} />
              </button>
            </div>
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
          <p className="text-sm text-slate-400">© 2026 Severa AI. All rights reserved.</p>
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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  Shield, Zap, Eye, Lock, Server, CheckCircle,
  ArrowRight, Code2, Cpu, Layers, Sparkles,
  Terminal, Copy, Check, Package, GitPullRequest, FileText,
  FileCode, ExternalLink
} from 'lucide-react';

// ── GitHub Icon SVG ────────────────────────────────────────────────────────────
function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e) {
    e?.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1 sm:p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

// ── Navigation items with consistent emerald green theme ────────────────────────
const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    activeClass: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/35',
    dotColor: 'bg-slate-950',
  },
  {
    id: 'features',
    label: 'Features',
    activeClass: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/35',
    dotColor: 'bg-slate-950',
  },
  {
    id: 'quickstart',
    label: 'Quick Start',
    activeClass: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/35',
    dotColor: 'bg-slate-950',
  },
];

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ navigate, activeSlideIndex = 0, onSelectSlide }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#191C23]/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="w-full max-w-[1720px] mx-auto px-2.5 sm:px-6 md:px-10 lg:px-14 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Logo */}
        <div
          onClick={() => onSelectSlide(0)}
          className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 cursor-pointer group select-none"
        >
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Shield size={16} className="text-emerald-400 sm:size-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight">SEVERA AI</span>
          </div>
        </div>

        {/* Navigation links / pills (ALWAYS VISIBLE across all screen sizes) */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 p-1 rounded-xl bg-[#0d1017]/90 border border-white/10 backdrop-blur-xl shadow-lg shrink-0">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSlideIndex === idx;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSlide(idx)}
                className={`px-2 sm:px-3.5 md:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-sm transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer border ${
                  isActive
                    ? `${item.activeClass} shadow-md font-black`
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5 font-semibold'
                }`}
              >
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} animate-pulse`} />
                )}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <a
            href="https://github.com/severa246/severa-defender-ai"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-[11px] sm:text-xs font-semibold transition-all hover:border-emerald-500/40"
          >
            <GithubIcon className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] sm:text-sm font-black transition-all shadow-md shadow-emerald-500/25 cursor-pointer hover:shadow-emerald-500/40"
          >
            <span>Launch</span>
            <ArrowRight size={12} className="sm:size-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Animated terminal steps ────────────────────────────────────────────────────
const TERMINAL_STEPS = [
  {
    stepNum: 'Step 1',
    title: 'SAST Scan',
    mobileTitle: 'SAST',
    text: '$ severa scan run --repo github.com/acme/core-api',
    headerTitle: 'Vulnerability Detection',
    info: 'SAST Engine v2.4 · 142 files indexed',
    items: [
      { label: 'Repository Cloned & AST Tree Indexed', value: 'Done', done: true },
      { label: 'Flaw Flagged: SQL Injection (CWE-89)', value: 'Critical', done: true, badge: 'text-red-400' },
      { label: 'Flaw Flagged: Hardcoded JWT Secret', value: 'High', done: true, badge: 'text-amber-400' },
      { label: 'SAST Scan Complete — 3 Flaws Detected', value: 'Finished', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    stepNum: 'Step 2',
    title: 'AI Remediation',
    mobileTitle: 'AI Fix',
    text: '$ severa ai remediate --finding SEC-2024-89',
    headerTitle: 'AI Auto-Patching & Code Fix',
    info: 'Connected to Severa AI Engine (Gemini 1.5 Flash)',
    items: [
      { label: 'Targeting AST Sink: auth.py:L42', value: 'Done', done: true },
      { label: 'Generating Parametrized Prepared Statement', value: 'Done', done: true },
      { label: 'Security Grade Upgraded: Grade C → A+', value: 'Upgraded', done: true, badge: 'text-cyan-400' },
      { label: 'Automated Patch Refactor Verified', value: 'Ready', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    stepNum: 'Step 3',
    title: 'Severa Defender',
    mobileTitle: 'Defender',
    text: '$ severa defender explain --file auth.py',
    headerTitle: 'AI Security Assistant & Prevention',
    info: 'Severa Defender AI Agent inspecting vulnerability',
    items: [
      { label: 'Analyzing Root Cause: Raw string concatenation', value: 'Analyzed', done: true },
      { label: 'Mapping Attack Vector: SQL Injection auth bypass', value: 'Mapped', done: true },
      { label: 'Generating Future Prevention Guidelines', value: 'Generated', done: true, badge: 'text-emerald-400' },
      { label: 'Defense Blueprint & CI/CD Hook Ready', value: 'Complete', done: true, badge: 'text-emerald-400' },
    ]
  },
  {
    stepNum: 'Step 4',
    title: 'Audit & PR',
    mobileTitle: 'PR Fix',
    text: '$ severa report generate --pr-create',
    headerTitle: 'GitHub PR & PDF Compliance',
    info: 'Generating Executive Audit & Pull Request',
    items: [
      { label: 'Generating Executive Compliance Summary', value: 'Done', done: true },
      { label: 'Creating GitHub PR #104 "fix(sec): SQLi patch"', value: 'Opened', done: true, badge: 'text-cyan-400' },
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
      const t = setTimeout(() => setRevealedOutput((r) => r + 1), 400);
      return () => clearTimeout(t);
    } else {
      const loopTimer = setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % TERMINAL_STEPS.length);
      }, 2000);
      return () => clearTimeout(loopTimer);
    }
  }, [revealedOutput, activeStep, step.items.length]);

  return (
    <div className="bg-[#080b12] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/80 w-full text-left">
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2.5 border-b border-white/10 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-slate-300 font-mono flex-1 truncate">severa-cli — zsh</span>
        <span className="text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 shrink-0">● LIVE DEMO</span>
      </div>

      {/* Step tabs — 4 equal columns */}
      <div className="grid grid-cols-4 w-full border-b border-white/10 bg-black/40">
        {TERMINAL_STEPS.map((s, i) => {
          const isActive = i === activeStep;
          return (
            <button
              key={s.stepNum}
              type="button"
              onClick={() => setActiveStep(i)}
              className={`py-1.5 sm:py-2 px-1 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 text-center transition-all border-b-2 cursor-pointer select-none ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] font-medium'
              }`}
            >
              <span className={`text-[9px] sm:text-xs tracking-tight shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {s.stepNum}:
              </span>
              <span className="text-[10px] sm:text-xs truncate max-w-full">
                <span className="hidden sm:inline">{s.title}</span>
                <span className="inline sm:hidden">{s.mobileTitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Command line */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-white/10 bg-black/50 overflow-hidden">
        <p className="font-mono text-[11px] sm:text-xs md:text-sm text-emerald-300 truncate">{step.text}</p>
      </div>

      {/* Terminal Body */}
      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Shield size={11} className="text-emerald-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 truncate">{step.headerTitle}</span>
          </div>
          <span className="text-[9px] sm:text-[11px] text-emerald-400 font-mono font-bold animate-pulse shrink-0">● LIVE</span>
        </div>

        {/* Output lines */}
        {step.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-1.5 text-[10px] sm:text-xs font-mono transition-all duration-300 ${
              i < revealedOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className={`shrink-0 text-xs ${i < revealedOutput - 1 ? 'text-emerald-400 font-bold' : 'text-emerald-500/80 font-bold'}`}>
                {i < revealedOutput - 1 ? '✓' : '⦿'}
              </span>
              <span className={`truncate ${i < revealedOutput - 1 ? 'text-slate-200' : 'text-slate-300 font-medium'}`}>
                {item.label}
              </span>
            </div>
            <span className={`shrink-0 text-[9px] sm:text-[11px] font-bold ${item.badge || (i < revealedOutput - 1 ? 'text-emerald-400' : 'text-slate-400')}`}>
              {i < revealedOutput - 1 ? item.value : 'Running...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step card for features pipeline ───────────────────────────────────────────
function StepCard({ number, icon: Icon, title, desc, iconColor = 'text-emerald-400', iconBg = 'bg-emerald-500/10 border-emerald-500/20' }) {
  return (
    <div className="p-2 sm:p-3.5 lg:p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all text-left group">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon size={14} className="sm:size-4" />
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded tracking-wider">
          {String(number).padStart(2,'0')}
        </span>
      </div>
      <h3 className="text-xs sm:text-sm lg:text-base font-bold text-white mb-0.5 truncate">{title}</h3>
      <p className="text-[10px] sm:text-xs text-slate-300 leading-tight font-normal line-clamp-2">{desc}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { navigate } = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const isTransitioningRef = useRef(false);
  const activeSlideRef = useRef(0);
  activeSlideRef.current = activeSlide;

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);

  const GITHUB_REPO_URL = 'https://github.com/severa246/severa-defender-ai';
  const GIT_CLONE_CMD = 'git clone https://github.com/severa246/severa-defender-ai.git';
  const SLIDES = ['home', 'features', 'quickstart'];
  const TOTAL_SLIDES = SLIDES.length;

  // Transition controller
  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= TOTAL_SLIDES) return;
    if (isTransitioningRef.current && index === activeSlideRef.current) return;

    isTransitioningRef.current = true;
    setActiveSlide(index);

    try {
      window.history.replaceState(null, '', `#${SLIDES[index]}`);
    } catch {}

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 650);
  }, [TOTAL_SLIDES]);

  // Lock document body scroll on mount
  useEffect(() => {
    document.documentElement.classList.add('landing-snap-page');
    document.body.classList.add('landing-snap-page');

    // Check hash on initial load
    const hash = window.location.hash.replace('#', '');
    const idx = SLIDES.indexOf(hash);
    if (idx !== -1) {
      setActiveSlide(idx);
    }

    return () => {
      document.documentElement.classList.remove('landing-snap-page');
      document.body.classList.remove('landing-snap-page');
    };
  }, []);

  // Wheel listener for PC (mouse wheel & touchpad)
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      // Delta threshold: triggers when wheel scroll reaches certain level
      if (Math.abs(e.deltaY) < 18) return;

      const current = activeSlideRef.current;
      if (e.deltaY > 0 && current < TOTAL_SLIDES - 1) {
        e.preventDefault();
        goToSlide(current + 1);
      } else if (e.deltaY < 0 && current > 0) {
        e.preventDefault();
        goToSlide(current - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goToSlide, TOTAL_SLIDES]);

  // Touch gesture listener for Mobile (finger swipe / drag)
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      isSwiping.current = true;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.current || isTransitioningRef.current) return;
      if (e.touches.length !== 1) return;

      const deltaY = touchStartY.current - e.touches[0].clientY;
      const deltaX = touchStartX.current - e.touches[0].clientX;

      // Ensure vertical gesture dominates
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Threshold: 32px of touch movement automatically triggers slide switch
        if (deltaY > 32 && activeSlideRef.current < TOTAL_SLIDES - 1) {
          isSwiping.current = false;
          goToSlide(activeSlideRef.current + 1);
        } else if (deltaY < -32 && activeSlideRef.current > 0) {
          isSwiping.current = false;
          goToSlide(activeSlideRef.current - 1);
        }
      }
    };

    const handleTouchEnd = () => {
      isSwiping.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToSlide, TOTAL_SLIDES]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const current = activeSlideRef.current;
      if (['ArrowDown', 'PageDown'].includes(e.key) && current < TOTAL_SLIDES - 1) {
        e.preventDefault();
        goToSlide(current + 1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && current > 0) {
        e.preventDefault();
        goToSlide(current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(TOTAL_SLIDES - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide, TOTAL_SLIDES]);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#191C23] text-white font-sans select-none">
      {/* Seamless fixed background grid design */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Navbar */}
      <Navbar
        navigate={navigate}
        activeSlideIndex={activeSlide}
        onSelectSlide={goToSlide}
      />

      {/* ── 3-Slide Presentation Track (Zero Gap, Smooth Glide) ───────── */}
      <div
        className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col"
        style={{ transform: `translateY(-${activeSlide * 100}%)` }}
      >
        {/* ── SLIDE 0: HOME ────────────────────────────────────────────── */}
        <section
          id="home"
          className="w-full h-[100dvh] min-h-[100dvh] shrink-0 flex flex-col justify-center relative px-3 sm:px-8 lg:px-14 xl:px-20 pt-14 sm:pt-16 lg:pt-20 pb-2 sm:pb-6 overflow-hidden"
        >
          <div className="relative w-full max-w-[1720px] mx-auto grid lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="w-full text-center lg:text-left">
              {/* Badge */}
              <div className="flex justify-center lg:justify-start items-center gap-2 mb-1.5 sm:mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Source Security Platform
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight mb-1.5 sm:mb-3">
                Build Secure Software <span className="text-emerald-400">Faster</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed mb-2.5 sm:mb-5 max-w-xl mx-auto lg:mx-0 font-normal line-clamp-2 sm:line-clamp-none">
                Open-source AI security platform for intelligent code review, vulnerability detection, automated remediation, and DevSecOps workflows.
              </p>

              {/* Buttons & Docker Quick Command */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2 sm:mb-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-black transition-all shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 cursor-pointer"
                >
                  Get Started
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/app')}
                  className="flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Eye size={14} className="text-slate-300" />
                  View Demo
                </button>
              </div>

              {/* GitHub Repository Quick Access */}
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 hover:border-emerald-500/40 transition-all rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs text-slate-200 max-w-md mx-auto lg:mx-0 shadow-lg group">
                <GithubIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-slate-200 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-medium"
                  title="View GitHub Repository"
                >
                  <span className="truncate">{GITHUB_REPO_URL}</span>
                  <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </a>
                <CopyButton text={GITHUB_REPO_URL} />
              </div>
            </div>

            {/* Right Column — Demo Terminal */}
            <div className="relative w-full max-w-xl lg:max-w-none mx-auto">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/15 to-transparent blur-xl pointer-events-none" />
              <DemoTerminal />
            </div>
          </div>
        </section>

        {/* ── SLIDE 1: FEATURES ────────────────────────────────────────── */}
        <section
          id="features"
          className="w-full h-[100dvh] min-h-[100dvh] shrink-0 flex flex-col justify-center relative px-3 sm:px-8 lg:px-14 xl:px-20 pt-14 sm:pt-16 lg:pt-20 pb-2 sm:pb-6 overflow-hidden border-t border-white/10"
        >
          <div className="w-full max-w-[1720px] mx-auto text-center">
            {/* Header */}
            <div className="mb-2 sm:mb-4 lg:mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-bold mb-1">
                <Layers size={12} />
                Developer Workflow Pipeline
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-1">
                End-to-End Automated Code Defense
              </h2>
              <p className="text-[11px] sm:text-xs lg:text-sm text-slate-300 max-w-2xl mx-auto leading-tight line-clamp-1 sm:line-clamp-none">
                Severa replaces fragmented security scanners with a unified open-source workflow pipeline.
              </p>
            </div>

            {/* Step Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 mb-1.5 sm:mb-3">
              <StepCard number={1} icon={Code2} iconColor="text-slate-200" iconBg="bg-white/5 border-white/10"
                title="Repository Analysis"
                desc="Deep AST parsing across 30+ languages. Automatic call graph indexing." />
              <StepCard number={2} icon={Lock} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20"
                title="Secret Detection"
                desc="Real-time detection for API keys, JWT secrets, and AWS credentials." />
              <StepCard number={3} icon={Package} iconColor="text-violet-400" iconBg="bg-violet-500/10 border-violet-500/20"
                title="Dependency Analysis"
                desc="SCA scanning against OSV and NVD to detect vulnerable packages." />
              <StepCard number={4} icon={Sparkles} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20"
                title="AI Review Engine"
                desc="LLM security reviews powered by Gemini Flash or local Ollama models." />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
              <StepCard number={5} icon={Zap} iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20"
                title="Automated Fixes"
                desc="Context-aware patch synthesis with clean, verified regression tests." />
              <StepCard number={6} icon={GitPullRequest} iconColor="text-rose-400" iconBg="bg-rose-500/10 border-rose-500/20"
                title="Pull Request Synthesis"
                desc="One-click GitHub PR creation with remediation diffs and rationale." />
              <div className="col-span-2 lg:col-span-1">
                <StepCard number={7} icon={FileText} iconColor="text-orange-400" iconBg="bg-orange-500/10 border-orange-500/20"
                  title="Compliance Reports"
                  desc="Interactive OWASP Top 10 matrices, MITRE ATT&CK maps, and SBOMs." />
              </div>
            </div>
          </div>
        </section>

        {/* ── SLIDE 2: QUICK START & FOOTER ────────────────────────────── */}
        <section
          id="quickstart"
          className="w-full h-[100dvh] min-h-[100dvh] shrink-0 flex flex-col justify-between relative px-3 sm:px-8 lg:px-14 xl:px-20 pt-14 sm:pt-16 lg:pt-20 pb-0 overflow-hidden border-t border-white/10"
        >
          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl mx-auto text-center py-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-bold mb-2 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free &amp; Open Source Security Platform
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-1.5 sm:mb-2">
              Start securing your codebase today
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-3 sm:mb-5 max-w-xl leading-relaxed">
              Deploy in minutes. No vendor lock-in. Your code stays on your infrastructure.
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center mb-3 sm:mb-5">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-black transition-all shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Eye size={14} />
                Live Demo
              </button>
            </div>

            {/* Quick-start CLI block */}
            <div className="text-left bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-w-xl w-full">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500/70" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                  <span className="ml-1 text-[11px] text-slate-300 font-mono font-semibold">Quick Start CLI</span>
                </div>
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                  title="View on GitHub"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">severa-defender-ai</span>
                  <ExternalLink size={10} />
                </a>
              </div>
              <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 font-mono text-[11px] sm:text-xs">
                {[
                  { prompt: '$', cmd: 'git clone https://github.com/severa246/severa-defender-ai.git', color: 'text-slate-200' },
                  { prompt: '$', cmd: 'cd severa-defender-ai && npm install', color: 'text-slate-200' },
                  { prompt: '$', cmd: 'npm run dev', color: 'text-emerald-400 font-bold' },
                ].map(({ prompt, cmd, color }) => (
                  <div key={cmd} className="flex items-center gap-2 group">
                    <span className="text-emerald-400 font-bold shrink-0">{prompt}</span>
                    <span className={`flex-1 truncate ${color}`}>{cmd}</span>
                    <CopyButton text={cmd} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pinned Footer */}
          <footer className="w-full border-t border-white/10 py-2.5 sm:py-4 px-3 sm:px-8 lg:px-14 shrink-0 bg-[#14171e]/90 backdrop-blur-md">
            <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => goToSlide(0)}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Shield size={13} className="text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-white">SEVERA AI</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">© 2026 Severa AI · Open Source</p>
              <div className="flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-slate-300">
                <button
                  onClick={() => goToSlide(0)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => goToSlide(1)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => goToSlide(2)}
                  className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
                >
                  Quick Start
                </button>
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors cursor-pointer font-medium flex items-center gap-1"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-emerald-400 font-bold transition-colors cursor-pointer text-emerald-400"
                >
                  Launch →
                </button>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

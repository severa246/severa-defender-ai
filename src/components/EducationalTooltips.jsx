import React, { useState } from 'react';
import { HelpCircle, ExternalLink, ShieldAlert, Activity, BookOpen, Key, Info } from 'lucide-react';

// ── Metric Parsing Helpers ───────────────────────────────────────────────────

export function parseCvssVector(vectorStr = '') {
  if (!vectorStr) {
    vectorStr = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H';
  }

  const clean = vectorStr.replace(/^CVSS:3\.[01]\//, '');
  const parts = clean.split('/');

  const mapping = {
    AV: {
      name: 'Attack Vector',
      values: {
        N: { label: 'Network', desc: 'Exploitable remotely over the internet without physical or local access.', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        A: { label: 'Adjacent', desc: 'Requires access to local network / subnet.', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
        L: { label: 'Local', desc: 'Attacker must have local terminal or shell access.', color: 'text-sky-300 bg-sky-500/15 border-sky-500/30' },
        P: { label: 'Physical', desc: 'Requires physical hardware tampering.', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30' }
      }
    },
    AC: {
      name: 'Attack Complexity',
      values: {
        L: { label: 'Low', desc: 'No special conditions or race conditions needed to exploit.', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        H: { label: 'High', desc: 'Successful attack depends on specific conditions or timing.', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' }
      }
    },
    PR: {
      name: 'Privileges Required',
      values: {
        N: { label: 'None', desc: 'Attacker is completely unauthenticated (anonymous).', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        L: { label: 'Low', desc: 'Requires basic low-privileged user account.', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
        H: { label: 'High', desc: 'Requires admin or root privileges.', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' }
      }
    },
    UI: {
      name: 'User Interaction',
      values: {
        N: { label: 'None', desc: 'System can be exploited without tricking any user.', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        R: { label: 'Required', desc: 'Victim must take an action (e.g. click a phishing link).', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' }
      }
    },
    S: {
      name: 'Scope',
      values: {
        U: { label: 'Unchanged', desc: 'Vulnerability affects only resources within the component authority.', color: 'text-sky-300 bg-sky-500/15 border-sky-500/30' },
        C: { label: 'Changed', desc: 'Exploit impacts resources beyond its boundary (e.g. host escape, sandbox escape).', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' }
      }
    },
    C: {
      name: 'Confidentiality Impact',
      values: {
        H: { label: 'High', desc: 'Total information disclosure (database dump, credentials exposed).', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        L: { label: 'Low', desc: 'Limited disclosure of restricted data.', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
        N: { label: 'None', desc: 'No sensitive information disclosed.', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30' }
      }
    },
    I: {
      name: 'Integrity Impact',
      values: {
        H: { label: 'High', desc: 'Attacker can alter all system files and records.', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        L: { label: 'Low', desc: 'Attacker can modify limited non-critical records.', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
        N: { label: 'None', desc: 'No unauthorized data modification.', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30' }
      }
    },
    A: {
      name: 'Availability Impact',
      values: {
        H: { label: 'High', desc: 'Total denial of service or permanent application shutdown.', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
        L: { label: 'Low', desc: 'Reduced performance or temporary service disruption.', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
        N: { label: 'None', desc: 'No service uptime impact.', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30' }
      }
    }
  };

  const parsedMetrics = [];
  parts.forEach(part => {
    const [key, val] = part.split(':');
    if (mapping[key]) {
      const def = mapping[key];
      const valDef = def.values[val] || { label: val, desc: 'Metric factor', color: 'text-slate-300' };
      parsedMetrics.push({
        key,
        name: def.name,
        code: `${key}:${val}`,
        label: valDef.label,
        desc: valDef.desc,
        color: valDef.color
      });
    }
  });

  return parsedMetrics;
}

// ── Educational EPSS Tooltip Component ───────────────────────────────────────
export function EpssTooltip({ score = '94.2%', percentile = '98th', children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute threat level based on score
  const numericScore = parseFloat(String(score).replace('%', '')) || 0;
  const isHighThreat = numericScore >= 50;
  const isMediumThreat = numericScore >= 15 && numericScore < 50;

  return (
    <div
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {children || (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15 font-semibold inline-flex items-center gap-1 hover:border-amber-400/50 transition-colors">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>EPSS {score}</span>
        </span>
      )}

      {/* Floating Educational Popover */}
      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 sm:w-96 p-4 rounded-xl bg-[#141824] border border-amber-500/30 shadow-2xl shadow-black/80 text-left font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">EPSS Metric Guide</h4>
                <p className="text-[10px] text-slate-400 font-mono">Exploit Prediction Scoring System</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              FIRST.org Standard
            </span>
          </div>

          {/* Metric Stats Banner */}
          <div className="my-2.5 p-2.5 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Exploit Likelihood</span>
              <span className={`font-bold text-sm ${isHighThreat ? 'text-rose-400' : isMediumThreat ? 'text-amber-400' : 'text-emerald-400'}`}>
                {score} Probability
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans">Global Percentile</span>
              <span className="font-bold text-slate-200 text-sm">
                Top {percentile}
              </span>
            </div>
          </div>

          {/* Definition */}
          <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5">
            <strong>What it means:</strong> EPSS is a machine-learning model that estimates the probability that a software vulnerability will be <em>actively exploited in the wild</em> within the next 30 days.
          </p>

          {/* Junior Developer Insight Callout */}
          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Junior Developer Tip: EPSS vs. CVSS</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-snug">
              • <strong>CVSS</strong> measures theoretical <em>severity</em> (how bad it hurts if exploited).<br />
              • <strong>EPSS</strong> measures actual <em>threat activity</em> (are hackers actively attacking this right now in real life?).
            </p>
            <p className="text-[10px] text-slate-300/80 pt-1">
              {isHighThreat
                ? '⚠️ Over 50% probability means automated exploit bots are actively targeting this in production. Patch immediately!'
                : '🛡️ Lower exploit probability, but still patch according to CVSS severity.'}
            </p>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 rotate-45 bg-[#141824] border-r border-b border-amber-500/30" />
        </div>
      )}
    </div>
  );
}

// ── Educational CVSS Vector String Tooltip Component ─────────────────────────
export function CvssVectorTooltip({
  score = '9.8',
  vector = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
  severity = 'CRITICAL',
  children,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const parsedVector = parseCvssVector(vector);

  return (
    <div
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {children || (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15 font-semibold inline-flex items-center gap-1 hover:border-emerald-400/50 transition-colors">
          <ShieldAlert className="w-3 h-3 text-emerald-400" />
          <span>CVSS {score}</span>
        </span>
      )}

      {/* Floating Educational Popover */}
      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 sm:w-[420px] p-4 rounded-xl bg-[#141824] border border-emerald-500/30 shadow-2xl shadow-black/80 text-left font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">CVSS v3.1 Vector Breakdown</h4>
                <p className="text-[10px] text-slate-400 font-mono">Common Vulnerability Scoring System</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {score} / 10.0 ({severity})
              </span>
            </div>
          </div>

          {/* Raw Vector String Display */}
          <div className="my-2.5 p-2 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 break-all select-all">
            <span className="text-[10px] text-slate-400 uppercase font-sans block mb-0.5">Vector String:</span>
            <code className="text-emerald-300">{vector}</code>
          </div>

          {/* Deconstructed Vector Pills Grid */}
          <div className="space-y-1.5 my-2.5 max-h-48 overflow-y-auto pr-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Vector Metrics Explained:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {parsedVector.map((metric) => (
                <div
                  key={metric.key}
                  className="p-1.5 rounded-lg bg-black/40 border border-white/10 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{metric.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${metric.color}`}>
                      {metric.code} ({metric.label})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    {metric.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Junior Developer Insight Callout */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Junior Developer Guide: How to Read CVSS</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-snug">
              Notice the first metrics: <strong>AV:N</strong> (Network) + <strong>AC:L</strong> (Low Complexity) + <strong>PR:N</strong> (No Privileges) means any anonymous attacker anywhere on the internet can exploit this vulnerability without credentials.
            </p>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 rotate-45 bg-[#141824] border-r border-b border-emerald-500/30" />
        </div>
      )}
    </div>
  );
}

// ── Educational CWE Identifier Tooltip ───────────────────────────────────────
export function CweTooltip({ cwe = 'CWE-89', cweUrl = '', children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {children || (
        <span className="text-[11px] font-mono font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 hover:border-emerald-500/40 transition-colors">
          {cwe}
        </span>
      )}

      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 rounded-xl bg-[#141824] border border-white/15 shadow-2xl shadow-black/80 text-left font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-slate-100 font-bold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>CWE Classification</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              MITRE Standard
            </span>
          </div>

          <p className="text-[11px] text-slate-300 my-2 leading-relaxed">
            <strong>Common Weakness Enumeration (CWE)</strong> is a formal dictionary of software security weaknesses maintained by the MITRE Corporation and the security community.
          </p>

          <div className="p-2 rounded-lg bg-black/50 border border-white/10 text-[10px] text-slate-300">
            <span className="font-semibold text-emerald-300 block mb-0.5">Why this matters:</span>
            CWE codes allow security teams, static code analyzers, and compliance auditors (SOC2, HIPAA, ISO 27001) to reference exact vulnerability categories.
          </div>

          {cweUrl && (
            <div className="mt-2 text-right">
              <a
                href={cweUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Read MITRE Advisory</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 rotate-45 bg-[#141824] border-r border-b border-white/15" />
        </div>
      )}
    </div>
  );
}

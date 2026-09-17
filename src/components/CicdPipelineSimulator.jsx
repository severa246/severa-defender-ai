import React, { useState } from 'react';
import { GitPullRequest, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Bot, GitCommit, Settings2, Play } from 'lucide-react';

export default function CicdPipelineSimulator({ scanMetrics, findings = [] }) {
  const [maxCriticalAllowed, setMaxCriticalAllowed] = useState(0);
  const [maxHighAllowed, setMaxHighAllowed] = useState(1);
  const [minHealthScore, setMinHealthScore] = useState(80);

  const criticals = scanMetrics?.criticalCount || 0;
  const highs = scanMetrics?.highCount || 0;
  const healthScore = scanMetrics?.score || 100;

  const isBlocked = criticals > maxCriticalAllowed || highs > maxHighAllowed || healthScore < minHealthScore;

  return (
    <div className="space-y-6">
      {/* CI/CD Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isBlocked ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
            <GitPullRequest className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">PR #142</span>
              <h2 className="text-base font-bold text-slate-100">feature/auth-and-backup-api → main</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Author: <span className="text-cyan-400">dev-user@company.io</span> | Triggered by Push Event</p>
          </div>
        </div>

        {/* PR Status Gate Badge */}
        <div className="flex items-center gap-3">
          {isBlocked ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-bold text-xs shadow-lg shadow-rose-500/10 animate-pulse">
              <XCircle className="w-4 h-4" />
              <span>CI/CD PIPELINE BLOCKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-4 h-4" />
              <span>PASSED QUALITY GATE</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Gate Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Security Quality Gate Policy</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Max Critical Allowed:</span>
                <span className="font-bold text-rose-400">{maxCriticalAllowed}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={maxCriticalAllowed}
                onChange={(e) => setMaxCriticalAllowed(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Max High Flaws Allowed:</span>
                <span className="font-bold text-amber-400">{maxHighAllowed}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={maxHighAllowed}
                onChange={(e) => setMaxHighAllowed(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Min Security Score Threshold:</span>
                <span className="font-bold text-cyan-400">{minHealthScore}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={minHealthScore}
                onChange={(e) => setMinHealthScore(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer" 
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>• Current Code Score: <span className="font-bold text-slate-200">{healthScore}/100</span></p>
            <p>• Detected Criticals: <span className="font-bold text-rose-400">{criticals}</span></p>
            <p>• Detected Highs: <span className="font-bold text-amber-400">{highs}</span></p>
          </div>
        </div>

        {/* Automated PR Security Bot Review Thread */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Severa AI Security Bot Automated Review</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>

          {/* Bot Comment Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                AI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">severa-ai-bot[bot]</span>
                  <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 text-[9px] rounded font-semibold border border-cyan-500/20">BOT</span>
                </div>
                <p className="text-[11px] text-slate-400">Automated SAST & Code Smell Gate Inspection</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                {isBlocked 
                  ? "❌ **Action Required**: Security Quality Gate check failed for commit `8f2a1b9`. Merge is automatically **BLOCKED** until critical vulnerabilities are resolved."
                  : "✅ **Security Gate Passed**: All checks passed successfully. Code is safe to merge into target branch `main`."}
              </p>

              {findings.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                    Vulnerabilities Flagged in PR Diff:
                  </div>
                  {findings.map((f) => (
                    <div key={f.id} className="flex items-start justify-between gap-2 text-rose-300">
                      <span>• Line {f.line}: [{f.severity}] {f.title} ({f.cwe})</span>
                      <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 shrink-0">{f.owasp.split(' - ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

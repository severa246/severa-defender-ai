import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown, ChevronUp, FileCheck2, X } from 'lucide-react';

export default function DiffViewer({ aiReviewData, onApplyFix, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!aiReviewData) return null;

  const { status, statusBadgeClass, fixedCode, originalCode, reviewComments, remediationDiffSummary, applied } = aiReviewData;

  const handleApply = () => {
    onApplyFix(fixedCode);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 transition-all">
      {/* Diff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>AI Automated Code Remediation</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBadgeClass}`}>
                {status}
              </span>
              {applied && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ✓ Patch Applied to Editor
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{remediationDiffSummary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Expand / Collapse Diff Option */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer shadow-sm"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronUp className="w-4 h-4 text-cyan-400" />}
            <span>{isCollapsed ? 'Expand Diff View' : 'Collapse Diff View'}</span>
          </button>

          {/* Apply Patch Button */}
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
              applied
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{applied ? '✓ Re-apply Patch' : 'Apply Patch to Editor'}</span>
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Diff Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Body */}
      {!isCollapsed && (
        <div className="space-y-4 animate-fadeIn">
          {/* AI Reviewer Assessment Comments */}
          {reviewComments && reviewComments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {reviewComments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1"
                >
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>{comment.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Side-by-Side Code Diff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* Original Vulnerable Code Panel */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  • Vulnerable Original Code
                </span>
                <span className="text-[10px] text-slate-500 font-mono">BEFORE</span>
              </div>
              <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
                <pre>{originalCode}</pre>
              </div>
            </div>

            {/* Remediated Secure Code Panel */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  • AI Remediated Secure Code
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">AFTER (SECURED)</span>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 font-mono text-[11px] text-emerald-200 overflow-x-auto max-h-[300px] leading-relaxed">
                <pre>{fixedCode}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

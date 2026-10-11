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
    <div className="bg-[#191C23] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60 space-y-4 transition-all">
      {/* Diff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#232732] border border-white/10 text-emerald-400">
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
            {aiReviewData?.provider && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pt-1.5">
                <span className="text-slate-500">Provenance:</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  aiReviewData.provenance === 'EXTERNAL_LLM'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}>
                  {aiReviewData.provenance || (aiReviewData.isLiveAi ? 'EXTERNAL_LLM' : 'LOCAL_FALLBACK')}
                </span>

                <span className="text-slate-500">Request ID:</span>
                <span className="text-emerald-400 bg-[#12141a] px-2 py-0.5 rounded border border-white/10 font-bold">
                  {aiReviewData.requestId || 'SEVERA-QWEN-LOCAL'}
                </span>

                {aiReviewData.providerHttpStatus !== undefined && (
                  <span className="text-slate-400 text-[10px] bg-[#12141a] px-1.5 py-0.5 rounded border border-white/10">
                    HTTP {aiReviewData.providerHttpStatus}
                  </span>
                )}

                {aiReviewData.fallbackReason && (
                  <span className="text-rose-400 text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">
                    Reason: {aiReviewData.fallbackReason}
                  </span>
                )}

                {aiReviewData.durationMs > 0 && (
                  <span className="text-slate-500 text-[10px]">
                    ({aiReviewData.durationMs}ms)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Expand / Collapse Diff Option */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#12141a] hover:bg-[#232732] text-slate-200 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer shadow-sm"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronUp className="w-4 h-4 text-emerald-400" />}
            <span>{isCollapsed ? 'Expand Diff View' : 'Collapse Diff View'}</span>
          </button>

          {/* Apply Patch Button */}
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
              applied
                ? 'bg-[#232732] text-emerald-400 border border-emerald-500/40 hover:bg-[#2c3240]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{applied ? '✓ Re-apply Patch' : 'Apply Patch to Editor'}</span>
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#232732] rounded-xl transition-colors cursor-pointer"
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
                  className="bg-[#12141a] border border-white/10 rounded-xl p-3 space-y-1"
                >
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
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
              <div className="bg-[#12141a] border border-rose-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
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
              <div className="bg-[#12141a] border border-emerald-500/30 rounded-xl p-3 font-mono text-[11px] text-emerald-200 overflow-x-auto max-h-[300px] leading-relaxed">
                <pre>{fixedCode}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

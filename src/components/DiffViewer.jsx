import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown, ChevronUp, FileCheck2, X } from 'lucide-react';
import VisualDiffViewer from './VisualDiffViewer';

export default function DiffViewer({ aiReviewData, onApplyFix, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!aiReviewData) return null;

  const { status, statusBadgeClass, fixedCode, originalCode, reviewComments, remediationDiffSummary, applied } = aiReviewData;

  const handleApply = () => {
    onApplyFix(fixedCode);
  };

  // Compute total lines accurately from the entered code
  const codeLinesCount = (originalCode ? originalCode.split('\n').length : (fixedCode ? fixedCode.split('\n').length : 1));
  const rulesCount = (aiReviewData?.verifiedFindings?.length || aiReviewData?.aiFindings?.length || 1);

  // Dynamic remediation summary matching user entered code
  const displaySummary = remediationDiffSummary && !remediationDiffSummary.includes('lines')
    ? remediationDiffSummary
    : `${rulesCount} security ${rulesCount === 1 ? 'rule' : 'rules'} applied across ${codeLinesCount} ${codeLinesCount === 1 ? 'line' : 'lines'}.`;

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
              {applied && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ✓ Patch Applied to Editor
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{displaySummary}</p>
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

          {/* Side-by-Side Visual Git Diff */}
          <VisualDiffViewer
            originalCode={originalCode}
            fixedCode={fixedCode}
            summary={displaySummary}
            onApplyFix={handleApply}
            applied={applied}
          />
        </div>
      )}
    </div>
  );
}

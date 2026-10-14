import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Check, X, Columns, AlignJustify, ArrowRight, ShieldCheck, 
  FileCode, CheckCheck, RefreshCw, AlertTriangle
} from 'lucide-react';
import { computeLineDiff } from '../utils/diffUtils';

export default function VisualDiffViewer({
  originalCode = '',
  fixedCode = '',
  fileName = 'main.py',
  language = 'javascript',
  summary = '',
  onApplyFix = null,
  onClose = null,
  isModal = false,
  applied = false,
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' (side-by-side) or 'unified' (inline)
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'changes-only'

  // Compute structured diff
  const diffData = useMemo(() => {
    return computeLineDiff(originalCode, fixedCode);
  }, [originalCode, fixedCode]);

  const { rows, alignedRows, additionsCount, deletionsCount, isIdentical } = diffData;

  // Filter for changes-only mode
  const displayAlignedRows = useMemo(() => {
    if (filterMode === 'changes-only') {
      return alignedRows.filter(
        (r) => r.left.type === 'deleted' || r.right.type === 'added'
      );
    }
    return alignedRows;
  }, [alignedRows, filterMode]);

  const displayUnifiedRows = useMemo(() => {
    if (filterMode === 'changes-only') {
      return rows.filter((r) => r.type === 'added' || r.type === 'deleted');
    }
    return rows;
  }, [rows, filterMode]);

  return (
    <div className={`bg-[#0f1118] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/80 ${isModal ? 'max-h-[85vh] w-full' : ''}`}>
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-[#161a24] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Side-by-Side Security Patch Diff</span>
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#10141e] border border-white/10 text-emerald-300 font-bold">
                {fileName}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                {language}
              </span>
            </div>
            {summary && (
              <p className="text-xs text-slate-400 mt-0.5">{summary}</p>
            )}
          </div>
        </div>

        {/* Diff Metrics & View Mode Toggles */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Additions & Deletions Counter Pills */}
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-[#0a0d14] px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-emerald-400">+{additionsCount}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">-{deletionsCount}</span>
          </div>

          {/* Side-by-Side vs Unified Toggle */}
          <div className="flex items-center bg-[#0a0d14] p-0.5 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Side-by-Side Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Unified Inline Diff View"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unified</span>
            </button>
          </div>

          {/* Changes Only Filter Toggle */}
          <button
            type="button"
            onClick={() => setFilterMode((prev) => (prev === 'all' ? 'changes-only' : 'all'))}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
              filterMode === 'changes-only'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#0a0d14] text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Toggle between all code lines and modified chunks only"
          >
            {filterMode === 'changes-only' ? 'Diff Only' : 'All Lines'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close Diff Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Identical Notification Banner if no diff */}
      {isIdentical && (
        <div className="p-4 bg-emerald-950/20 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>The code is already fully remediated. No additions or deletions detected.</span>
        </div>
      )}

      {/* Main Diff Code Display Area */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-[220px] max-h-[520px] font-mono text-[11px] sm:text-xs leading-relaxed select-text bg-[#07090f]">
        {viewMode === 'split' ? (
          /* ── Side-by-Side (Split) View ──────────────────────────────────── */
          <div className="min-w-[700px]">
            {/* Split Headers */}
            <div className="grid grid-cols-2 bg-[#12151f] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10">
              <div className="px-4 py-1.5 text-rose-300/90 border-r border-white/10 flex items-center justify-between">
                <span>Vulnerable Original (Before)</span>
                <span className="text-[10px] text-rose-400 font-mono">-{deletionsCount}</span>
              </div>
              <div className="px-4 py-1.5 text-emerald-300/90 flex items-center justify-between">
                <span>AI Remediated Patch (After)</span>
                <span className="text-[10px] text-emerald-400 font-mono">+{additionsCount}</span>
              </div>
            </div>

            {/* Split Code Rows */}
            <div className="divide-y divide-white/[0.04]">
              {displayAlignedRows.map((row, idx) => {
                const isLeftDel = row.left.type === 'deleted';
                const isRightAdd = row.right.type === 'added';

                return (
                  <div key={idx} className="grid grid-cols-2 hover:bg-white/[0.02] transition-colors">
                    {/* Left Cell (Original) */}
                    <div
                      className={`flex items-start border-r border-white/10 px-2 py-0.5 ${
                        isLeftDel
                          ? 'bg-rose-950/30 text-rose-200 border-l-2 border-l-rose-500'
                          : row.left.type === 'empty'
                          ? 'bg-black/30'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-9 shrink-0 text-right pr-3 select-none text-[10px] text-slate-500 font-mono">
                        {row.left.num || ''}
                      </span>
                      <span className="w-4 shrink-0 select-none text-rose-400 font-bold">
                        {isLeftDel ? '-' : ''}
                      </span>
                      <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                        <code>{row.left.text}</code>
                      </pre>
                    </div>

                    {/* Right Cell (Remediated) */}
                    <div
                      className={`flex items-start px-2 py-0.5 ${
                        isRightAdd
                          ? 'bg-emerald-950/30 text-emerald-200 border-l-2 border-l-emerald-500'
                          : row.right.type === 'empty'
                          ? 'bg-black/30'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-9 shrink-0 text-right pr-3 select-none text-[10px] text-slate-500 font-mono">
                        {row.right.num || ''}
                      </span>
                      <span className="w-4 shrink-0 select-none text-emerald-400 font-bold">
                        {isRightAdd ? '+' : ''}
                      </span>
                      <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                        <code>{row.right.text}</code>
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Unified (Inline) View ──────────────────────────────────────── */
          <div className="min-w-[500px] divide-y divide-white/[0.04]">
            {displayUnifiedRows.map((item, idx) => {
              const isAdd = item.type === 'added';
              const isDel = item.type === 'deleted';

              return (
                <div
                  key={idx}
                  className={`flex items-start px-3 py-0.5 ${
                    isAdd
                      ? 'bg-emerald-950/30 text-emerald-200 border-l-2 border-l-emerald-500'
                      : isDel
                      ? 'bg-rose-950/30 text-rose-200 border-l-2 border-l-rose-500'
                      : 'text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="w-9 shrink-0 text-right pr-2 select-none text-[10px] text-slate-500 font-mono">
                    {item.oldNum || ''}
                  </span>
                  <span className="w-9 shrink-0 text-right pr-3 select-none text-[10px] text-slate-500 font-mono">
                    {item.newNum || ''}
                  </span>
                  <span
                    className={`w-4 shrink-0 select-none font-bold ${
                      isAdd ? 'text-emerald-400' : isDel ? 'text-rose-400' : 'text-slate-600'
                    }`}
                  >
                    {isAdd ? '+' : isDel ? '-' : ' '}
                  </span>
                  <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                    <code>{isAdd ? item.newLine : item.oldLine}</code>
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="p-4 bg-[#141722] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>Review proposed modifications before applying to the active editor buffer.</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#202432] hover:bg-[#2b3044] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              Cancel / Reject
            </button>
          )}

          {onApplyFix && (
            <button
              type="button"
              onClick={() => onApplyFix(fixedCode)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer ${
                applied
                  ? 'bg-[#232732] text-emerald-400 border border-emerald-500/40 hover:bg-[#2c3240]'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{applied ? '✓ Re-apply Patch to Editor' : 'Apply Security Patch to Editor'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

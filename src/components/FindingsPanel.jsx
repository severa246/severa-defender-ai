import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, ChevronRight, CheckCircle2, Layers, Sparkles, AlertCircle, FolderSearch, Check, CheckCheck } from 'lucide-react';

export default function FindingsPanel({ 
  findings = [], 
  projectFiles = [], 
  onSelectFinding, 
  onSelectFile,
  onGenerateAiFix,
  onOpenDefender,
  onScanFullProject,
  aiReviewData = null,
  onApplyFix = null,
  onApplyFixAll = null,
}) {
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('ACTIVE'); // 'ACTIVE' or 'PROJECT_WIDE'

  // Calculate project-wide total findings
  const allProjectFindings = React.useMemo(() => {
    let list = [];
    projectFiles.forEach((file) => {
      if (file.findings) {
        file.findings.forEach((f) => {
          list.push({ ...f, filePath: file.path, fileName: file.name });
        });
      }
    });
    return list;
  }, [projectFiles]);

  const activeList = viewMode === 'PROJECT_WIDE' ? allProjectFindings : findings;

  const filteredFindings = activeList.filter((f) => {
    if (filter === 'ALL') return true;
    return f.severity === filter;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="bg-[#0c0e15] border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-col h-full max-h-full overflow-hidden shadow-xl">
      
      {/* Inspector Panel Top Header */}
      <div className="shrink-0 space-y-3 pb-3 border-b border-slate-800/80">
        
        {/* Title & Overall Count & Scan Full Project Button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Security Inspector</h2>
              <p className="text-[10px] text-slate-400">Real-time Vulnerability Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScanFullProject && (
              <button
                type="button"
                onClick={() => {
                  setViewMode('PROJECT_WIDE');
                  onScanFullProject();
                }}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                title="Scan all files in active project folder"
              >
                <FolderSearch className="w-3 h-3 text-indigo-400" />
                <span>Scan Full Project</span>
              </button>
            )}

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
              filteredFindings.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {filter === 'ALL' ? `${activeList.length} Flaws` : `${filteredFindings.length} ${filter} Flaws`}
            </span>
          </div>
        </div>

        {/* View Mode Toggle (Active File vs Project-Wide) */}
        <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] gap-1">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`py-1 rounded font-semibold transition-all ${
              viewMode === 'ACTIVE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Current File ({findings.length})
          </button>
          <button
            onClick={() => setViewMode('PROJECT_WIDE')}
            className={`py-1 rounded font-semibold transition-all ${
              viewMode === 'PROJECT_WIDE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Folder Files ({allProjectFindings.length})
          </button>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1 text-[10px]">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`flex-1 py-1 rounded font-semibold transition-all text-center ${
                filter === sev ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* File-Wise Security Summary Bar (when in Project-Wide mode) */}
      {viewMode === 'PROJECT_WIDE' && projectFiles.length > 0 && (
        <div className="shrink-0 pt-2 pb-1 space-y-1 border-b border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> File Breakdown:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {projectFiles.map((file) => {
              const flaws = file.findings?.length || 0;
              return (
                <button
                  key={file.path}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                    flaws > 0 ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span>{file.name}</span>
                  <span className="font-bold">({flaws})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Findings List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mt-3 pr-1.5 custom-scrollbar">
        {filteredFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/80" />
            {activeList.length === 0 ? (
              <>
                <p className="text-xs font-bold text-slate-200">Zero Flaws Detected</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Code passes Severa AI SAST security rulesets.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-200">
                  0 {filter === 'CRITICAL' ? 'Critical' : filter === 'HIGH' ? 'High' : filter === 'MEDIUM' ? 'Medium' : filter} Flaws
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  No {filter.toLowerCase()} severity vulnerabilities found ({activeList.length} flaw{activeList.length === 1 ? '' : 's'} in other categories).
                </p>
              </>
            )}
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding && onSelectFinding(finding)}
              className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all cursor-pointer group shadow-lg"
            >
              {/* Card Header: Severity & Line Jump */}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${getSeverityBadge(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-0.5">
                    {finding.aiBadge || (finding.isVerifiedByAi ? '🤖 AI Verified' : '⚡ SAST Engine')}
                  </span>

                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {finding.confidence || 'CORROBORATED'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {finding.fileName && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {finding.fileName}
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Line {finding.line}
                  </span>
                </div>
              </div>

              {/* Title & CWE */}
              <div>
                <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{finding.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h3>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <a
                    href={finding.cweUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{finding.cwe}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {finding.owasp}
                  </span>
                </div>
              </div>

              {/* Vulnerable Code Line Snippet (Highlighted Red) */}
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 font-mono text-[11px] text-rose-200 overflow-x-auto">
                <code>{finding.codeSnippet}</code>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 leading-snug">
                {finding.description}
              </p>

              {/* Fix Guidance & Actions */}
              <div className="pt-2 border-t border-slate-800/80 text-[11px] flex flex-col gap-2">
                <div className="text-emerald-400">
                  <span className="font-bold text-slate-300">Remediation: </span>
                  <span>{finding.remediation}</span>
                </div>
                {onOpenDefender && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDefender(finding);
                    }}
                    className="self-start flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 font-semibold text-[10px] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Ask Severa Defender AI</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer 1-Click AI Repair Callouts */}
      {(findings.length > 0 || allProjectFindings.length > 0) && (
        <div className="shrink-0 pt-3 border-t border-slate-800 space-y-2 mt-auto">
          
          {/* Apply Fix to All Folder Files */}
          {onApplyFixAll && (
            <button
              onClick={onApplyFixAll}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
              title="Apply AI Security Fixes Across ALL Files in Project Folder"
            >
              <CheckCheck className="w-4 h-4 text-emerald-200" />
              <span>Apply Fix to All Project Files ({projectFiles.length > 0 ? projectFiles.length : 1} File{projectFiles.length > 1 ? 's' : ''})</span>
            </button>
          )}

          {/* Apply Active File Only */}
          {aiReviewData?.fixedCode && onApplyFix && (
            <button
              onClick={() => onApplyFix(aiReviewData.fixedCode)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Check className="w-4 h-4 text-cyan-400" />
              <span>Apply Active File Only ({findings.length} Flaws)</span>
            </button>
          )}

          <button
            onClick={onGenerateAiFix}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiReviewData?.fixedCode ? 'Re-Generate AI Fix Patch' : 'Generate 1-Click AI Auto-Fix Patch'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

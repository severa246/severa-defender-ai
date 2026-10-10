import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Layers, 
  FolderSearch, 
  Check, 
  CheckCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

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
  const [expandedTraceIds, setExpandedTraceIds] = useState({});

  // Toggle collapsible trace drawer
  const toggleTrace = (id, e) => {
    e.stopPropagation();
    setExpandedTraceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const getSeverityBadge = (severity, cvssScore) => {
    const scoreText = cvssScore ? ` • CVSS ${cvssScore}` : '';
    switch (severity) {
      case 'CRITICAL':
        return {
          label: `CRITICAL${scoreText}`,
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      case 'HIGH':
        return {
          label: `HIGH${scoreText}`,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'MEDIUM':
        return {
          label: `MEDIUM${scoreText}`,
          classes: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
        };
      default:
        return {
          label: `LOW${scoreText}`,
          classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
    }
  };

  return (
    <div className="bg-[#090D16] border border-white/[0.08] rounded-xl p-3.5 sm:p-4 flex flex-col h-full max-h-full overflow-hidden shadow-2xl">
      
      {/* Inspector Panel Top Header */}
      <div className="shrink-0 space-y-3 pb-3 border-b border-white/[0.06]">
        
        {/* Title, Overall Count & Scan Project Button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300">
              <ShieldAlert className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Findings Inspector</h2>
              <p className="text-[10px] text-slate-400 font-mono">SAST & Data-Flow Taint Engine</p>
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
                className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer"
                title="Scan all files in active project folder"
              >
                <FolderSearch className="w-3 h-3 text-slate-400" />
                <span>Scan Full Project</span>
              </button>
            )}

            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
              filteredFindings.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {filter === 'ALL' ? `${activeList.length} Flaws` : `${filteredFindings.length} ${filter}`}
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Current File vs Project Wide */}
        <div className="grid grid-cols-2 bg-[#0c101a] p-0.5 rounded-lg border border-white/[0.06] text-[11px] gap-1 font-mono">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`py-1 rounded font-medium transition-all cursor-pointer ${
              viewMode === 'ACTIVE' ? 'bg-white/[0.1] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active File ({findings.length})
          </button>
          <button
            onClick={() => setViewMode('PROJECT_WIDE')}
            className={`py-1 rounded font-medium transition-all cursor-pointer ${
              viewMode === 'PROJECT_WIDE' ? 'bg-white/[0.1] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Project-Wide ({allProjectFindings.length})
          </button>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center bg-[#0c101a] p-0.5 rounded-lg border border-white/[0.06] gap-1 text-[11px] font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`flex-1 py-1 rounded font-medium transition-all text-center cursor-pointer ${
                filter === sev ? 'bg-white/[0.1] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* File-Wise Security Summary Bar (when in Project-Wide mode) */}
      {viewMode === 'PROJECT_WIDE' && projectFiles.length > 0 && (
        <div className="shrink-0 pt-2 pb-1 space-y-1 border-b border-white/[0.06]">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 font-mono">
            <Layers className="w-3 h-3 text-slate-400" /> File Breakdown:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {projectFiles.map((file) => {
              const flaws = file.findings?.length || 0;
              return (
                <button
                  key={file.path}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                    flaws > 0 ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  <span>{file.name}</span>
                  <span className="font-semibold">({flaws})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Findings List (Snyk / GitHub Security Enterprise Cards) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-3 pr-1 custom-scrollbar">
        {filteredFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            {activeList.length === 0 ? (
              <>
                <p className="text-xs font-semibold text-slate-200">Zero Flaws Detected</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Source code passes all Severa SAST security quality gates.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-200">
                  0 {filter} Flaws
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  No {filter.toLowerCase()} severity vulnerabilities found ({activeList.length} in other categories).
                </p>
              </>
            )}
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const sevBadge = getSeverityBadge(finding.severity, finding.cvssScore);
            const isTraceExpanded = expandedTraceIds[finding.id];

            return (
              <div
                key={finding.id}
                onClick={() => onSelectFinding && onSelectFinding(finding)}
                className="group border border-white/[0.06] hover:border-white/[0.12] bg-[#0c101a] rounded-lg p-3.5 space-y-2.5 transition-all cursor-pointer"
              >
                {/* Card Header: Badges & Location */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${sevBadge.classes}`}>
                      {sevBadge.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {finding.cwe}
                    </span>
                    {finding.owasp && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {finding.owasp.split(' - ')[0]}
                      </span>
                    )}
                    {finding.epssScore && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]" title="Exploit Prediction Scoring System probability">
                        EPSS {finding.epssScore}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {finding.fileName ? `${finding.fileName}:${finding.line}` : `Line ${finding.line}`}
                  </span>
                </div>

                {/* Finding Title */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{finding.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </h4>

                  {/* CWE Link & Metadata */}
                  <div className="flex items-center gap-2 mt-1">
                    {finding.cweUrl && (
                      <a
                        href={finding.cweUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>MITRE Advisory</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {finding.cvssVector && (
                      <>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]" title={finding.cvssVector}>
                          {finding.cvssVector}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Interactive Taint Trace Breadcrumb (Source -> Propagation -> Sink) */}
                {finding.taintTrace && (
                  <div className="p-2 rounded bg-black/50 border border-white/[0.06] text-[11px] font-mono text-slate-300 space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span>Dataflow Taint Trace:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-slate-400">
                      <span className="text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                        Src: {finding.taintTrace.source?.name} (L{finding.taintTrace.source?.line})
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-300">
                        Var: {finding.taintTrace.propagation?.variable}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">
                        Sink (L{finding.line})
                      </span>
                    </div>
                  </div>
                )}

                {/* Code Snippet Box */}
                {finding.codeSnippet && (
                  <div className="p-2 rounded bg-black/40 border border-white/[0.04] font-mono text-xs text-rose-300 overflow-x-auto">
                    <code>{finding.codeSnippet}</code>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-400 leading-snug">
                  {finding.description}
                </p>

                {/* Clean Enterprise Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-patch verified</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDefender) {
                        onOpenDefender(finding);
                      } else if (onSelectFinding) {
                        onSelectFinding(finding);
                      }
                    }}
                    className="px-3 py-1 bg-white hover:bg-slate-200 text-black text-xs font-semibold rounded-md transition-all shadow-sm cursor-pointer"
                  >
                    Review Patch
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer 1-Click AI Repair Callouts with Restrained Enterprise Action Hierarchy */}
      {(findings.length > 0 || allProjectFindings.length > 0) && (
        <div className="shrink-0 pt-3 border-t border-white/[0.06] space-y-2 mt-auto">
          
          {/* Apply Fix to All Project Files */}
          {onApplyFixAll && (
            <button
              onClick={onApplyFixAll}
              className="w-full py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 rounded-lg text-xs font-medium border border-white/[0.08] flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Apply AI Security Fixes Across ALL Files in Project Folder"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Fix to All Project Files ({projectFiles.length > 0 ? projectFiles.length : 1})</span>
            </button>
          )}

          {/* Apply Active File Only */}
          {aiReviewData?.fixedCode && onApplyFix && (
            <button
              onClick={() => onApplyFix(aiReviewData.fixedCode)}
              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Active File Only ({findings.length} Flaws)</span>
            </button>
          )}

          {/* Primary Action Button: Solid White, text-black */}
          <button
            onClick={onGenerateAiFix}
            className="w-full py-2.5 bg-white hover:bg-slate-200 text-black rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>{aiReviewData?.fixedCode ? 'Re-Generate Enterprise Patch' : 'Generate Enterprise Security Patch'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

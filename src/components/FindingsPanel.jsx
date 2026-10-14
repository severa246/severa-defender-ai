import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  FolderSearch, 
  Check, 
  CheckCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Package,
  Key,
  Zap,
  Lock,
  Play
} from 'lucide-react';

export default function FindingsPanel({ 
  findings = [], 
  projectFiles = [], 
  onSelectFinding, 
  onSelectFile,
  onGenerateAiFix,
  onOpenDefender,
  onScanFullProject,
  onAutoBumpDependency,
  onApplySecretFix,
  aiReviewData = null,
  onApplyFix = null,
  onApplyFixAll = null,
}) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'CODE', 'DEPS', 'SECRETS'
  const [viewMode, setViewMode] = useState('PROJECT_WIDE'); // Default to PROJECT_WIDE for unified view
  const [expandedTraceIds, setExpandedTraceIds] = useState({});

  // Toggle collapsible trace drawer
  const toggleTrace = (id, e) => {
    e.stopPropagation();
    setExpandedTraceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate project-wide total findings across all files
  const allProjectFindings = React.useMemo(() => {
    let list = [];
    projectFiles.forEach((file) => {
      if (file.findings) {
        file.findings.forEach((f) => {
          list.push({ ...f, filePath: file.path || file.name, fileName: file.name });
        });
      }
    });
    return list;
  }, [projectFiles]);

  const activeList = viewMode === 'PROJECT_WIDE' ? allProjectFindings : findings;

  // Compute category counts
  const codeCount = activeList.filter((f) => !f.isDependency).length;
  const depCount = activeList.filter((f) => f.isDependency).length;
  const secretCount = activeList.filter((f) => f.isSecret).length;

  const filteredFindings = activeList.filter((f) => {
    // 1. Severity filter
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) {
      return false;
    }
    // 2. Category filter
    if (categoryFilter === 'CODE') {
      return !f.isDependency;
    }
    if (categoryFilter === 'DEPS') {
      return !!f.isDependency;
    }
    if (categoryFilter === 'SECRETS') {
      return !!f.isSecret;
    }
    return true;
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
      <div className="shrink-0 space-y-2.5 pb-3 border-b border-white/[0.06]">
        
        {/* Title, Overall Count & Scan Project Button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Findings Inspector</h2>
              <p className="text-[10px] text-slate-400 font-mono">Unified SAST & Dependency SCA Engine</p>
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
                className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                title="Unified 1-Click Scan: Crawl code and manifests in parallel"
              >
                <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Scan Project</span>
              </button>
            )}

            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
              filteredFindings.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {filteredFindings.length} Flaws
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
              viewMode === 'PROJECT_WIDE' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Project-Wide ({allProjectFindings.length})
          </button>
        </div>

        {/* Category Filter Tabs: ALL, CODE (SAST), DEPENDENCIES (SCA), SECRETS */}
        <div className="grid grid-cols-4 bg-[#0c101a] p-0.5 rounded-lg border border-white/[0.06] gap-1 text-[10px] font-mono text-center">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`py-1 rounded font-medium transition-all cursor-pointer truncate ${
              categoryFilter === 'ALL' ? 'bg-white/[0.1] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="All Security Findings"
          >
            ALL ({activeList.length})
          </button>
          <button
            onClick={() => setCategoryFilter('CODE')}
            className={`py-1 rounded font-medium transition-all cursor-pointer truncate ${
              categoryFilter === 'CODE' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Static Code Analysis Findings (CWE / OWASP)"
          >
            CODE ({codeCount})
          </button>
          <button
            onClick={() => setCategoryFilter('DEPS')}
            className={`py-1 rounded font-medium transition-all cursor-pointer truncate ${
              categoryFilter === 'DEPS' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Software Composition Analysis (Dependency CVEs)"
          >
            DEPS ({depCount})
          </button>
          <button
            onClick={() => setCategoryFilter('SECRETS')}
            className={`py-1 rounded font-medium transition-all cursor-pointer truncate ${
              categoryFilter === 'SECRETS' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Shannon Entropy Hardcoded Secrets"
          >
            SECRETS ({secretCount})
          </button>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center bg-[#0c101a] p-0.5 rounded-lg border border-white/[0.06] gap-1 text-[11px] font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`flex-1 py-0.5 rounded font-medium transition-all text-center cursor-pointer ${
                severityFilter === sev ? 'bg-white/[0.1] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-slate-200'
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
              const isManifest = file.name === 'package.json' || file.name === 'requirements.txt' || file.name === 'go.mod';
              return (
                <button
                  key={file.path || file.name}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                    flaws > 0 
                      ? (isManifest ? 'bg-sky-500/10 text-sky-300 border-sky-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20')
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  {isManifest && <Package className="w-2.5 h-2.5 text-sky-400" />}
                  <span>{file.name}</span>
                  <span className="font-semibold">({flaws})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Findings List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mt-3 pr-1 custom-scrollbar">
        {filteredFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            {activeList.length === 0 ? (
              <>
                <p className="text-xs font-semibold text-slate-200">Zero Flaws Detected</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Source code and project dependencies pass all Severa SAST & SCA security quality gates.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-200">
                  0 Matching Vulnerabilities
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  No flaws matching category "{categoryFilter}" with severity "{severityFilter}". ({activeList.length} total findings across project).
                </p>
              </>
            )}
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const sevBadge = getSeverityBadge(finding.severity, finding.cvssScore);

            return (
              <div
                key={finding.id}
                onClick={() => {
                  if (onSelectFinding) onSelectFinding(finding);
                  if (onSelectFile && finding.fileName) {
                    const matchF = projectFiles.find((pf) => pf.name === finding.fileName);
                    if (matchF) onSelectFile(matchF);
                  }
                }}
                className={`group border rounded-lg p-3.5 space-y-2.5 transition-all cursor-pointer ${
                  finding.isDependency 
                    ? 'border-sky-500/20 hover:border-sky-500/40 bg-[#0a121e]' 
                    : finding.isSecret
                    ? 'border-emerald-500/20 hover:border-emerald-500/40 bg-[#0a1715]'
                    : 'border-white/[0.06] hover:border-white/[0.12] bg-[#0c101a]'
                }`}
              >
                {/* Card Header: Badges & Location */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04] flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${sevBadge.classes}`}>
                      {sevBadge.label}
                    </span>
                    
                    {/* Category Identifier Tag */}
                    {finding.isDependency ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                        <Package className="w-2.5 h-2.5" />
                        <span>SCA Dependency</span>
                      </span>
                    ) : finding.isSecret ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Key className="w-2.5 h-2.5" />
                        <span>Shannon Secret</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        {finding.cwe}
                      </span>
                    )}

                    {finding.owasp && !finding.isDependency && (
                      <span className="text-[10px] font-mono text-slate-500">
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

                  {/* Advisory Link */}
                  <div className="flex items-center gap-2 mt-1">
                    {finding.cweUrl && (
                      <a
                        href={finding.cweUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{finding.isDependency ? 'NVD Advisory' : 'MITRE Advisory'}</span>
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

                {/* DEPENDENCY CVE (SCA) SPECIALIZED CARD SECTION */}
                {finding.isDependency && (
                  <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 text-sky-400 font-mono font-semibold">
                        <Package className="w-3.5 h-3.5" />
                        <span>{finding.packageName}</span>
                        <span className="text-slate-400">({finding.currentVersion})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span>Fixed in:</span>
                        <span className="font-bold">{finding.fixedIn || 'Latest Patch'}</span>
                      </div>
                    </div>

                    {/* 1-Click Auto-Bump Action Button */}
                    {onAutoBumpDependency && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAutoBumpDependency(finding.packageName, finding.fixedIn, finding.manifestFile);
                        }}
                        className="w-full mt-1 py-1.5 px-3 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-white border border-sky-500/30 hover:border-sky-500/60 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title={`Automatically upgrade ${finding.packageName} to ${finding.fixedIn} in ${finding.manifestFile || 'manifest'}`}
                      >
                        <Zap className="w-3.5 h-3.5 text-sky-400" />
                        <span>1-Click Auto-Bump to {finding.fixedIn || 'Latest Patch'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* SHANNON ENTROPY SECRET DETECTION SPECIALIZED CARD SECTION */}
                {finding.isSecret && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                        <Key className="w-3.5 h-3.5" />
                        <span>{finding.secretType || 'Cryptographic Secret'}</span>
                      </div>
                      {finding.entropyScore && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Shannon Entropy: <strong>{finding.entropyScore} bits</strong></span>
                        </div>
                      )}
                    </div>

                    {finding.maskedToken && (
                      <div className="flex items-center justify-between bg-black/60 px-2 py-1 rounded border border-white/5 font-mono text-[11px]">
                        <span className="text-slate-400">Masked Token:</span>
                        <code className="text-emerald-300 tracking-wider">{finding.maskedToken}</code>
                      </div>
                    )}

                    {finding.suggestedFix && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Environment Variable Advisory:</span>
                          <span className="text-emerald-400 font-semibold">{finding.suggestedFix.suggestedCode}</span>
                        </div>
                        {onApplySecretFix && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplySecretFix(finding);
                            }}
                            className="w-full py-1.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500/60 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            title="Migrate hardcoded secret to environment variable call"
                          >
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>1-Click Migrate to Env Variable</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

                {/* Explain with AI Action */}
                <div className="flex items-center justify-end pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDefender) {
                        onOpenDefender(finding);
                      } else if (onSelectFinding) {
                        onSelectFinding(finding);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#191C23] hover:bg-[#232732] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                    title="Explain this vulnerability with Severa Defender AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Explain with AI</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer 1-Click AI Repair Callouts */}
      {(findings.length > 0 || allProjectFindings.length > 0) && (
        <div className="shrink-0 pt-3 border-t border-white/[0.06] space-y-2 mt-auto">
          
          {/* Apply Fix to Current Project Folder */}
          {onApplyFixAll && (
            <button
              onClick={onApplyFixAll}
              className="w-full py-2 bg-[#191C23] hover:bg-[#232732] text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-white/10 hover:border-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Apply AI Security Fixes Across ALL Files in Current Project Folder"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Fix to Current Project Folder ({projectFiles.length > 0 ? projectFiles.length : 1} files)</span>
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

          {/* Primary Action Button: Re-Generate */}
          <button
            onClick={onGenerateAiFix}
            className="w-full py-2.5 bg-white hover:bg-slate-200 text-black rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>{aiReviewData?.fixedCode ? 'Re-Generate' : 'Generate Enterprise Security Patch'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

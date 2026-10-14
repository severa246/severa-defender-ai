import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
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
  Play,
  AlertTriangle,
  Info,
  FileCode
} from 'lucide-react';
import { EpssTooltip, CvssVectorTooltip, CweTooltip } from './EducationalTooltips';

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
  const [expandedFindingId, setExpandedFindingId] = useState(null);

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
      
      {/* Clean Modern Header */}
      <div className="shrink-0 space-y-2.5 pb-3 border-b border-white/10">
        
        {/* Top Title & Scan Trigger */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Findings</h2>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                  filteredFindings.length > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {filteredFindings.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">Unified SAST & SCA</p>
            </div>
          </div>

          {onScanFullProject && (
            <button
              type="button"
              onClick={() => {
                setViewMode('PROJECT_WIDE');
                onScanFullProject();
              }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
              title="Run security scan across active files"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Scan</span>
            </button>
          )}
        </div>

        {/* Primary Scope Toggle: Active File vs Project Wide */}
        <div className="grid grid-cols-2 p-0.5 bg-[#121624] rounded-lg border border-white/10 text-xs font-mono">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`py-1.5 px-1 rounded-md font-semibold transition-all cursor-pointer text-center truncate ${
              viewMode === 'ACTIVE' 
                ? 'bg-white/15 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({findings.length})
          </button>
          <button
            onClick={() => setViewMode('PROJECT_WIDE')}
            className={`py-1.5 px-1 rounded-md font-semibold transition-all cursor-pointer text-center truncate ${
              viewMode === 'PROJECT_WIDE' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Project ({allProjectFindings.length})
          </button>
        </div>

        {/* Filters Group */}
        <div className="space-y-2 pt-0.5">
          {/* Row 1: Category Filter Buttons */}
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono block">Category</span>
            <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'CODE', label: 'Code' },
                { id: 'DEPS', label: 'Deps' },
                { id: 'SECRETS', label: 'Secret' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`py-1 rounded text-center transition-all cursor-pointer truncate ${
                    categoryFilter === cat.id
                      ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/50 shadow-sm'
                      : 'bg-[#121624] text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Severity Filter Buttons (All, Critical, High, Med, Low) */}
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono block">Severity</span>
            <div className="grid grid-cols-5 gap-1 font-mono text-[11px]">
              {[
                { id: 'ALL', label: 'All', badgeClass: 'bg-white/20 text-white border-white/30' },
                { id: 'CRITICAL', label: 'Crit', badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/50' },
                { id: 'HIGH', label: 'High', badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-500/50' },
                { id: 'MEDIUM', label: 'Med', badgeClass: 'bg-yellow-500/25 text-yellow-300 border-yellow-500/50' },
                { id: 'LOW', label: 'Low', badgeClass: 'bg-slate-500/25 text-slate-300 border-slate-500/50' }
              ].map((sev) => (
                <button
                  key={sev.id}
                  onClick={() => setSeverityFilter(sev.id)}
                  className={`py-1 rounded text-center font-semibold transition-all cursor-pointer truncate ${
                    severityFilter === sev.id
                      ? `${sev.badgeClass} border shadow-sm`
                      : 'bg-[#121624] text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* File Location Bar (when in Project-Wide mode) */}
      {viewMode === 'PROJECT_WIDE' && projectFiles.length > 0 && (
        <div className="shrink-0 py-2 border-b border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Files:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar min-w-0">
            {projectFiles.map((file) => {
              const flaws = file.findings?.length || 0;
              return (
                <button
                  key={file.path || file.name}
                  onClick={() => onSelectFile && onSelectFile(file)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border whitespace-nowrap transition-all cursor-pointer ${
                    flaws > 0 
                      ? 'bg-rose-500/15 text-rose-200 border-rose-500/30 hover:bg-rose-500/25' 
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {file.name} ({flaws})
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
            const isExpanded = expandedFindingId === finding.id;
            const matchFile = projectFiles.find((pf) => pf.name === finding.fileName);

            return (
              <div
                key={finding.id}
                onClick={() => {
                  setExpandedFindingId(prev => prev === finding.id ? null : finding.id);
                  if (onSelectFinding) onSelectFinding(finding);
                }}
                className={`group border rounded-xl p-4 space-y-3 transition-all cursor-pointer ${
                  isExpanded
                    ? 'border-emerald-500/50 bg-[#111728] shadow-lg ring-1 ring-emerald-500/20'
                    : finding.isDependency 
                    ? 'border-sky-500/30 hover:border-sky-500/60 bg-[#0e1422] shadow-sm' 
                    : finding.isSecret
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 bg-[#0c1817] shadow-sm'
                    : 'border-white/10 hover:border-white/20 bg-[#101422] hover:bg-[#13182a] shadow-sm'
                }`}
              >
                {/* Clean Top Meta Row: Severity Pill, CWE, File & Line */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${sevBadge.classes}`}>
                      {sevBadge.label}
                    </span>
                    
                    {/* Category / Rule Badge */}
                    {finding.isDependency ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1 shrink-0">
                        <Package className="w-3 h-3" />
                        <span>SCA</span>
                      </span>
                    ) : finding.isSecret ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <Key className="w-3 h-3" />
                        <span>Secret</span>
                      </span>
                    ) : (
                      <CweTooltip cwe={finding.cwe || 'SAST'} cweUrl={finding.cweUrl} />
                    )}

                    {finding.epssScore && (
                      <EpssTooltip score={finding.epssScore} percentile={finding.epssPercentile} />
                    )}
                  </div>

                  {/* Clean Location Indicator */}
                  <span className="text-[11px] font-mono font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 shrink-0 ml-auto">
                    {finding.fileName ? `${finding.fileName}:${finding.line}` : `Line ${finding.line}`}
                  </span>
                </div>

                {/* Finding Title & Link */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {finding.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-emerald-400 mt-0.5 transition-colors">
                      <span className="text-[10px] font-mono font-medium hidden sm:inline text-slate-400">
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {finding.cweUrl && (
                    <div>
                      <a
                        href={finding.cweUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold underline decoration-emerald-500/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{finding.isDependency ? 'NVD Security Advisory' : 'MITRE CWE Advisory'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Description preview in collapsed mode */}
                {!isExpanded && (
                  <p className="text-xs text-slate-300/90 leading-relaxed font-normal line-clamp-2">
                    {finding.description}
                  </p>
                )}

                {/* IN-DEPTH DETAILED VULNERABILITY DRAWER WHEN EXPANDED */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                    {/* Security Ratings & Standard Classification Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-black/40 rounded-lg p-2.5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-sans">OWASP Standard</span>
                        <span className="font-semibold text-emerald-300 text-[11px] truncate block" title={finding.owasp || 'A03:2021 - Injection'}>
                          {finding.owasp || (finding.isSecret ? 'A02:2021 - Cryptographic' : finding.isDependency ? 'A06:2021 - Vulnerable Components' : 'A03:2021 - Injection')}
                        </span>
                      </div>

                      <CvssVectorTooltip
                        score={finding.cvssScore ? String(finding.cvssScore) : (finding.severity === 'CRITICAL' ? '9.8' : finding.severity === 'HIGH' ? '7.5' : '5.3')}
                        vector={finding.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'}
                        severity={finding.severity}
                        className="w-full"
                      >
                        <div className="bg-black/40 hover:bg-black/60 rounded-lg p-2.5 border border-white/10 hover:border-emerald-500/40 transition-colors w-full h-full text-left">
                          <span className="text-[10px] text-slate-400 block font-sans flex items-center justify-between">
                            <span>CVSS v3.1 Score</span>
                            <span className="text-[9px] text-emerald-400 font-mono">Hover Guide</span>
                          </span>
                          <span className="font-bold text-amber-300 text-[11px] block">
                            {finding.cvssScore ? `${finding.cvssScore} / 10.0` : (finding.severity === 'CRITICAL' ? '9.8 / 10.0' : finding.severity === 'HIGH' ? '7.5 / 10.0' : '5.3 / 10.0')}
                          </span>
                        </div>
                      </CvssVectorTooltip>

                      <EpssTooltip
                        score={finding.epssScore || (finding.severity === 'CRITICAL' ? '94.2%' : '42.1%')}
                        percentile={finding.epssPercentile || (finding.severity === 'CRITICAL' ? '98th' : '79th')}
                        className="col-span-2 sm:col-span-1 w-full"
                      >
                        <div className="bg-black/40 hover:bg-black/60 rounded-lg p-2.5 border border-white/10 hover:border-amber-500/40 transition-colors w-full h-full text-left">
                          <span className="text-[10px] text-slate-400 block font-sans flex items-center justify-between">
                            <span>EPSS Exploitation</span>
                            <span className="text-[9px] text-amber-400 font-mono">Hover Guide</span>
                          </span>
                          <span className="font-semibold text-slate-200 text-[11px] block">
                            {finding.epssScore ? `Score: ${finding.epssScore}` : '0.04% (Low in wild)'}
                          </span>
                        </div>
                      </EpssTooltip>
                    </div>

                    {/* CVSS Vector Breakdown Bar with Educational Explanations */}
                    <CvssVectorTooltip
                      score={finding.cvssScore ? String(finding.cvssScore) : (finding.severity === 'CRITICAL' ? '9.8' : finding.severity === 'HIGH' ? '7.5' : '5.3')}
                      vector={finding.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'}
                      severity={finding.severity}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between bg-black/60 hover:bg-black/80 px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-all font-mono text-[11px] cursor-help">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-[10px] font-sans font-semibold uppercase text-slate-400">CVSS Vector:</span>
                          <code className="text-emerald-300 font-bold">{finding.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'}</code>
                        </div>
                        <span className="text-[10px] text-emerald-400 underline decoration-emerald-500/40 font-sans hidden sm:inline">
                          View Metric Guide &amp; Breakdown
                        </span>
                      </div>
                    </CvssVectorTooltip>

                    {/* Root Cause Analysis & Description */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Root Cause & Vulnerability Mechanism</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {finding.description}
                      </p>
                    </div>

                    {/* Threat Impact Analysis */}
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Security Risk & Attack Impact</span>
                      </div>
                      <p className="text-xs text-rose-200/90 leading-relaxed font-normal">
                        {finding.impact || (finding.isSecret ? 'Hardcoded token or credentials exposed in source tree allow attackers to gain authenticated API access and pivot into internal infrastructure.' : finding.isDependency ? 'Publicly disclosed vulnerability in third-party library enables remote attackers to execute arbitrary code or trigger denial of service.' : 'Unsanitized input allows malicious actors to manipulate execution flow, extract sensitive records, or bypass access controls.')}
                      </p>
                    </div>

                    {/* Remediation & Guidance */}
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Remediation Guidance</span>
                      </div>
                      <p className="text-xs text-emerald-200/90 leading-relaxed font-normal">
                        {finding.remediation || (finding.isSecret ? 'Extract token to environment variables (e.g. process.env) or an enterprise secrets vault, and invalidate existing leaked credentials.' : finding.isDependency ? `Upgrade ${finding.packageName || 'dependency'} to version ${finding.fixedIn || 'latest secure release'} in package manifest.` : 'Enforce strict input validation, utilize parameterized queries or prepared statements, and validate data at all trust boundaries.')}
                      </p>
                    </div>

                    {/* DEPENDENCY CVE (SCA) SPECIALIZED CARD SECTION */}
                    {finding.isDependency && (
                      <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 text-sky-300 font-mono font-bold">
                            <Package className="w-4 h-4 text-sky-400" />
                            <span>{finding.packageName}</span>
                            <span className="text-slate-400">({finding.currentVersion})</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                            <span>Fixed in:</span>
                            <span>{finding.fixedIn || 'Latest Patch'}</span>
                          </div>
                        </div>

                        {/* 1-Click Auto-Bump Action Button */}
                        {onAutoBumpDependency && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAutoBumpDependency(finding.packageName, finding.fixedIn, finding.manifestFile);
                            }}
                            className="w-full mt-1 py-1.5 px-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 hover:text-white border border-sky-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                            <Key className="w-4 h-4 text-emerald-400" />
                            <span>{finding.secretType || 'Cryptographic Secret'}</span>
                          </div>
                          {finding.entropyScore && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Shannon Entropy: {finding.entropyScore} bits</span>
                            </div>
                          )}
                        </div>

                        {finding.maskedToken && (
                          <div className="flex items-center justify-between bg-black/60 px-2.5 py-1.5 rounded border border-white/10 font-mono text-xs">
                            <span className="text-slate-400">Masked Token:</span>
                            <code className="text-emerald-300 font-bold tracking-wider">{finding.maskedToken}</code>
                          </div>
                        )}

                        {finding.suggestedFix && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                              <span>Env Variable Advisory:</span>
                              <span className="text-emerald-400 font-bold">{finding.suggestedFix.suggestedCode}</span>
                            </div>
                            {onApplySecretFix && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApplySecretFix(finding);
                                }}
                                className="w-full py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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

                    {/* Interactive Taint Trace Breadcrumb */}
                    {finding.taintTrace && (
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-slate-300 space-y-1.5">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>Dataflow Taint Trace:</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-slate-300">
                          <span className="text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">
                            Src: {finding.taintTrace.source?.name} (L{finding.taintTrace.source?.line})
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-200 font-semibold">
                            Var: {finding.taintTrace.propagation?.variable}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30 font-semibold">
                            Sink (L{finding.line})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Clean Offending Code Box */}
                    {finding.codeSnippet && (
                      <div className="p-3 rounded-lg bg-[#07090e] border border-rose-500/20 font-mono text-xs text-rose-200 overflow-x-auto shadow-inner leading-relaxed">
                        <div className="flex items-center justify-between text-[10px] font-mono text-rose-400/80 uppercase font-semibold mb-1">
                          <span>Offending Code:</span>
                          <span>Line {finding.line}</span>
                        </div>
                        <code>{finding.codeSnippet}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Bottom Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2 flex-wrap">
                  {matchFile && onSelectFile ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(matchFile);
                        if (onSelectFinding) onSelectFinding(finding);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-slate-200 text-[11px] font-mono hover:bg-white/5 rounded-md transition-all cursor-pointer"
                      title={`Open ${finding.fileName} at line ${finding.line} in code editor`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>Jump to Editor</span>
                    </button>
                  ) : <div />}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDefender) {
                        onOpenDefender(finding);
                      } else if (onSelectFinding) {
                        onSelectFinding(finding);
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer ml-auto"
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
        <div className="shrink-0 pt-3 border-t border-white/10 space-y-2 mt-auto">
          
          {/* Apply Fix to Current Project Folder */}
          {onApplyFixAll && (
            <button
              onClick={onApplyFixAll}
              className="w-full py-2.5 px-3 bg-[#141824] hover:bg-[#1a2133] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md leading-snug text-center"
              title="Apply AI Security Fixes Across ALL Files in Current Project Folder"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Apply Fix to All Project Files ({projectFiles.length > 0 ? projectFiles.length : 1})</span>
            </button>
          )}

          {/* Apply Active File Only */}
          {aiReviewData?.fixedCode && onApplyFix && (
            <button
              onClick={() => onApplyFix(aiReviewData.fixedCode)}
              className="w-full py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm leading-snug text-center"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Apply Active File Only ({findings.length})</span>
            </button>
          )}

          {/* Primary Action Button: Re-Generate */}
          <button
            onClick={onGenerateAiFix}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{aiReviewData?.fixedCode ? 'Re-Generate' : 'Generate Enterprise Security Patch'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

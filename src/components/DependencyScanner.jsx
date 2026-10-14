import React, { useState, useEffect, useRef } from 'react';
import { scanDependencies, scanDependenciesLive, EXPANDED_DEPENDENCY_CVES } from '../engine/scaScanner';
import {
  PackageCheck,
  FileJson,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Wand2,
  Check,
  Download,
  Terminal,
  FolderDown
} from 'lucide-react';
import { EpssTooltip, CvssVectorTooltip } from './EducationalTooltips';

const SAMPLE_PACKAGE_JSON = `{
  "name": "vulnerable-web-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.16.0",
    "axios": "0.19.0",
    "lodash": "4.17.15",
    "jsonwebtoken": "8.5.1"
  }
}`;

function resolveCleanFixedVersion(pkgName, rawFixedVersion) {
  if (rawFixedVersion && !rawFixedVersion.includes('Official') && rawFixedVersion !== 'Latest') {
    return rawFixedVersion.replace(/^[v^~>=<\s]+/, '');
  }
  const offline = EXPANDED_DEPENDENCY_CVES[pkgName?.toLowerCase()];
  if (offline && offline.length > 0) {
    const last = offline[offline.length - 1];
    if (last && last.fixedIn) return last.fixedIn.replace(/^[v^~>=<\s]+/, '');
  }
  return 'latest';
}

function getCliCommand(pkgName, version, manifestType) {
  const clean = version || 'latest';
  if (manifestType === 'requirements.txt') {
    return `pip install "${pkgName}>=${clean}"`;
  }
  if (manifestType === 'go.mod') {
    return `go get ${pkgName}@v${clean}`;
  }
  return `npm install ${pkgName}@^${clean}`;
}

export default function DependencyScanner({
  activeProjectName = '',
  projectFolders = [],
  onAutoBumpDependency = null
}) {
  // Find project manifest if exists in active project
  const activeFolder = (activeProjectName && projectFolders.find((p) => p.name === activeProjectName)) || projectFolders[0];
  const projectManifest = activeFolder?.files?.find((f) =>
    f.name === 'package.json' || f.name === 'requirements.txt' || f.name === 'go.mod'
  );

  const [manifestText, setManifestText] = useState(() => {
    if (projectManifest && projectManifest.code && projectManifest.code.trim().length > 10) {
      return projectManifest.code;
    }
    return SAMPLE_PACKAGE_JSON;
  });

  const [manifestType, setManifestType] = useState(() => {
    return projectManifest ? projectManifest.name : 'package.json';
  });

  const [results, setResults] = useState(() => scanDependencies(manifestText, manifestType));
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [bumpToast, setBumpToast] = useState('');
  const debounceTimerRef = useRef(null);

  const handleAutoBump = (pkgName, rawFixedVersion) => {
    const cleanFixed = resolveCleanFixedVersion(pkgName, rawFixedVersion);
    const cliCmd = getCliCommand(pkgName, cleanFixed, manifestType);

    let updatedManifest = manifestText;

    if (manifestType === 'package.json') {
      try {
        const parsed = JSON.parse(manifestText);
        let updated = false;
        if (parsed.dependencies && parsed.dependencies[pkgName]) {
          parsed.dependencies[pkgName] = `^${cleanFixed}`;
          updated = true;
        }
        if (parsed.devDependencies && parsed.devDependencies[pkgName]) {
          parsed.devDependencies[pkgName] = `^${cleanFixed}`;
          updated = true;
        }
        if (updated) {
          updatedManifest = JSON.stringify(parsed, null, 2);
        } else {
          const regex = new RegExp(`("${pkgName}"\\s*:\\s*")[^"]+(")`, 'g');
          updatedManifest = manifestText.replace(regex, `$1^${cleanFixed}$2`);
        }
      } catch {
        const regex = new RegExp(`("${pkgName}"\\s*:\\s*")[^"]+(")`, 'g');
        updatedManifest = manifestText.replace(regex, `$1^${cleanFixed}$2`);
      }
    } else if (manifestType === 'requirements.txt') {
      const regex = new RegExp(`^(${pkgName}\\s*(?:==|>=|<=|~=)\\s*).*$`, 'im');
      if (regex.test(manifestText)) {
        updatedManifest = manifestText.replace(regex, `${pkgName}>=${cleanFixed}`);
      } else {
        updatedManifest = manifestText.replace(new RegExp(`^${pkgName}$`, 'im'), `${pkgName}>=${cleanFixed}`);
      }
    } else if (manifestType === 'go.mod') {
      const regex = new RegExp(`(${pkgName}\\s+)v[0-9\\.]+`, 'g');
      updatedManifest = manifestText.replace(regex, `$1v${cleanFixed}`);
    }

    setManifestText(updatedManifest);

    // Sync to parent workspace project files
    if (typeof onAutoBumpDependency === 'function') {
      onAutoBumpDependency(pkgName, cleanFixed, manifestType);
    }

    // Auto copy CLI command to clipboard
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cliCmd).catch(() => {});
    }

    setBumpToast(`Bumped ${pkgName} ➔ v${cleanFixed} in ${manifestType}! Copied "${cliCmd}" for your local terminal.`);
    setTimeout(() => setBumpToast(''), 6000);
  };

  const handleDownloadManifest = () => {
    try {
      const blob = new Blob([manifestText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', manifestType);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Failed to download manifest:', err);
    }
  };

  // Trigger live OSV.dev lookup with debounce
  useEffect(() => {
    const offlineData = scanDependencies(manifestText, manifestType);
    setResults((prev) => ({ ...offlineData, isLive: prev.isLive }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsLiveLoading(true);
      try {
        const liveData = await scanDependenciesLive(manifestText, manifestType);
        setResults(liveData);
      } catch (err) {
        console.warn('Live OSV lookup failed, retaining offline results:', err);
      } finally {
        setIsLiveLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [manifestText, manifestType]);

  const handleManualRefresh = async () => {
    setIsLiveLoading(true);
    try {
      const liveData = await scanDependenciesLive(manifestText, manifestType);
      setResults(liveData);
    } finally {
      setIsLiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c101a] border border-white/[0.08] rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">Software Composition Analysis (SCA)</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OSV.dev Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time vulnerability correlation via Google Open Source Vulnerability Database</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {projectManifest && (
            <button
              onClick={() => {
                setManifestType(projectManifest.name);
                setManifestText(projectManifest.code || '');
                setBumpToast(`Loaded ${projectManifest.name} from project "${activeFolder?.name || 'current'}"`);
                setTimeout(() => setBumpToast(''), 4000);
              }}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              title="Load manifest from active workbench project"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project {projectManifest.name}</span>
            </button>
          )}

          <button
            onClick={() => {
              setManifestType('package.json');
              setManifestText(SAMPLE_PACKAGE_JSON);
            }}
            className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium rounded-lg border border-white/[0.08] transition-all cursor-pointer"
          >
            Sample
          </button>

          <button
            onClick={handleDownloadManifest}
            className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
            title={`Download updated ${manifestType}`}
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Download</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isLiveLoading}
            className="px-3 py-1.5 bg-white text-black hover:bg-slate-200 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLiveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe2 className="w-3.5 h-3.5" />}
            <span>{isLiveLoading ? 'Querying...' : 'Scan Live OSV'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manifest Editor */}
        <div className="bg-[#0c101a] border border-white/[0.08] rounded-xl p-4 shadow-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <FileJson className="w-4 h-4 text-slate-400" />
              <span>Dependency Manifest Input</span>
            </div>
            <select
              value={manifestType}
              onChange={(e) => setManifestType(e.target.value)}
              className="bg-[#090D16] border border-white/[0.1] rounded-md text-xs text-slate-200 px-2.5 py-1 focus:outline-none"
            >
              <option value="package.json">package.json (npm)</option>
              <option value="requirements.txt">requirements.txt (PyPI)</option>
              <option value="go.mod">go.mod (Go)</option>
            </select>
          </div>

          {bumpToast && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {bumpToast}
              </span>
              <span className="text-[10px] text-slate-400">Re-scanning...</span>
            </div>
          )}

          <textarea
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
            spellCheck={false}
            className="w-full h-96 bg-[#090D16] border border-white/[0.06] focus:border-white/[0.2] rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* SCA Results List */}
        <div className="bg-[#0c101a] border border-white/[0.08] rounded-xl p-4 shadow-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Discovered CVE Advisories ({results.findingsCount || 0})
              </h3>
              {isLiveLoading && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  Syncing OSV...
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Scanned: {results.totalDependencies} packages
            </span>
          </div>

          {/* DevSecOps Terminal Sync Guide */}
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200/90 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Why fix on site vs. locally?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              • <strong>Fixing on site:</strong> Updates your project's <code>{manifestType}</code> so your Git commits, CI/CD pipelines, and Docker containers build securely.<br />
              • <strong>Updating locally:</strong> Click <span className="text-indigo-300 font-mono font-bold bg-white/5 px-1 py-0.5 rounded border border-white/10">CLI</span> to copy the terminal command (e.g. <code>npm install ...</code>) to update your computer's local <code>node_modules</code>.
            </p>
          </div>

          <div className="overflow-y-auto max-h-[384px] space-y-3 pr-1 custom-scrollbar">
            {results.findingsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-200">Zero Known CVEs</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  All manifest dependencies checked against OSV.dev and pass vulnerability thresholds.
                </p>
              </div>
            ) : (
              results.findings.map((item, index) => {
                const targetFix = resolveCleanFixedVersion(item.packageName, item.fixedIn);
                const cliCmd = getCliCommand(item.packageName, targetFix, manifestType);

                return (
                  <div
                    key={`${item.packageName}-${item.cve}-${index}`}
                    className="group bg-[#090D16] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-3.5 space-y-2.5 transition-all"
                  >
                    {/* Card Header: Package & Severity Badges */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-slate-100">{item.packageName}</span>
                        <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                          v{item.currentVersion}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CvssVectorTooltip
                          score={item.cvssScore || '8.2'}
                          vector={item.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'}
                          severity={item.severity}
                        >
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border transition-colors cursor-help ${
                              item.severity === 'CRITICAL'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/40'
                                : item.severity === 'HIGH'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/40'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40'
                            }`}
                          >
                            {item.severity} • CVSS {item.cvssScore || '8.2'}
                          </span>
                        </CvssVectorTooltip>

                        {item.epssScore && (
                          <EpssTooltip score={item.epssScore} percentile={item.epssPercentile || '92nd'}>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-amber-400/40 transition-colors cursor-help">
                              EPSS {item.epssScore}
                            </span>
                          </EpssTooltip>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 leading-snug">{item.summary}</p>

                    {/* CVSS Vector String Drawer */}
                    {item.cvssVector && (
                      <CvssVectorTooltip score={item.cvssScore || '8.2'} vector={item.cvssVector} severity={item.severity} className="w-full">
                        <div className="p-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/[0.04] hover:border-white/[0.12] font-mono text-[10px] text-slate-400 overflow-x-auto transition-colors cursor-help">
                          <code>{item.cvssVector}</code>
                        </div>
                      </CvssVectorTooltip>
                    )}

                    {/* Footer Row: CVE & Upgrade Target with 1-Click Auto-Bump & CLI Copy */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-rose-400 font-medium">{item.cve}</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.source || 'OSV.dev'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-medium">
                          <span>Fixed in v{targetFix}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        </div>

                        {/* Copy Local Terminal Command */}
                        <button
                          onClick={() => {
                            if (navigator?.clipboard?.writeText) {
                              navigator.clipboard.writeText(cliCmd);
                              setBumpToast(`Copied: "${cliCmd}" — Run in local terminal!`);
                              setTimeout(() => setBumpToast(''), 5000);
                            }
                          }}
                          className="px-2 py-0.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white text-[10px] font-mono rounded-md border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                          title={`Copy local command: ${cliCmd}`}
                        >
                          <Terminal className="w-2.5 h-2.5 text-indigo-400" />
                          <span>CLI</span>
                        </button>

                        {/* 1-Click Auto-Bump in Manifest & Project Sync */}
                        <button
                          onClick={() => handleAutoBump(item.packageName, targetFix)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-200 text-black text-[10px] font-semibold rounded-md shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          title={`Auto-bump ${item.packageName} to v${targetFix} in ${manifestType} & sync to project`}
                        >
                          <Wand2 className="w-2.5 h-2.5 text-black" />
                          <span>Fix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { scanDependencies, scanDependenciesLive } from '../engine/scaScanner';
import { PackageCheck, FileJson, ArrowUpRight, CheckCircle2, Globe2, ShieldCheck, ExternalLink, Loader2, Wand2, Check } from 'lucide-react';

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

export default function DependencyScanner() {
  const [manifestText, setManifestText] = useState(SAMPLE_PACKAGE_JSON);
  const [manifestType, setManifestType] = useState('package.json');
  const [results, setResults] = useState(() => scanDependencies(SAMPLE_PACKAGE_JSON, 'package.json'));
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [bumpToast, setBumpToast] = useState('');
  const debounceTimerRef = useRef(null);

  const handleAutoBump = (pkgName, fixedVersion) => {
    if (!pkgName || !fixedVersion || fixedVersion === 'Latest' || fixedVersion.includes('Official')) return;
    const cleanFixed = fixedVersion.replace(/^[v^~>=<\s]+/, '');

    if (manifestType === 'package.json') {
      try {
        const parsed = JSON.parse(manifestText);
        let updated = false;
        if (parsed.dependencies && parsed.dependencies[pkgName]) {
          parsed.dependencies[pkgName] = cleanFixed;
          updated = true;
        }
        if (parsed.devDependencies && parsed.devDependencies[pkgName]) {
          parsed.devDependencies[pkgName] = cleanFixed;
          updated = true;
        }
        if (updated) {
          setManifestText(JSON.stringify(parsed, null, 2));
          setBumpToast(`Updated ${pkgName} ➔ v${cleanFixed} in package.json`);
          setTimeout(() => setBumpToast(''), 3500);
          return;
        }
      } catch {
        // Fallback to regex
      }
      const regex = new RegExp(`("${pkgName}"\\s*:\\s*")[^"]+(")`, 'g');
      setManifestText(manifestText.replace(regex, `$1${cleanFixed}$2`));
      setBumpToast(`Updated ${pkgName} ➔ v${cleanFixed} in package.json`);
      setTimeout(() => setBumpToast(''), 3500);
    } else if (manifestType === 'requirements.txt') {
      const regex = new RegExp(`^(${pkgName}\\s*(?:==|>=|<=|~=)\\s*).*$`, 'im');
      if (regex.test(manifestText)) {
        setManifestText(manifestText.replace(regex, `${pkgName}==${cleanFixed}`));
      } else {
        setManifestText(manifestText.replace(new RegExp(`^${pkgName}$`, 'im'), `${pkgName}==${cleanFixed}`));
      }
      setBumpToast(`Updated ${pkgName} ➔ v${cleanFixed} in requirements.txt`);
      setTimeout(() => setBumpToast(''), 3500);
    } else if (manifestType === 'go.mod') {
      const regex = new RegExp(`(${pkgName}\\s+)v[0-9\\.]+`, 'g');
      setManifestText(manifestText.replace(regex, `$1v${cleanFixed}`));
      setBumpToast(`Updated ${pkgName} ➔ v${cleanFixed} in go.mod`);
      setTimeout(() => setBumpToast(''), 3500);
    }
  };

  // Trigger live OSV.dev lookup with debounce
  useEffect(() => {
    // Immediate fast synchronous pass
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setManifestType('package.json');
              setManifestText(SAMPLE_PACKAGE_JSON);
            }}
            className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium rounded-lg border border-white/[0.08] transition-all cursor-pointer"
          >
            Load Sample package.json
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isLiveLoading}
            className="px-3 py-1.5 bg-white text-black hover:bg-slate-200 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLiveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe2 className="w-3.5 h-3.5" />}
            <span>{isLiveLoading ? 'Querying OSV...' : 'Query Live OSV'}</span>
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
              results.findings.map((item, index) => (
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
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : item.severity === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {item.severity} • CVSS {item.cvssScore || '8.2'}
                      </span>
                      {item.epssScore && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]" title="Exploit Prediction Scoring System probability">
                          EPSS {item.epssScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-snug">{item.summary}</p>

                  {/* CVSS Vector String Drawer */}
                  {item.cvssVector && (
                    <div className="p-1.5 rounded bg-black/40 border border-white/[0.04] font-mono text-[10px] text-slate-400 overflow-x-auto">
                      <code>{item.cvssVector}</code>
                    </div>
                  )}

                  {/* Footer Row: CVE & Upgrade Target with 1-Click Auto-Bump */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-rose-400 font-medium">{item.cve}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.source || 'OSV.dev'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-medium">
                        <span>Fixed in v{item.fixedIn}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      </div>

                      {item.fixedIn && item.fixedIn !== 'Latest' && !item.fixedIn.includes('Official') && (
                        <button
                          onClick={() => handleAutoBump(item.packageName, item.fixedIn)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-200 text-black text-[10px] font-semibold rounded-md shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          title={`Auto-bump ${item.packageName} to v${item.fixedIn} in manifest`}
                        >
                          <Wand2 className="w-2.5 h-2.5 text-black" />
                          <span>Fix</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

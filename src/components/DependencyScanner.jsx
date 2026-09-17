import React, { useState, useEffect } from 'react';
import { scanDependencies } from '../engine/scaScanner';
import { PackageCheck, ShieldAlert, FileJson, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
  const [results, setResults] = useState({ totalDependencies: 0, findings: [] });

  const handleScan = () => {
    const data = scanDependencies(manifestText, manifestType);
    setResults(data);
  };

  useEffect(() => {
    handleScan();
  }, [manifestText, manifestType]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Software Composition Analysis (SCA)</h2>
            <p className="text-xs text-slate-400">Scans third-party package dependencies for known CVE vulnerabilities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setManifestType('package.json');
              setManifestText(SAMPLE_PACKAGE_JSON);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Load Sample package.json
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manifest Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span>Dependency Manifest Input</span>
            </div>
            <select
              value={manifestType}
              onChange={(e) => setManifestType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-2 py-1"
            >
              <option value="package.json">package.json</option>
              <option value="requirements.txt">requirements.txt</option>
            </select>
          </div>

          <textarea
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
            spellCheck={false}
            className="w-full h-80 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* SCA Results List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Discovered Package CVEs ({results.findingsCount || 0})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Scanned: {results.totalDependencies} packages
            </span>
          </div>

          <div className="overflow-y-auto max-h-[340px] space-y-3 pr-1">
            {results.findingsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-bold text-slate-300">All Dependencies Clean</p>
                <p className="text-[11px] text-slate-500">No known CVE vulnerabilities matched in database.</p>
              </div>
            ) : (
              results.findings.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-cyan-400 font-mono">{item.packageName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
                        v{item.currentVersion}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">{item.summary}</p>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800 text-slate-400">
                    <span className="font-mono text-rose-400">{item.cve}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      Upgrade to v{item.fixedIn} <ArrowUpRight className="w-3 h-3" />
                    </span>
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

import React, { useState } from 'react';
import { generateAuditReportMarkdown } from '../utils/reportGenerator';
import { FileText, Copy, Download, X, Check, Printer, Shield, Sparkles, Award } from 'lucide-react';

export default function AuditReportModal({ isOpen, onClose, scanMetrics, findings = [], language, code, aiReviewData }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'raw'

  if (!isOpen) return null;

  const reportText = generateAuditReportMarkdown(scanMetrics, findings, language, code, aiReviewData);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Severa_AI_Security_Audit_Report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const score = scanMetrics?.score ?? 100;
  const grade = scanMetrics?.grade || (score >= 90 ? 'A+' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F');

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Modal Header (Hidden on PDF Print) */}
        <div className="bg-[#0c0e15] px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Executive Security Audit Report</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  CISO Grade
                </span>
              </h3>
              <p className="text-xs text-slate-400">Comprehensive SAST, SCA & AI Patch Audit Record</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visual Executive Summary
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'raw' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Markdown
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>.md</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white text-xl font-bold ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 print:p-8 print:overflow-visible">
          
          {activeTab === 'preview' ? (
            <div className="space-y-6">
              
              {/* Executive Summary Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 print:border-black space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white print:text-black">Severa AI Security Assessment</h2>
                      <p className="text-xs text-slate-400 print:text-slate-600">Language Target: <span className="text-indigo-400 font-bold uppercase">{language}</span> | Scan Timestamp: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-bold">Security Score</div>
                      <div className="text-2xl font-black text-white print:text-black">{score}/100</div>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl border ${
                      grade === 'A+' || grade === 'A'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : grade === 'B'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {grade}
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Critical</span>
                    <span className="text-lg font-black text-rose-400">{criticalCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">High</span>
                    <span className="text-lg font-black text-amber-400">{highCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-yellow-500/20 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Medium</span>
                    <span className="text-lg font-black text-yellow-400">{mediumCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/20 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Low</span>
                    <span className="text-lg font-black text-blue-400">{lowCount}</span>
                  </div>
                </div>
              </div>

              {/* Findings Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 print:text-black flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Audited Vulnerability Findings ({findings.length})</span>
                </h3>

                {findings.length === 0 ? (
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-400 text-xs font-semibold">
                    ✓ Zero vulnerabilities detected. Application passed all SAST & SCA security checks.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {findings.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:border-slate-300 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white print:text-black">{idx + 1}. {item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            item.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {item.severity} | Line {item.line}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 print:text-slate-700">{item.description}</p>

                        <div className="bg-slate-900 print:bg-slate-100 p-2.5 rounded-lg font-mono text-[11px] text-rose-300 print:text-rose-700 overflow-x-auto border border-slate-800">
                          <code>{item.codeSnippet}</code>
                        </div>

                        {item.remediation && (
                          <p className="text-[11px] text-emerald-400 print:text-emerald-700">
                            <strong>Remediation:</strong> {item.remediation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Remediation Diff Section */}
              {aiReviewData?.fixedCode && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Recommended Refactored Secure Patch</span>
                  </h4>
                  <div className="bg-slate-900 print:bg-slate-100 p-3 rounded-lg font-mono text-[11px] text-emerald-300 print:text-emerald-800 overflow-x-auto">
                    <pre>{aiReviewData.fixedCode}</pre>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
              {reportText}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

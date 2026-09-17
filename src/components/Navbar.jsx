import React from 'react';
import { 
  ShieldAlert, 
  Code2, 
  GitPullRequest, 
  LayoutDashboard, 
  PackageCheck, 
  Sliders, 
  FileText, 
  Key, 
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  scanMetrics, 
  onOpenReport, 
  apiKey, 
  setApiKey 
}) {
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title - Updated Brand Name to Severa AI */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">Severa AI</h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider">
                Mini Project Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">Continuous AI Code Review & SAST Security Platform</p>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <nav className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'workbench'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code Workbench</span>
            {scanMetrics?.totalFindings > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40">
                {scanMetrics.totalFindings}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('cicd')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'cicd'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>CI/CD Security Gate</span>
          </button>

          <button
            onClick={() => setActiveTab('sca')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'sca'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>SCA Dependencies</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Rules</span>
          </button>
        </nav>

        {/* Right Status Actions & Report Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Health Score Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Security Grade:</span>
            <span className={`font-black text-sm ${
              scanMetrics.grade.startsWith('A') ? 'text-emerald-400' :
              scanMetrics.grade.startsWith('B') ? 'text-blue-400' :
              scanMetrics.grade.startsWith('C') ? 'text-amber-400' : 'text-rose-500'
            }`}>
              {scanMetrics.grade} ({scanMetrics.score}/100)
            </span>
          </div>

          {/* Gemini Key Config Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              apiKey ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Configure Gemini API Key (Optional Live AI)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{apiKey ? 'Gemini Active' : 'AI API Key'}</span>
          </button>

          {/* Generate Audit Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Audit Report</span>
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Configure Severa AI Reasoning Engine</h3>
              </div>
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Severa AI operates with an instant local offline rule-based & remediation engine. Optionally add your Google Gemini API Key to enable live deep AI contextual code reviews.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

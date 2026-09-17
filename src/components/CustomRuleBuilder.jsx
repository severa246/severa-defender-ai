import React, { useState } from 'react';
import { Sliders, Plus, Trash2, ShieldCheck, Code2 } from 'lucide-react';

export default function CustomRuleBuilder({ customRules = [], setCustomRules }) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [cwe, setCwe] = useState('CWE-200');
  const [patternStr, setPatternStr] = useState('');
  const [description, setDescription] = useState('');
  const [remediation, setRemediation] = useState('');

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!title || !patternStr) return;

    let regexObj;
    try {
      regexObj = new RegExp(patternStr, 'i');
    } catch (err) {
      alert("Invalid Regular Expression Pattern!");
      return;
    }

    const newRule = {
      id: `CUSTOM-${Date.now()}`,
      title,
      severity,
      cwe,
      cweUrl: `https://cwe.mitre.org/data/definitions/${cwe.replace('CWE-', '')}.html`,
      owasp: 'Custom Organizational Security Policy',
      languages: ['all'],
      pattern: regexObj,
      description,
      impact: 'Violation of company custom security policy.',
      remediation
    };

    setCustomRules([...customRules, newRule]);
    setTitle('');
    setPatternStr('');
    setDescription('');
    setRemediation('');
  };

  const handleRemoveRule = (id) => {
    setCustomRules(customRules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Custom Security Rule Engine</h2>
            <p className="text-xs text-slate-400">Define custom organization-specific AST pattern rules & regex policies</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Builder Form */}
        <form onSubmit={handleAddRule} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Detection Rule</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Rule Title</label>
              <input
                type="text"
                placeholder="e.g. Unencrypted Internal RPC Call"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Regex Pattern (ECMAScript Regular Expression)</label>
            <input
              type="text"
              placeholder="e.g. internal_api_key\s*=\s*['&quot;].*?['&quot;]"
              value={patternStr}
              onChange={(e) => setPatternStr(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Description</label>
            <textarea
              placeholder="Explain the security flaw..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Remediation Guidance</label>
            <input
              type="text"
              placeholder="How to fix this issue..."
              value={remediation}
              onChange={(e) => setRemediation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            Add Rule to Active Scanner Engine
          </button>
        </form>

        {/* Active Custom Rules List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Active Custom Rules ({customRules.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Active in Realtime Scanner</span>
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[380px]">
            {customRules.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No custom rules added yet. Add one on the left.</p>
            ) : (
              customRules.map((rule) => (
                <div key={rule.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{rule.title}</span>
                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300">
                    Pattern: {rule.pattern.toString()}
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

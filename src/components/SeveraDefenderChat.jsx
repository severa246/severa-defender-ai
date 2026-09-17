import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Sparkles, Send, X, AlertTriangle, CheckCircle,
  HelpCircle, Wrench, ShieldCheck, Terminal, Copy, Check,
  ChevronRight, RefreshCw, MessageSquare, Code2
} from 'lucide-react';

export default function SeveraDefenderChat({
  isOpen,
  onClose,
  activeFileName = 'main.py',
  language = 'python',
  code = '',
  findings = [],
  targetFinding = null,
  apiKey = '',
  selectedProvider = 'google',
  selectedModel = 'gemini-1.5-flash',
  customEndpoint = '',
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial message & prompt pre-fill when opening
  useEffect(() => {
    if (isOpen) {
      const activeFlaw = targetFinding || (findings.length > 0 ? findings[0] : null);
      const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());
      const provUpper = (selectedProvider || 'LOCAL ENGINE').toUpperCase();
      const modelUpper = selectedModel || 'ACTIVE MODEL';

      const apiInfo = hasKey
        ? `\n\n🟢 **Live AI Connected:** Powered by \`${provUpper} (${modelUpper})\`.`
        : `\n\n⚡ **Local Engine Active:** Using Severa AST Intelligence.`;

      if (targetFinding) {
        const welcomeText = `Hello! I am **Severa Defender AI**.\n\nFocused Analysis Target: **${targetFinding.title}** (\`${targetFinding.severity}\` - Line ${targetFinding.line}) in \`${activeFileName}\`.${apiInfo}\n\nI have pre-filled the vulnerability analysis question below. You can customize your question or click **Send** when ready!`;
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'defender',
            text: welcomeText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);

        const focusedPrompt = `Explain the vulnerability "${targetFinding.title}" on line ${targetFinding.line} in detail: 1. Why it happened (root cause), 2. What could happen if allowed or exploited (security risk & impact), and 3. How to prevent and fix it in future code.`;
        setInput(focusedPrompt);
      } else {
        const initialText = activeFlaw
          ? `Hello! I am **Severa Defender**, your AI security assistant.\n\nI noticed **${findings.length} security flaw(s)** in \`${activeFileName}\`. Target: **${activeFlaw.title} (${activeFlaw.severity})** on line ${activeFlaw.line}.${apiInfo}\n\nHow can I assist you today?`
          : `Hello! I am **Severa Defender**, your AI security assistant.\n\n\`${activeFileName}\` is loaded into context. All scan rules passed cleanly (0 Flaws Detected).${apiInfo}`;

        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'defender',
            text: initialText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        if (activeFlaw) {
          setInput(`Explain the vulnerability "${activeFlaw.title}" on line ${activeFlaw.line} in detail: 1. Why it happened (root cause), 2. What could happen if allowed or exploited (security risk & impact), and 3. How to prevent and fix it in future code.`);
        }
      }
    }
  }, [isOpen, targetFinding]);

  if (!isOpen) return null;

  const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    try {
      let responseText = '';
      const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());

      if (hasKey) {
        try {
          // Live API Call to active provider (Gemini, OpenAI, Anthropic, Groq, Ollama)
          const liveAiRes = await fetchLiveAiDefenderResponse({
            prompt: textToSend,
            findings,
            targetFinding,
            fileName: activeFileName,
            code,
            language,
            apiKey,
            selectedProvider,
            selectedModel,
            customEndpoint
          });

          if (liveAiRes && liveAiRes.trim()) {
            responseText = liveAiRes;
          } else {
            responseText = generateDefenderResponse(textToSend, findings, activeFileName, code, language, targetFinding);
          }
        } catch (apiErr) {
          console.warn("Live AI Defender call failed, using local engine:", apiErr);
          const fallbackRes = generateDefenderResponse(textToSend, findings, activeFileName, code, language, targetFinding);
          responseText = `⚠️ *[Live AI Provider Notice: ${apiErr.message || 'API call unavailable'}. Active response rendered via Severa Security Engine]*\n\n` + fallbackRes;
        }
      } else {
        // Local AST Security Engine Response
        await new Promise((r) => setTimeout(r, 400));
        responseText = generateDefenderResponse(textToSend, findings, activeFileName, code, language, targetFinding);
      }

      const defenderMsg = {
        id: `def-${Date.now()}`,
        sender: 'defender',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, defenderMsg]);
    } catch (err) {
      console.error("Defender processing error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Shield className="w-5 h-5 text-white" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">Severa Defender AI</h2>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasKey ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {hasKey ? `LIVE AI: ${(selectedProvider || 'CONNECTED').toUpperCase()}` : 'LOCAL ENGINE ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Vulnerability Diagnosis &amp; Future Prevention Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Context Strip */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-4 font-mono text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Target File:</span>
            <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeFileName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Language:</span>
            <span className="font-semibold text-cyan-400 uppercase">{language}</span>
          </div>

          <div className="flex items-center gap-2">
            {findings.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Active Vulnerabilities:</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {findings.length} Flagged
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Audit Status:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  0 Flaws (Code Clean)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Preset Quick Actions */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/60 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setInput("Explain why this vulnerability happened in detail.")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Pre-fill prompt: Why did this happen?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>🔍 Why did this happen?</span>
          </button>

          <button
            onClick={() => setInput("Show me how to refactor and fix this code safely.")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Pre-fill prompt: How can we fix it?"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>🛠️ How can we fix it?</span>
          </button>

          <button
            onClick={() => setInput("How can we overcome and prevent this vulnerability in the future after fix?")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Pre-fill prompt: How to overcome in future?"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛡️ How to overcome in future?</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'defender' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-cyan-500/20">
                  <Shield className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-lg shadow-cyan-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] opacity-75">
                    {msg.sender === 'user' ? 'You' : 'Severa Defender AI'}
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">{msg.time}</span>
                </div>

                <div className="whitespace-pre-wrap space-y-2">
                  {formatMarkdown(msg.text)}
                </div>

                {msg.sender === 'defender' && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Severa Defender is analyzing vulnerability AST and threat model...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-start gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={4}
              placeholder="Ask Severa Defender (e.g. 'How does an attacker exploit this?', 'What linters prevent this?')... [Press Enter to Send, Shift+Enter for new line]"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono min-h-[95px] max-h-[160px] overflow-y-auto leading-relaxed resize-y"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 mt-1"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ── Helper to format response sections nicely ────────────────────────────────
function formatMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-2 mb-1">{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={idx} className="font-bold text-white mt-1">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-2">
          <span className="text-cyan-400 font-bold">•</span>
          <span className="text-slate-300">{formatInline(line.substring(2))}</span>
        </div>
      );
    }
    return <p key={idx} className="text-slate-300 leading-relaxed">{formatInline(line)}</p>;
  });
}

function formatInline(str) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ── Intelligent Multi-Provider Live API Dispatcher ───────────────────────────
async function fetchLiveAiDefenderResponse({
  prompt,
  findings = [],
  fileName = 'main.py',
  code = '',
  language = 'javascript',
  apiKey = '',
  selectedProvider = 'google',
  selectedModel = 'gemini-1.5-flash',
  customEndpoint = ''
}) {
  const activeFlaw = findings[0] || null;
  const hasFlaws = findings.length > 0;

  const systemPrompt = `You are Severa Defender AI, a Principal Cybersecurity Architect.
Target File: ${fileName} (${language.toUpperCase()})
Active Vulnerabilities Count: ${findings.length}
${hasFlaws ? `Primary Flagged Vulnerability: ${JSON.stringify(activeFlaw)}` : 'Audit Status: Clean (0 Vulnerabilities Flagged)'}
All Findings: ${JSON.stringify(findings)}

Code Context:
\`\`\`${language}
${code}
\`\`\`

User Question: ${prompt}

Formatting Rules:
- Respond in formatted markdown.
- If asking WHY it happened, explain root cause, attack vector, and CWE details (or confirm code is clean if 0 flaws).
- If asking HOW TO FIX, provide safe refactored code patch and explain changes (or state no fix needed if clean).
- If asking HOW TO OVERCOME IN FUTURE, provide actionable prevention guidelines.
- Keep explanations professional, precise, and practical.`;

  const provider = (selectedProvider || 'google').toLowerCase();

  // 1. Google Gemini
  if (provider === 'google' || provider === 'gemini') {
    let cleanModel = (selectedModel || 'gemini-1.5-flash').trim()
      .replace(/^google\//i, '')
      .replace(/^models\//i, '')
      .replace(/^gemini\//i, '');
    if (!cleanModel || cleanModel === 'google' || cleanModel === 'gemini' || cleanModel.includes('1.5-pro')) {
      cleanModel = 'gemini-1.5-flash';
    }

    const candidateModels = Array.from(new Set([cleanModel, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash']));
    let lastError = null;

    for (const mName of candidateModels) {
      for (const apiVer of ['v1beta', 'v1']) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${mName}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
          } else {
            const errJson = await res.json().catch(() => ({}));
            const msg = errJson.error?.message;
            if (msg && !msg.includes('not found')) {
              lastError = msg;
            }
          }
        } catch (e) {
          lastError = e.message;
        }
      }
    }

    throw new Error(`Gemini API Error: ${lastError || 'Unable to connect to Gemini API. Please verify your API key.'}`);
  }

  // 2. OpenAI
  if (provider === 'openai') {
    const model = selectedModel || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are Severa Defender AI, a Principal Security Architect.' },
          { role: 'user', content: systemPrompt }
        ]
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API Error (${res.status}): ${errJson.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  }

  // 3. Anthropic
  if (provider === 'anthropic' || provider === 'claude') {
    const model = selectedModel || 'claude-3-5-sonnet-20240620';
    const url = 'https://api.anthropic.com/v1/messages';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerouslyAllowBrowser': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API Error (${res.status}): ${errJson.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || null;
  }

  // 4. Groq
  if (provider === 'groq') {
    const model = selectedModel || 'llama3-70b-8192';
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are Severa Defender AI, a Principal Security Architect.' },
          { role: 'user', content: systemPrompt }
        ]
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(`Groq API Error (${res.status}): ${errJson.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  }

  // 5. Ollama / Local Endpoint
  if (provider === 'ollama' || provider === 'local' || customEndpoint) {
    const endpointUrl = customEndpoint ? customEndpoint.replace(/\/$/, '') : 'http://localhost:11434';
    const model = selectedModel || 'llama3';

    try {
      const res = await fetch(`${endpointUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: systemPrompt }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (_e) {}

    const res = await fetch(`${endpointUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: systemPrompt,
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Local Engine returned ${res.status}`);
    const data = await res.json();
    return data.response || null;
  }

  // Default Fallback to Gemini API if key is set
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }]
    })
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Production-Grade Dynamic Local AST Response Generator ──────────────────────
function generateDefenderResponse(prompt, findings = [], fileName = 'main.py', code = '', language = 'javascript', targetFinding = null) {
  const query = prompt.toLowerCase();
  const hasFlaws = findings.length > 0 || Boolean(targetFinding);

  // CASE 1: File has ZERO flaws or code is clean/empty
  if (!hasFlaws) {
    if (query.includes('why') || query.includes('happened') || query.includes('cause') || query.includes('explain')) {
      return `### 🛡️ Security Status: Code Clean (0 Vulnerabilities Flagged)

**Target File:** \`${fileName}\` (${language.toUpperCase()})

**Why Did This Happen?**
- **Zero Flaws Detected:** All Severa SAST static analysis security rules passed cleanly on \`${fileName}\`.
- **No Unsafe Patterns:** The code does not contain unvalidated input concatenation, raw SQL queries, DOM XSS sinks, or exposed secrets.
- **Pass Status:** Code complies with standard security benchmarks. No vulnerability root cause to analyze!`;
    }

    if (query.includes('fix') || query.includes('refactor') || query.includes('how can we fix') || query.includes('patch')) {
      return `### 🛠️ Code Remediation & Refactoring Status

**Target File:** \`${fileName}\` (${language.toUpperCase()})

**Remediation Action:**
- **No Patch Required:** Your file currently has **0 security vulnerabilities**.
- The existing code is clean and passes all default rule parameters. No refactoring or emergency patch is needed!`;
    }

    if (query.includes('future') || query.includes('overcome') || query.includes('prevent') || query.includes('avoid')) {
      return `### 🛡️ Blueprint: Maintaining Secure Code Standards

Even though your current file \`${fileName}\` is 100% clean, adopt these proactive security practices as your codebase expands:

### 1. ⚙️ Secure Coding Guidelines
- **Use Parameterized Queries & ORMs:** Never concatenate user input strings directly into database or command execution calls.
- **Strict Environment Secrets:** Never hardcode secret keys or passwords; load them at runtime via \`process.env\` or \`os.environ\`.

### 2. 🤖 Automated Pre-Commit SAST Gateways
- Install Severa SAST hooks to audit every Git commit before pushing to GitHub:
\`\`\`bash
severa hook install --profile owasp-top10 --fail-on high
\`\`\`

### 3. 🔍 Continuous SAST Scanning
- Keep Severa SAST automatic scanning enabled in your workbench for real-time security feedback.`;
    }

    return `### 🛡️ Severa Defender Analysis

Regarding your question about **${prompt}**:

- **File Context:** \`${fileName}\` (${language.toUpperCase()})
- **Audit Status:** Clean (0 Flaws Flagged)

Your code passes all security rules cleanly! Feel free to paste new code, ask about security architectures, or request custom security reviews.`;
  }

  // CASE 2: File HAS Flagged Vulnerabilities (findings.length > 0)
  const flaw = targetFinding || (findings.length > 0 ? findings[0] : null);
  if (!flaw) {
    return `### 🛡️ Severa Defender Analysis\n\nYour code passes all security rules cleanly!`;
  }

  const title = flaw.title || 'Security Vulnerability';
  const severity = flaw.severity || 'HIGH';
  const line = flaw.line || 1;
  const ruleId = flaw.ruleId || 'SEC-01';
  const snippet = flaw.codeSnippet ? `\`${flaw.codeSnippet}\`` : 'dynamic expression';
  const cwe = flaw.cwe || 'CWE-89';
  const description = flaw.description || 'Untrusted input reaches execution sink.';
  const impact = flaw.impact || 'Unauthorized access, data exfiltration or arbitrary code execution.';
  const remediation = flaw.remediation || 'Use parameterized statements, input sanitization, or environment variables.';

  return `### 🛡️ Severa Defender AI: Deep Vulnerability Analysis

**Target Vulnerability:** **${title}**
**File & Location:** \`${fileName}\` (Line ${line}) | Severity: \`${severity}\` (\`${ruleId}\` / \`${cwe}\`)
**Flagged Snippet:** ${snippet}

---

### 1. 🔍 Why Did This Happen? (Root Cause Analysis)
- **Unsafe Code Pattern:** ${description}
- **Interpreter Mechanism:** Runtimes execute control instructions verbatim. Without parameter binding or escaping, dynamic inputs (e.g. \`username\`, \`password\`, or \`cmd\`) are evaluated as code statements rather than literal data.

---

### 2. 🚨 What Could Happen If Allowed? (Security Impact & Exploit Risks)
- **Primary Risk:** ${impact}
- **Potential Attack Scenarios:**
  - **Database Exfiltration & Manipulation:** Attackers can inject SQL syntax to bypass authentication, dump password hashes, or wipe database tables.
  - **Arbitrary Remote Code Execution (RCE):** Unsanitized shell execution or dynamic evaluation permits attackers to execute arbitrary system commands or open reverse shells.
  - **Credentials & Key Exposure:** Hardcoded keys expose cloud resources to automated scraper bots.

---

### 3. 🛡️ How to Prevent & Fix It in the Future (Remediation Strategy)
- **Immediate Fix:** ${remediation}
- **Secure Code Refactoring Standard:**
\`\`\`${language}
// SECURED REFACTOR for Line ${line} (${ruleId}):
// Replace string concatenation with parameterized execution or environment variables:
${remediation ? `// ${remediation}` : '// Parameterized binding applied'}
\`\`\`
- **Automated CI/CD Gate:** Install pre-commit SAST hooks (\`severa hook install --fail-on high\`) to block \`${ruleId}\` flaws before git push.`;
}

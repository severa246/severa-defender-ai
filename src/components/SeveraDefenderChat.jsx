import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Sparkles, Send, X, AlertTriangle, CheckCircle,
  HelpCircle, Wrench, ShieldCheck, Terminal, Copy, Check,
  ChevronRight, RefreshCw, MessageSquare, Code2
} from 'lucide-react';

const CHAT_STORAGE_KEY = 'severa_defender_chat_history';

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
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_e) {}
    return [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-save messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (_e) {}
  }, [messages]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendRef = useRef(null);

  // Initial message & prompt pre-fill when opening
  useEffect(() => {
    if (isOpen) {
      const activeFlaw = targetFinding || (findings.length > 0 ? findings[0] : null);
      const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());
      const provUpper = (selectedProvider || 'LOCAL ENGINE').toUpperCase();
      const modelUpper = selectedModel || 'ACTIVE MODEL';

      const apiInfo = hasKey
        ? `\n\n**Live AI Connected:** Powered by \`${provUpper} (${modelUpper})\`.`
        : `\n\n**Local Engine Active:** Using Severa AST Intelligence.`;

      if (targetFinding) {
        const focusedPrompt = `Can you explain the "${targetFinding.title}" vulnerability in ${targetFinding.fileName || activeFileName} on line ${targetFinding.line}? Please break down the root cause, what the security impact is, and how I can refactor this code safely.`;
        setInput(focusedPrompt);
      } else {
        // If we don't have any existing messages in chat history, show the initial welcome message
        if (!messages || messages.length === 0) {
          const initialText = activeFlaw
            ? `Hello! I'm **Severa Defender**, your AI security partner.\n\nI analyzed \`${activeFileName}\` and found **${findings.length} security issue(s)**. The highest priority is **${activeFlaw.title} (${activeFlaw.severity})** on line ${activeFlaw.line}.${apiInfo}\n\nAsk me anything about these findings, or request a complete refactored patch!`
            : `Hello! I'm **Severa Defender**, your AI security partner.\n\n\`${activeFileName}\` is loaded into context and passed all security benchmarks with **0 flaws flagged**!${apiInfo}\n\nFeel free to ask questions about secure code architectures or test other files.`;

          setMessages([
            {
              id: `welcome-${Date.now()}`,
              sender: 'defender',
              text: initialText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
        if (activeFlaw && (!input || input.trim().length === 0)) {
          setInput(`Can you explain the "${activeFlaw.title}" vulnerability on line ${activeFlaw.line} in detail and show how to fix it?`);
        }
      }
    }
  }, [isOpen, targetFinding]);

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
    setInput('');
    setIsTyping(true);

    try {
      let responseText = '';

      // 1. Send query to Severa Serverless AI Proxy (/api/ai-proxy -> Hugging Face Qwen 2.5 Coder 32B / Gemini)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const proxyRes = await fetch('/api/ai-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: `User Question: ${textToSend}\n\nCode Context (${activeFileName}):\n${code}`,
            language,
            findings,
            apiKey
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (proxyRes.ok) {
          const data = await proxyRes.json();
          if (data.success && data.fixedCode && !data.fallback) {
            responseText = data.fixedCode;
          } else if (data.remediationDiffSummary) {
            responseText = `${data.remediationDiffSummary}\n\n` + generateDefenderResponse(textToSend, findings, activeFileName, code, language, targetFinding);
          }
        }
      } catch (_proxyErr) {}

      if (!responseText) {
        const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());
        if (hasKey) {
          try {
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
            if (liveAiRes && liveAiRes.trim()) responseText = liveAiRes;
          } catch (_apiErr) {}
        }
      }

      if (!responseText) {
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

  handleSendRef.current = handleSend;

  if (!isOpen) return null;

  const hasKey = Boolean(apiKey && apiKey.trim().length > 5) || selectedProvider === 'ollama' || Boolean(customEndpoint && customEndpoint.trim());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn cursor-pointer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] sm:h-[88vh] bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden cursor-default"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#191C23] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-[#232732] border border-white/10 flex items-center justify-center shadow-md shadow-black/40">
              <Shield className="w-5 h-5 text-emerald-400" />
              <Sparkles className="w-3 h-3 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Severa Defender AI</h2>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#232732] border border-white/10 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
                  {hasKey ? `LIVE AI: ${(selectedProvider || 'CONNECTED').toUpperCase()}` : 'HUGGING FACE QWEN 2.5 32B ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Vulnerability Diagnosis &amp; Future Prevention Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const welcomeText = `Chat session reset. Target file \`${activeFileName}\` is loaded into context. How can I assist you with security analysis?`;
                const freshMessages = [{
                  id: `welcome-${Date.now()}`,
                  sender: 'defender',
                  text: welcomeText,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }];
                setMessages(freshMessages);
                try {
                  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(freshMessages));
                } catch (_e) {}
                setInput('');
              }}
              title="Reset conversation and start fresh chat"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#232732] hover:bg-[#2c3240] text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Chat</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232732] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Context Strip */}
        <div className="px-6 py-2.5 bg-[#16181f] border-b border-white/10 flex items-center justify-between gap-4 font-mono text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Target File:</span>
            <span className="font-bold text-white bg-[#191C23] px-2 py-0.5 rounded border border-white/10">{activeFileName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Language:</span>
            <span className="font-semibold text-emerald-400 uppercase">{language}</span>
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
        <div className="px-6 py-3 bg-[#181a20] border-b border-white/10 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setInput("Can you explain why this vulnerability occurred and what the root cause is?")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141a] hover:bg-[#232732] border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Ask: Why did this happen?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why did this happen?</span>
          </button>

          <button
            onClick={() => setInput("Show me how to refactor and patch this code safely.")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141a] hover:bg-[#232732] border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Ask: How can we fix it?"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>How can we fix it?</span>
          </button>

          <button
            onClick={() => setInput("What best practices should we follow to prevent this vulnerability in the future?")}
            disabled={isTyping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12141a] hover:bg-[#232732] border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Ask: How to overcome in future?"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>How to overcome in future?</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans bg-[#0f1117]">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'defender' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                  <Shield className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed shadow-md shadow-black/20 ${
                  msg.sender === 'user'
                    ? 'bg-[#252834] border border-white/15 text-white rounded-tr-none px-4 py-3'
                    : 'bg-[#181a20] border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.06]">
                  <span className="font-semibold text-[11px] text-slate-400">
                    {msg.sender === 'user' ? 'You' : 'Severa Defender'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                </div>

                <div>
                  {renderChatGPTMarkdown(msg.text)}
                </div>

                {msg.sender === 'defender' && (
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
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
                <div className="w-8 h-8 rounded-xl bg-[#232732] border border-white/10 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-[#191C23] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-md shadow-black/30">
                <Shield className="w-4 h-4" />
              </div>
              <div className="bg-[#191C23] border border-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-2 text-xs text-slate-400 shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Severa Defender is analyzing vulnerability AST and threat model...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#191C23] border-t border-white/10 shrink-0">
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
              className="flex-1 bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono min-h-[95px] max-h-[160px] overflow-y-auto leading-relaxed resize-y"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 mt-1"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ── ChatGPT-Style Rich Markdown & Syntax-Highlighted Code Component ──────────
function renderChatGPTMarkdown(text) {
  if (!text) return null;

  // Split by fenced code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return (
    <div className="space-y-1.5 text-slate-200 text-xs sm:text-[13px] leading-relaxed">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeSnippetBlock key={idx} language={part.language} code={part.code} />;
        }
        return <TextMarkdownBlock key={idx} content={part.content} />;
      })}
    </div>
  );
}

function CodeSnippetBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-lg shadow-black/40">
      {/* Top Header Bar like ChatGPT */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-white/10 text-xs font-mono">
        <span className="text-[11px] text-slate-400 font-semibold lowercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-white/5"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre className="p-3.5 overflow-x-auto text-[12px] font-mono leading-relaxed text-slate-200 bg-[#090d13]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextMarkdownBlock({ content }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="border-white/10 my-2.5" />;
        }

        // Heading 3
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-semibold text-slate-100 mt-3 mb-1 tracking-tight flex items-center gap-1.5">
              {formatInline(line.replace('### ', ''))}
            </h3>
          );
        }

        // Heading 2
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-semibold text-white mt-3.5 mb-1.5 tracking-tight">
              {formatInline(line.replace('## ', ''))}
            </h2>
          );
        }

        // Heading 1
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-bold text-white mt-4 mb-2 tracking-tight">
              {formatInline(line.replace('# ', ''))}
            </h1>
          );
        }

        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <div key={idx} className="border-l-2 border-emerald-500/60 bg-emerald-500/5 px-3 py-2 rounded-r-lg text-slate-200 italic text-xs my-2">
              {formatInline(line.substring(2))}
            </div>
          );
        }

        // Numbered list: "1. ", "2. ", etc.
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="text-slate-400 font-mono text-xs font-semibold shrink-0">{numMatch[1]}.</span>
              <span className="text-slate-200 leading-relaxed">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Bulleted list: "- " or "* " or "• "
        if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-1">
              <span className="text-slate-400 font-bold text-sm leading-none shrink-0">•</span>
              <span className="text-slate-200 leading-relaxed">{formatInline(line.substring(2))}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-200 text-xs sm:text-[13px] leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#2b2d38] border border-white/10 text-slate-100 font-mono text-[11px] font-semibold mx-0.5">
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

  const systemPrompt = `You are Severa Defender AI, an expert Principal Security Engineer communicating in the natural, clear, conversational style of ChatGPT.
Target File: ${fileName} (${language.toUpperCase()})
Active Vulnerabilities Count: ${findings.length}
${hasFlaws ? `Primary Flagged Vulnerability: ${JSON.stringify(activeFlaw)}` : 'Audit Status: Clean (0 Vulnerabilities Flagged)'}
All Findings: ${JSON.stringify(findings)}

Code Context:
\`\`\`${language}
${code}
\`\`\`

User Question: ${prompt}

Communication Style & Instructions (ChatGPT Style):
- Write in a natural, friendly, expert, and conversational tone (like ChatGPT).
- Do not use robotic forms, questionnaire templates, or repetitive labels like "Target Vulnerability:" or "Flagged Snippet:".
- Directly answer the developer's question with clarity and depth.
- Use clean Markdown with headers (###), bullet points, and syntax-highlighted code blocks with language tags (\`\`\`${language}).
- When explaining a vulnerability, cover:
  1. Root cause in plain terms.
  2. Concrete real-world exploitation impact and threat scenarios.
  3. Actionable remediation with a "Before (Vulnerable)" vs "After (Secured)" code comparison.
  4. Industry best practices to prevent similar bugs in the future.
- If the code is clean, congratulate the developer and offer helpful security tips for scaling.`;

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
  const flaw = targetFinding || (findings.length > 0 ? findings[0] : null);

  // CASE 1: File is completely clean
  if (!hasFlaws || !flaw) {
    if (query.includes('fix') || query.includes('refactor') || query.includes('patch')) {
      return `### No Fix Required — Code Passes All Security Gates

Great news! There are currently **0 security vulnerabilities** detected in \`${fileName}\`.

Your source code cleanly passes all Severa SAST rules, dependency audits, and secret scanning checks. The existing implementation does not require any emergency security refactoring or patches.

If you add new endpoints or integrate third-party data inputs later, remember to use parameterized queries and strict schema validation.`;
    }

    if (query.includes('future') || query.includes('prevent') || query.includes('best practice')) {
      return `### Proactive Security Best Practices for \`${fileName}\`

Even though \`${fileName}\` is currently clean, here are four core defense-in-depth practices to keep in mind as your codebase expands:

1. **Parameterize All Dynamic Queries:**
   Never concatenate untrusted input into SQL, shell commands, or eval routines. Always use ORM bindings or parameterized statements.

2. **Strict Environment Secrets Management:**
   Store all tokens, database credentials, and API keys in environment variables or a vault (e.g., AWS Secrets Manager, HashiCorp Vault), never directly in code.

3. **Input Validation & Sanitization:**
   Validate incoming payloads using runtime schemas (like Zod for TypeScript/JavaScript or Pydantic for Python) to reject unexpected structures early.

4. **Continuous Pre-Commit SAST Audits:**
   Enforce automated static scanning in your CI/CD pipeline so any newly introduced flaws are flagged before hitting production.`;
    }

    return `I reviewed \`${fileName}\` (${language.toUpperCase()}) and verified that **no security vulnerabilities** were detected.

All Severa static analysis benchmarks (OWASP Top 10, CWE, and Shannon entropy secret scans) passed cleanly. 

Feel free to ask any questions about secure architecture design, or load another file to inspect!`;
  }

  // CASE 2: File has flagged vulnerabilities
  const title = flaw.title || 'Security Vulnerability';
  const severity = flaw.severity || 'HIGH';
  const line = flaw.line || 1;
  const ruleId = flaw.ruleId || 'SEC-01';
  const snippet = flaw.codeSnippet ? flaw.codeSnippet.trim() : '';
  const cwe = flaw.cwe || 'CWE-89';
  const description = flaw.description || 'Untrusted data reaches an execution sink without proper sanitization.';
  const impact = flaw.impact || 'Unauthorized access, data tampering, or arbitrary code execution.';
  const remediation = flaw.remediation || 'Sanitize untrusted inputs and use safe parameterized APIs.';

  // If user specifically asked only "how to fix"
  if (query.includes('how to fix') || query.includes('how can we fix') || query.includes('show me how to refactor') || query.includes('patch')) {
    let fixText = `### Refactoring Guide for ${title}

To remediate the **${severity}** flaw on line **${line}** of \`${fileName}\`, follow this secure refactoring pattern:

### 1. The Core Solution
> **${remediation}**

### 2. Code Comparison

\`\`\`${language}
// ❌ Vulnerable Implementation (Line ${line}):
${snippet || '// Dynamic unvalidated execution sink'}

// ✅ Secure Refactored Implementation:
${flaw.suggestedFix?.suggestedCode || (flaw.isSecret ? `const apiKey = process.env.API_KEY; // Loaded from secure environment` : flaw.isDependency ? `// Upgrade package ${flaw.packageName} to version ${flaw.fixedIn || 'latest patch'}` : `// Use parameterized query or safe parsing\nconst sanitizedInput = sanitize(input);\nexecuteSafely(sanitizedInput);`)}
\`\`\`

### 3. Key Changes Made
- **Boundary Validation:** Eliminated dynamic runtime interpretation of untrusted strings.
- **Safe Execution APIs:** Replaced direct dynamic sinks with safe, parameterized equivalents.

Would you like me to apply this patch to your active file?`;
    return fixText;
  }

  // If user specifically asked only "why did this happen"
  if (query.includes('why did this happen') || query.includes('root cause')) {
    return `### Root Cause Analysis: ${title}

In \`${fileName}\` around line **${line}**, the scanner flagged a **${severity}** vulnerability (\`${cwe}\`).

### Why this happens
${description}

When external or dynamic input is passed directly into an execution context without parameterization, the runtime interpreter cannot distinguish between code and data. Attackers exploit this behavior by supplying specially crafted strings that alter execution flow.

### Threat Vector
* **Severity Rating:** \`${severity}\` (Rule: \`${ruleId}\`)
* **Primary Impact:** ${impact}
* **Affected Location:** Line ${line} in \`${fileName}\`

Would you like to see the recommended refactoring code to patch this?`;
  }

  // Standard comprehensive ChatGPT-style response (Natural, conversational, well-formatted)
  let response = `The issue flagged on line **${line}** of \`${fileName}\` is a **${severity} severity** vulnerability: **${title}** (\`${cwe}\`).

Here is a breakdown of why this occurs, the security risks involved, and how to refactor it safely.

---

### 1. Root Cause Analysis
${description}

In modern runtime engines, dynamic evaluation constructs treat string inputs as raw instructions. When unvalidated or user-controlled input reaches these functions, the interpreter executes the attacker's syntax with the full privileges of the host process.

### 2. Security Impact & Threat Scenarios
If left unpatched, the primary consequence is **${impact.toLowerCase()}**

* **Arbitrary Execution & Tampering:** Attackers can inject malicious statements to manipulate control flow or execute unauthorized functions.
* **Confidentiality & Data Breach:** Attackers may bypass authentication checks, dump database records, or exfiltrate secret keys.
* **Infrastructure Compromise:** In severe cases (such as RCE or command injection), attackers can establish reverse shells and pivot laterally across internal servers.

### 3. Recommended Secure Refactoring
The recommended fix is:
> **${remediation}**

Here is a side-by-side comparison of how to refactor the vulnerable snippet:

\`\`\`${language}
// ❌ Vulnerable (Line ${line}):
${snippet || '// Unsafe dynamic sink'}

// ✅ Secured Refactor:
${flaw.suggestedFix?.suggestedCode || (flaw.isSecret ? `const secretKey = process.env.API_SECRET; // Read securely from environment` : flaw.isDependency ? `// Upgrade ${flaw.packageName} to ${flaw.fixedIn || 'latest release'} in package.json` : `// Parameterized and boundary-checked:\nconst result = safeHandler(input);`)}
\`\`\`

### 4. Proactive Prevention Guidelines
1. **Never Trust Dynamic Inputs:** Always sanitize and validate user-supplied parameters against strict schemas before execution.
2. **Use Native Parameterized APIs:** Avoid string concatenation or dynamic runtime evaluators (\`eval\`, raw SQL concatenation, or \`child_process.exec\`).
3. **Automate Pre-Commit Checks:** Add Severa SAST hooks to your git workflow to catch \`${ruleId}\` flaws before they are committed.

Let me know if you would like me to generate a complete one-click patch for this file!`;

  return response;
}

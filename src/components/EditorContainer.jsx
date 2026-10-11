import React, { useRef, useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { CODE_TEMPLATES } from '../engine/templates';
import { 
  Play, 
  Sparkles, 
  Wand2,
  CheckCircle2,
  AlertCircle,
  Undo2,
  Redo2,
  FolderTree,
  ClipboardPaste,
  Upload,
  FolderPlus,
  GitBranch,
  Trash2
} from 'lucide-react';
import { detectLanguage, getLanguageFromFilename } from '../engine/languageDetector';
import GitHubPullModal from './GitHubPullModal';
import FileTreeSidebar from './FileTreeSidebar';

const MONACO_LANG_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  shell: 'shell',
  dockerfile: 'dockerfile',
  yaml: 'yaml',
  sql: 'sql'
};

export default function EditorContainer({
  code,
  setCode,
  language,
  setLanguage,
  onScan,
  onScanFullProject,
  onGenerateAiFix,
  aiReviewData = null,
  onApplyFix = null,
  onApplyFixAll = null,
  findings = [],
  isScanning = false,
  isAiLoading = false,
  projectFiles = [],
  activeFilePath = '',
  activeProjectName = '',
  onSelectFile,
  onUploadFolder,
  onUploadFiles,
  onGithubPull,
  fixedLineNumbers = []
}) {
  const [autoDetectMode, setAutoDetectMode] = useState(true);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [fileTreeWidth, setFileTreeWidth] = useState(224);
  const isDraggingFileTree = useRef(false);

  const handleFileTreeMouseDown = (e) => {
    e.preventDefault();
    isDraggingFileTree.current = true;
    const startX = e.clientX;
    const startWidth = fileTreeWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvt) => {
      if (!isDraggingFileTree.current) return;
      const delta = moveEvt.clientX - startX;
      const newWidth = Math.max(160, Math.min(360, startWidth + delta));
      setFileTreeWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingFileTree.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const singleFileInputRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const lines = code ? code.split('\n') : [''];
  const lineCount = lines.length;

  // Configure custom dark theme on mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme('severa-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'type', foreground: 'fbbf24' },
        { token: 'delimiter', foreground: '94a3b8' }
      ],
      colors: {
        'editor.background': '#070a13',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#cbd5e1',
        'editor.lineHighlightBackground': '#0f172a60',
        'editorGutter.background': '#070a13',
        'editorIndentGuide.background1': '#1e293b',
        'editorIndentGuide.activeBackground1': '#334155',
        'editorError.foreground': '#f43f5e',
        'editorWarning.foreground': '#f59e0b',
        'editor.selectionBackground': '#38bdf830'
      }
    });

    monaco.editor.setTheme('severa-dark');

    // Shortcut Cmd+Enter / Ctrl+Enter to trigger SAST scan
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onScan(editor.getValue(), language);
    });
  };

  // Synchronize red problem squiggles & diagnostics to Monaco markers
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = (findings || []).map((f) => {
      const lineNum = Math.max(1, Math.min(model.getLineCount(), Number(f.line) || 1));
      const maxCol = Math.max(1, model.getLineMaxColumn(lineNum));

      let severity = monaco.MarkerSeverity.Error;
      if (f.severity === 'MEDIUM') severity = monaco.MarkerSeverity.Warning;
      else if (f.severity === 'LOW') severity = monaco.MarkerSeverity.Info;

      const messageParts = [
        `[${f.id || 'CWE'}] ${f.title || f.name || 'Security Finding'}`,
        f.description || f.message || '',
        f.cvss ? `CVSS: ${f.cvss} | Severity: ${f.severity}` : ''
      ].filter(Boolean);

      return {
        severity,
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: maxCol,
        message: messageParts.join('\n\n'),
        source: 'Severa SAST'
      };
    });

    monaco.editor.setModelMarkers(model, 'severa-sast', markers);
  }, [findings, code]);

  // Synchronize line highlights and gutter markers
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const newDecorations = [];
    const totalLines = model.getLineCount();

    (findings || []).forEach((f) => {
      const line = Math.max(1, Math.min(totalLines, Number(f.line) || 1));
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'severa-vuln-line',
          glyphMarginClassName: 'severa-vuln-glyph',
          hoverMessage: {
            value: `### 🚨 ${f.title || 'Security Finding'} [${f.id || 'CWE'}]\n\n${f.description || ''}\n\n**Severity:** \`${f.severity || 'CRITICAL'}\` | **CVSS:** \`${f.cvss || 'N/A'}\``
          }
        }
      });
    });

    (fixedLineNumbers || []).forEach((lineNum) => {
      const line = Math.max(1, Math.min(totalLines, Number(lineNum)));
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'severa-fixed-line',
          hoverMessage: {
            value: `### ✔ Security Patch Applied\n\nCode refactored and secured by Severa AI.`
          }
        }
      });
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [findings, fixedLineNumbers, code]);

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('toolbar', 'undo');
      editorRef.current.focus();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('toolbar', 'redo');
      editorRef.current.focus();
    }
  }, []);

  // Code input handler with File Extension Priority
  const handleCodeChange = (newCode, filename = '') => {
    setCode(newCode);

    const targetFile = filename || activeFilePath || '';
    const fileExtLang = getLanguageFromFilename(targetFile);

    if (fileExtLang) {
      // File extension locks the language mode to prevent foreign syntax from masking cross-language bugs
      setLanguage(fileExtLang);
      onScan(newCode, fileExtLang);
    } else if (autoDetectMode) {
      const detected = detectLanguage(newCode, targetFile);
      setLanguage(detected);
      onScan(newCode, detected);
    } else {
      onScan(newCode, language);
    }
  };

  // Preset Template Select Handler
  const handleTemplateSelect = (templateId) => {
    if (templateId === 'blank') {
      setCode('');
      onScan('', language);
      return;
    }

    const found = CODE_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setCode(found.code);
      setLanguage(found.language);
      setTimeout(() => onScan(found.code, found.language), 50);
    }
  };

  // Clipboard Paste Handler
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleCodeChange(text, activeFilePath);
      }
    } catch (err) {
      console.warn("Clipboard access declined:", err);
      alert("Please use Ctrl+V / Cmd+V inside the editor to paste your code.");
    }
  };

  // Handle GitHub Code Pull
  const handleLoadGithubCode = (pulledCode, detectedLang, filename, targetUrl) => {
    if (onGithubPull) {
      onGithubPull(pulledCode, detectedLang, filename, targetUrl);
    } else {
      setCode(pulledCode);
      setLanguage(detectedLang);
      onScan(pulledCode, detectedLang);
    }
  };

  return (
    <div className="flex gap-2 h-full">
      
      {/* File Explorer Sidebar */}
      {showSidebar && (
        <div style={{ width: `${fileTreeWidth}px` }} className="shrink-0 h-full relative group/tree">
          <FileTreeSidebar
            files={projectFiles}
            activeFilePath={activeFilePath}
            activeProjectName={activeProjectName}
            onToggleSidebar={() => setShowSidebar(false)}
            onSelectFile={onSelectFile}
            onUploadFolder={onUploadFolder}
            onUploadFiles={onUploadFiles}
          />

          {/* Draggable Resizer Handle for File Explorer (Min: 160px, Max: 360px) */}
          <div
            onMouseDown={handleFileTreeMouseDown}
            title="Drag to resize file explorer panel (Min: 160px, Max: 360px limit)"
            className="absolute -right-1.5 top-0 bottom-0 w-3 hover:w-3.5 bg-transparent hover:bg-slate-700/50 cursor-col-resize z-40 transition-all flex items-center justify-center group/resizer"
          >
            <div className="w-0.5 h-8 bg-slate-700 group-hover/resizer:bg-slate-400 rounded-full" />
          </div>
        </div>
      )}

      {/* Main Code Editor Box */}
      <div className="flex-1 bg-[#191C23] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl backdrop-blur-md">
        
        {/* Hidden File Input for Single File Upload */}
        <input
          type="file"
          ref={singleFileInputRef}
          onChange={onUploadFiles}
          accept=".py,.js,.jsx,.ts,.tsx,.java,.go,.dockerfile,.c,.cpp,.h,.sql,.json,.txt"
          className="hidden"
        />

        {/* Professional Editor Toolbar Header */}
        <div className="bg-[#12141a] px-3 sm:px-4 py-2 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          
          {/* Left Controls: Toggle Sidebar, Preset Templates & Language Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Toggle Project Explorer Sidebar Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                showSidebar ? 'bg-[#191C23] text-white border-white/20 shadow-sm' : 'bg-[#191C23] hover:bg-[#232732] text-slate-400 border-white/10'
              }`}
              title={showSidebar ? 'Hide Project Explorer' : 'Expand Project Explorer'}
            >
              <FolderTree className="w-3.5 h-3.5" />
            </button>

            {/* Language Selector with High-Contrast Styling */}
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                onScan(code, e.target.value);
              }}
              className="bg-[#191C23] border border-white/10 hover:border-white/20 rounded-lg text-xs text-slate-100 px-2.5 py-1 focus:outline-none uppercase font-semibold cursor-pointer"
            >
              <option value="python" className="bg-[#191C23] text-slate-100 font-semibold">Python</option>
              <option value="javascript" className="bg-[#191C23] text-slate-100 font-semibold">JavaScript / React</option>
              <option value="typescript" className="bg-[#191C23] text-slate-100 font-semibold">TypeScript / Node</option>
              <option value="java" className="bg-[#191C23] text-slate-100 font-semibold">Java / Spring</option>
              <option value="c" className="bg-[#191C23] text-slate-100 font-semibold">C / C++</option>
              <option value="csharp" className="bg-[#191C23] text-slate-100 font-semibold">C# / .NET</option>
              <option value="go" className="bg-[#191C23] text-slate-100 font-semibold">Go (Golang)</option>
              <option value="rust" className="bg-[#191C23] text-slate-100 font-semibold">Rust</option>
              <option value="php" className="bg-[#191C23] text-slate-100 font-semibold">PHP / Laravel</option>
              <option value="ruby" className="bg-[#191C23] text-slate-100 font-semibold">Ruby / Rails</option>
              <option value="shell" className="bg-[#191C23] text-slate-100 font-semibold">Shell / Bash</option>
              <option value="dockerfile" className="bg-[#191C23] text-slate-100 font-semibold">Dockerfile</option>
              <option value="yaml" className="bg-[#191C23] text-slate-100 font-semibold">YAML / K8s</option>
              <option value="sql" className="bg-[#191C23] text-slate-100 font-semibold">SQL</option>
            </select>

            {/* Auto-Detect Language Toggle Pill */}
            <button
              onClick={() => {
                const nextMode = !autoDetectMode;
                setAutoDetectMode(nextMode);
                if (nextMode) {
                  const fileExtLang = getLanguageFromFilename(activeFilePath);
                  const detected = fileExtLang || detectLanguage(code, activeFilePath);
                  setLanguage(detected);
                  onScan(code, detected);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                autoDetectMode
                  ? 'bg-[#191C23] text-emerald-400 border-emerald-500/30'
                  : 'bg-[#191C23] text-slate-400 border-white/10 hover:bg-[#232732]'
              }`}
              title="Toggle Automatic Language Detection"
            >
              <Wand2 className="w-3 h-3" />
              <span>Auto: {autoDetectMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Right Controls: Quick Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* Native Editor Undo Button */}
            <button
              onClick={handleUndo}
              title="Undo edits in editor (Ctrl+Z)"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-200 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Undo</span>
            </button>

            {/* Native Editor Redo Button */}
            <button
              onClick={handleRedo}
              title="Redo edits in editor (Ctrl+Y / Cmd+Shift+Z)"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-200 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Redo</span>
            </button>

            <button
              onClick={handlePasteCode}
              title="Paste Code from Clipboard"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-300 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Paste</span>
            </button>

            <button
              onClick={() => singleFileInputRef.current?.click()}
              title="Upload Single Code File"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-300 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">File</span>
            </button>

            <button
              onClick={() => onUploadFolder && onUploadFolder()}
              title="Upload Entire Directory / Folder"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-300 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Folder</span>
            </button>

            <button
              onClick={() => setShowGithubModal(true)}
              title="Pull Code from GitHub"
              className="flex items-center gap-1 bg-[#191C23] hover:bg-[#232732] text-slate-300 border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">GitHub</span>
            </button>

            <button
              onClick={() => handleCodeChange('')}
              title="Clear Scratchpad"
              className="p-1.5 bg-[#191C23] hover:bg-red-950/40 text-red-800 hover:text-red-400 border border-red-900/50 hover:border-red-500/60 rounded-lg text-xs transition-all cursor-pointer group shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-800 group-hover:text-red-400 transition-colors" />
            </button>

            {/* Primary Action: Scan Active File */}
            <button
              type="button"
              onClick={() => onScan(code, language)}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-200 text-black rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Run SAST Vulnerability Scan on Active File (Cmd + Enter)"
            >
              <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-black' : 'text-black fill-black'}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan File'}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Engine with True Syntax Highlighting, Minimap, and Inline Problem Squiggles */}
        <div className="relative flex-1 overflow-hidden bg-[#070a13] min-h-0">
          <Editor
            height="100%"
            language={MONACO_LANG_MAP[language] || language || 'javascript'}
            value={code}
            theme="severa-dark"
            onChange={(val) => handleCodeChange(val || '', activeFilePath)}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                <span>Loading Monaco Engine...</span>
              </div>
            }
            options={{
              minimap: { enabled: true, maxColumn: 80, scale: 0.8 },
              fontSize: 12.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              glyphMargin: true,
              folding: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'off',
              bracketPairColorization: { enabled: true },
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              renderLineHighlight: 'all',
              tabSize: 2,
              fixedOverflowWidgets: true
            }}
          />
        </div>

        {/* Footer Status Bar */}
        <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <span>{lineCount} lines | {code.length} chars</span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400 font-mono flex items-center gap-1">
              <Wand2 className="w-3 h-3" /> {language.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {findings.length === 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Code Clean (Severa AI Approved)
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> {findings.length} Vulnerable Line{findings.length > 1 ? 's' : ''} Flagged (Red Highlighted)
              </span>
            )}
          </div>
        </div>

        {/* GitHub Pull Modal */}
        <GitHubPullModal
          isOpen={showGithubModal}
          onClose={() => setShowGithubModal(false)}
          onLoadCode={handleLoadGithubCode}
        />
      </div>
    </div>
  );
}

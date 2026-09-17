import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CODE_TEMPLATES } from '../engine/templates';
import { 
  Play, 
  Sparkles, 
  Wand2,
  FolderSearch,
  CheckCircle2,
  AlertCircle,
  Check,
  CheckCheck,
  Undo2,
  Redo2,
  FolderTree,
  ClipboardPaste,
  Upload,
  FolderPlus,
  GitBranch,
  Trash2
} from 'lucide-react';
import { detectLanguage } from '../engine/languageDetector';
import GitHubPullModal from './GitHubPullModal';
import FileTreeSidebar from './FileTreeSidebar';

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
      // Strict min/max limit boundary: 160px min to 360px max
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
  const lineGutterRef = useRef(null);
  const highlightLayerRef = useRef(null);
  const textareaRef = useRef(null);

  const lines = code ? code.split('\n') : [''];
  const lineCount = lines.length;

  // Map findings by line number for line highlighting
  const findingsByLine = React.useMemo(() => {
    const map = {};
    findings.forEach((f) => {
      if (!map[f.line]) map[f.line] = [];
      map[f.line].push(f);
    });
    return map;
  }, [findings]);

  // Per-file Undo/Redo isolated history store
  const fileHistoriesRef = useRef({});
  const currentFileKey = activeFilePath || 'active_workspace_file';
  const [historyTick, setHistoryTick] = useState(0);

  // Sync active file code updates into file-isolated history stack
  useEffect(() => {
    if (code === undefined) return;
    const fileHist = fileHistoriesRef.current[currentFileKey];

    if (!fileHist) {
      fileHistoriesRef.current[currentFileKey] = {
        stack: [code],
        index: 0
      };
      setHistoryTick((t) => t + 1);
      return;
    }

    const currentCodeInStack = fileHist.stack[fileHist.index];
    if (code !== currentCodeInStack) {
      const truncatedStack = fileHist.stack.slice(0, fileHist.index + 1);
      truncatedStack.push(code);
      if (truncatedStack.length > 100) truncatedStack.shift();

      fileHistoriesRef.current[currentFileKey] = {
        stack: truncatedStack,
        index: Math.min(fileHist.index + 1, truncatedStack.length - 1)
      };
      setHistoryTick((t) => t + 1);
    }
  }, [code, currentFileKey]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const hist = fileHistoriesRef.current[currentFileKey];
    setCanUndo(hist ? hist.index > 0 : false);
    setCanRedo(hist ? hist.index < hist.stack.length - 1 : false);
  }, [currentFileKey, historyTick]);

  const handleUndo = useCallback(() => {
    const hist = fileHistoriesRef.current[currentFileKey];
    if (hist && hist.index > 0) {
      const prevIdx = hist.index - 1;
      const prevCode = hist.stack[prevIdx];
      hist.index = prevIdx;
      setHistoryTick((t) => t + 1);

      setCode(prevCode);
      if (autoDetectMode) {
        const detected = detectLanguage(prevCode, currentFileKey);
        setLanguage(detected);
        onScan(prevCode, detected);
      } else {
        onScan(prevCode, language);
      }
    }
  }, [currentFileKey, setCode, autoDetectMode, setLanguage, onScan, language]);

  const handleRedo = useCallback(() => {
    const hist = fileHistoriesRef.current[currentFileKey];
    if (hist && hist.index < hist.stack.length - 1) {
      const nextIdx = hist.index + 1;
      const nextCode = hist.stack[nextIdx];
      hist.index = nextIdx;
      setHistoryTick((t) => t + 1);

      setCode(nextCode);
      if (autoDetectMode) {
        const detected = detectLanguage(nextCode, currentFileKey);
        setLanguage(detected);
        onScan(nextCode, detected);
      } else {
        onScan(nextCode, language);
      }
    }
  }, [currentFileKey, setCode, autoDetectMode, setLanguage, onScan, language]);

  const handleKeyDown = (e) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (modifier && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      e.stopPropagation();
      handleRedo();
    }
  };

  // Code input handler with Auto Language Detection
  const handleCodeChange = (newCode, filename = '') => {
    setCode(newCode);

    if (autoDetectMode) {
      const detected = detectLanguage(newCode, filename);
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
        handleCodeChange(text);
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
            className="absolute -right-1.5 top-0 bottom-0 w-3 hover:w-3.5 bg-transparent hover:bg-indigo-500/50 cursor-col-resize z-40 transition-all flex items-center justify-center group/resizer"
          >
            <div className="w-0.5 h-8 bg-slate-700 group-hover/resizer:bg-indigo-300 rounded-full" />
          </div>
        </div>
      )}

      {/* Main Code Editor Box */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl backdrop-blur-md">
        
        {/* Hidden File Input for Single File Upload */}
        <input
          type="file"
          ref={singleFileInputRef}
          onChange={onUploadFiles}
          accept=".py,.js,.jsx,.ts,.tsx,.java,.go,.dockerfile,.c,.cpp,.h,.sql,.json,.txt"
          className="hidden"
        />

        {/* Professional Editor Toolbar Header */}
        <div className="bg-[#0c0e15] px-3 sm:px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          
          {/* Left Controls: Toggle Sidebar, Preset Templates & Language Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Toggle Project Explorer Sidebar Button (ALWAYS VISIBLE) */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                showSidebar ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-sm' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
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
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-100 px-2.5 py-1 focus:outline-none uppercase font-semibold cursor-pointer"
            >
              <option value="python" className="bg-slate-900 text-slate-100 font-semibold">Python</option>
              <option value="javascript" className="bg-slate-900 text-slate-100 font-semibold">JavaScript / React</option>
              <option value="typescript" className="bg-slate-900 text-slate-100 font-semibold">TypeScript / Node</option>
              <option value="java" className="bg-slate-900 text-slate-100 font-semibold">Java / Spring</option>
              <option value="c" className="bg-slate-900 text-slate-100 font-semibold">C / C++</option>
              <option value="csharp" className="bg-slate-900 text-slate-100 font-semibold">C# / .NET</option>
              <option value="go" className="bg-slate-900 text-slate-100 font-semibold">Go (Golang)</option>
              <option value="rust" className="bg-slate-900 text-slate-100 font-semibold">Rust</option>
              <option value="php" className="bg-slate-900 text-slate-100 font-semibold">PHP / Laravel</option>
              <option value="ruby" className="bg-slate-900 text-slate-100 font-semibold">Ruby / Rails</option>
              <option value="shell" className="bg-slate-900 text-slate-100 font-semibold">Shell / Bash</option>
              <option value="dockerfile" className="bg-slate-900 text-slate-100 font-semibold">Dockerfile</option>
              <option value="yaml" className="bg-slate-900 text-slate-100 font-semibold">YAML / K8s</option>
              <option value="sql" className="bg-slate-900 text-slate-100 font-semibold">SQL</option>
            </select>

            {/* Auto-Detect Language Toggle Pill */}
            <button
              onClick={() => {
                const nextMode = !autoDetectMode;
                setAutoDetectMode(nextMode);
                if (nextMode) {
                  const detected = detectLanguage(code);
                  setLanguage(detected);
                  onScan(code, detected);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                autoDetectMode
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
              title="Toggle Automatic Language Detection"
            >
              <Wand2 className="w-3 h-3" />
              <span>Auto: {autoDetectMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Right Controls: Quick Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* File-Isolated Undo Button */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo edits in current file (Ctrl+Z)"
              className={`flex items-center gap-1 border px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                canUndo
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Undo</span>
            </button>

            {/* File-Isolated Redo Button */}
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo edits in current file (Ctrl+Y)"
              className={`flex items-center gap-1 border px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                canRedo
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
              }`}
            >
              <Redo2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Redo</span>
            </button>

            <button
              onClick={handlePasteCode}
              title="Paste Code from Clipboard"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Paste</span>
            </button>

            <button
              onClick={() => singleFileInputRef.current?.click()}
              title="Upload Single Code File"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">File</span>
            </button>

            <button
              onClick={() => onUploadFolder && onUploadFolder()}
              title="Upload Entire Directory / Folder"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Folder</span>
            </button>

            <button
              onClick={() => setShowGithubModal(true)}
              title="Pull Code from GitHub"
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">GitHub</span>
            </button>

            <button
              onClick={() => handleCodeChange('')}
              title="Clear Scratchpad"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Scan Active File Button */}
            <button
              type="button"
              onClick={() => onScan(code, language)}
              disabled={isScanning}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isScanning
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30 shadow-sm shadow-indigo-950/40'
              } disabled:opacity-50`}
              title="Run SAST Vulnerability Scan on Active File"
            >
              <Play className={`w-3 h-3 ${isScanning ? 'animate-spin text-indigo-300' : 'text-white fill-white'}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan File'}</span>
            </button>

            {/* Scan Full Project Folder Button */}
            {onScanFullProject && (
              <button
                type="button"
                onClick={() => onScanFullProject()}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
                title="Scan all files in active project folder"
              >
                <FolderSearch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Scan Full Project</span>
              </button>
            )}

            {/* Apply Correct Code Button (Active File) */}
            {aiReviewData?.fixedCode && onApplyFix && (
              <button
                onClick={() => onApplyFix(aiReviewData.fixedCode)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer border border-emerald-500/30"
                title="Apply AI Refactored Secure Code to Active File"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Apply Active File</span>
              </button>
            )}

            {/* Apply Fix to All Folder Files Button */}
            {onApplyFixAll && (
              <button
                onClick={() => onApplyFixAll()}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
                title="Apply AI Security Fixes Across ALL Files in Project Folder"
              >
                <CheckCheck className="w-3.5 h-3.5 text-white" />
                <span>{isAiLoading ? 'Fixing All...' : 'Apply Fix to All Folder Files'}</span>
              </button>
            )}

            {/* Generate AI Fix (when fix not yet generated) */}
            {!aiReviewData?.fixedCode && !onApplyFixAll && (
              <button
                onClick={() => onGenerateAiFix()}
                disabled={isAiLoading || findings.length === 0}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Fixing...' : 'AI Fix'}</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Grade Editor Container with Synchronized Line Numbers & Highlight Layer */}
        <div className="relative flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs leading-relaxed min-h-0">
          
          {/* Custom Editor Display Layer (Line Highlights + Gutter) */}
          <div className="w-full h-full flex flex-1 overflow-hidden">
            
            {/* Line Gutter & Status Badges */}
            <div 
              ref={lineGutterRef}
              onWheel={(e) => {
                if (textareaRef.current) {
                  textareaRef.current.scrollTop += e.deltaY;
                }
              }}
              className="sticky left-0 top-0 select-none bg-slate-950 border-r border-slate-800/80 text-slate-600 text-right py-3 px-2.5 min-w-[52px] font-mono shrink-0 z-20 h-full overflow-hidden"
            >
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const lineFindings = findingsByLine[lineNum] || [];
                const isVulnerable = lineFindings.length > 0;
                const isFixedLine = fixedLineNumbers.includes(lineNum);

                return (
                  <div key={lineNum} className="relative flex items-center justify-between h-5">
                    <span className={`text-[11px] ${
                      isVulnerable ? 'text-rose-300 font-black bg-rose-500/25 px-1 rounded' : isFixedLine ? 'text-emerald-300 font-black bg-emerald-500/25 px-1 rounded' : 'text-slate-600 font-semibold'
                    }`}>
                      {lineNum}
                    </span>
                    {isVulnerable && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/90 animate-pulse ml-1 inline-block shrink-0" title="Vulnerability Flagged (Red)" />
                    )}
                    {!isVulnerable && isFixedLine && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500/90 ml-1 inline-block shrink-0" title="Security Patch Applied (Green)" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Code Textarea & Highlight Background Layer */}
            <div className="relative flex-1 w-full h-full min-w-0 overflow-hidden">
              
              {/* Background Highlight Rows for ONLY Vulnerable Lines (RED) and ONLY Fixed Lines (GREEN) */}
              <div 
                ref={highlightLayerRef}
                className="absolute inset-0 pointer-events-none py-3 font-mono text-xs leading-5 z-0 overflow-hidden"
              >
                {lines.map((_, i) => {
                  const lineNum = i + 1;
                  const lineFindings = findingsByLine[lineNum] || [];
                  const isVulnerable = lineFindings.length > 0;
                  const isFixedLine = fixedLineNumbers.includes(lineNum);

                  return (
                    <div
                      key={lineNum}
                      className={`h-5 w-full transition-colors ${
                        isVulnerable
                          ? 'bg-rose-500/20 border-l-4 border-rose-500 shadow-[inset_0_0_14px_rgba(244,63,94,0.25)]'
                          : isFixedLine
                          ? 'bg-emerald-500/20 border-l-4 border-emerald-500 shadow-[inset_0_0_14px_rgba(16,185,129,0.25)]'
                          : ''
                      }`}
                    />
                  );
                })}
              </div>

              {/* Editable Textarea overlay */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={(e) => {
                  const { scrollTop, scrollLeft } = e.target;
                  if (lineGutterRef.current) lineGutterRef.current.scrollTop = scrollTop;
                  if (highlightLayerRef.current) {
                    highlightLayerRef.current.scrollTop = scrollTop;
                    highlightLayerRef.current.scrollLeft = scrollLeft;
                  }
                }}
                placeholder="Paste or type your source code here to analyze with Severa AI..."
                spellCheck={false}
                className="relative z-10 w-full h-full bg-transparent text-slate-100 py-3 px-3 font-mono text-xs leading-5 resize-none focus:outline-none whitespace-pre overflow-auto custom-scrollbar selection:bg-cyan-500/30"
              />
            </div>

          </div>
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

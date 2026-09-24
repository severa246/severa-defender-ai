import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, ShieldCheck, Edit2, Check, X, Terminal,
  Folder, FileCode, ChevronRight, ChevronDown, FileText, Cloud
} from 'lucide-react';

export default function TopHeaderBar({
  activeSession,
  onRenameSession,
  selectedProvider,
  selectedModel,
  apiKey = '',
  customEndpoint = '',
  activeProjectName = 'ai project',
  activeFileName = 'main.py',
  projectFolders = [],
  onSelectProjectFile,
  onOpenReport,
  onOpenDefender,
  onOpenSandbox,
  onScanFullProject,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(activeSession?.name || 'Vulnerability Detection Audit');
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  const folderMenuRef = useRef(null);
  const fileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
        setIsFolderMenuOpen(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTitle(activeSession?.name || 'Vulnerability Detection Audit');
  }, [activeSession]);

  const handleSave = () => {
    if (title.trim() && activeSession && onRenameSession) {
      onRenameSession(activeSession.id, title.trim());
    }
    setIsEditing(false);
  };

  // Find active project object & files list
  const activeProj = projectFolders.find((p) => p.name === activeProjectName) || {
    name: activeProjectName,
    files: [{ name: activeFileName }]
  };
  const activeProjFiles = activeProj.files && activeProj.files.length > 0
    ? activeProj.files
    : [{ name: activeFileName }];

  return (
    <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-2 bg-[#090b10] border-b border-slate-800/80 w-full select-none gap-2">

      {/* Left: Breadcrumbs & Active Conversation Session Title */}
      <div className="flex items-center gap-2.5 text-xs min-w-0 flex-wrap">
        
        {/* Breadcrumb with Interactive Dropdowns for Projects & Multi-Files */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          
          {/* Project Folder Dropdown Selector */}
          <div className="relative" ref={folderMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsFolderMenuOpen((prev) => !prev);
                setIsFileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer group"
              title="Click to select workspace project folder"
            >
              <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {activeProjectName}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isFolderMenuOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>

            {/* Folder Dropdown Menu */}
            {isFolderMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#0e111a] border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>Workspace Projects</span>
                  <span className="text-indigo-400">{projectFolders.length || 1}</span>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
                  {(projectFolders.length > 0 ? projectFolders : [{ name: activeProjectName, files: [{ name: activeFileName }] }]).map((proj) => {
                    const isSelected = proj.name === activeProjectName;
                    const firstFile = proj.files?.[0]?.name || 'main.py';
                    return (
                      <button
                        key={proj.id || proj.name}
                        type="button"
                        onClick={() => {
                          if (onSelectProjectFile) {
                            onSelectProjectFile(proj.name, firstFile);
                          }
                          setIsFolderMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer text-left ${
                          isSelected ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="truncate">{proj.name}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

          {/* File Dropdown Selector */}
          <div className="relative" ref={fileMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsFileMenuOpen((prev) => !prev);
                setIsFolderMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer group"
              title="Click to select file in project"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {activeFileName}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isFileMenuOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>

            {/* File Dropdown Menu */}
            {isFileMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0e111a] border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>Files in {activeProjectName}</span>
                  <span className="text-indigo-400">{activeProjFiles.length}</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
                  {activeProjFiles.map((fileObj, idx) => {
                    const fName = typeof fileObj === 'string' ? fileObj : fileObj.name;
                    const isSelected = fName === activeFileName;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (onSelectProjectFile) {
                            onSelectProjectFile(activeProjectName, fName);
                          }
                          setIsFileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer text-left ${
                          isSelected ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="truncate">{fName}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cloud Auto-Synced Real-time Badge */}
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium"
            title="Real-time Cloud Auto-Save active: All workspace files, folders, and history automatically sync to your Gmail cloud session across devices"
          >
            <Cloud className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Cloud Auto-Synced</span>
          </div>

        </div>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Conversation Title Editable */}
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />

          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                autoFocus
                className="bg-slate-900 text-slate-100 px-2 py-0.5 text-xs rounded border border-indigo-500/50 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="p-0.5 text-emerald-400 hover:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-0.5 text-slate-400 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer min-w-0" onClick={() => setIsEditing(true)}>
              <h2 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                {activeSession?.name || 'Vulnerability Detection Audit'}
              </h2>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Engine badge + Action buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-xs shrink-0 flex-wrap">
        {(() => {
          const hasCloudKey = Boolean(apiKey && apiKey.trim());
          const isLocalProvider = selectedProvider === 'ollama' || selectedProvider === 'local' || Boolean(customEndpoint && customEndpoint.trim());
          
          let hasActiveEngine = false;
          let engineBadgeText = 'NO API KEY CONNECTED / NO LOCAL MODEL';

          if (hasCloudKey) {
            hasActiveEngine = true;
            const provName = selectedProvider ? selectedProvider : 'CLOUD AI';
            const modelName = selectedModel ? ` (${selectedModel})` : '';
            engineBadgeText = `${provName}${modelName}`;
          } else if (isLocalProvider) {
            hasActiveEngine = true;
            const provName = selectedProvider ? selectedProvider : 'LOCAL ENGINE';
            const modelName = selectedModel ? ` (${selectedModel})` : '';
            engineBadgeText = `${provName}${modelName} (LOCAL ENGINE CONNECTED)`;
          }

          return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border ${
              !hasActiveEngine ? 'border-amber-500/30 text-amber-300' : 'border-slate-800 text-slate-300'
            } text-[11px]`}>
              <Terminal className={`w-3 h-3 ${!hasActiveEngine ? 'text-amber-400' : 'text-indigo-400'}`} />
              <span className="text-slate-400 hidden md:inline">Engine:</span>
              <span className={`font-semibold uppercase ${!hasActiveEngine ? 'text-amber-400' : 'text-indigo-300'}`}>
                {engineBadgeText}
              </span>
            </span>
          );
        })()}

        {/* Scan Full Project Button */}
        {onScanFullProject && (
          <button
            onClick={onScanFullProject}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Scan all project files in active folder"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Scan Full Project</span>
          </button>
        )}

        {/* Severa Defender AI Button */}
        <button
          onClick={() => onOpenDefender && onOpenDefender(null)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-950/50 transition-all cursor-pointer border border-indigo-500/30"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-100" />
          <span>Severa Defender AI</span>
        </button>

        {/* Attack Payload Sandbox Simulator Button */}
        {onOpenSandbox && (
          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Open Interactive Attack Payload Sandbox Simulator"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Attack Sandbox</span>
          </button>
        )}

        {/* Generate Audit Report button */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Generate Audit Report</span>
        </button>
      </div>
    </div>
  );
}

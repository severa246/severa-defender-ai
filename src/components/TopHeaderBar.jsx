import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Edit2, Check, X,
  Folder, FileCode, ChevronRight, ChevronDown, FileText, Cloud,
  Search, Download
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
  onScanFullProject,
  onOpenCommandPalette,
  onExportSarif,
  onExportWorkflow,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(activeSession?.name || 'Vulnerability Detection Audit');
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const folderMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
        setIsFolderMenuOpen(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setIsFileMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTitle(activeSession?.name || (activeProjectName ? `${activeProjectName} • Security Audit` : 'Vulnerability Detection Audit'));
  }, [activeSession, activeProjectName]);

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

      {/* Right: 3 Clean Enterprise Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-xs shrink-0">
        {/* 1. Spotlight Command Palette Trigger (Cmd+K) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0e121d] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] hover:border-white/[0.16] rounded-lg text-xs font-medium transition-all cursor-pointer group shadow-sm"
            title="Open Command Palette (Cmd + K / Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline text-slate-300 group-hover:text-white">Spotlight</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              ⌘K
            </span>
          </button>
        )}

        {/* 2. Scan Full Project Button */}
        {onScanFullProject && (
          <button
            onClick={onScanFullProject}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0e121d] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-lg text-xs font-medium transition-all cursor-pointer group shadow-sm"
            title="Scan all project files in active folder"
          >
            <Folder className="w-3.5 h-3.5 text-sky-400 group-hover:text-sky-300 transition-colors" />
            <span className="hidden sm:inline">Scan Project</span>
          </button>
        )}

        {/* 3. Export Report (Consolidated Dropdown) */}
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0e121d] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-lg text-xs font-medium transition-all cursor-pointer group shadow-sm"
            title="Export Security Compliance Artifacts"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span>Export</span>
            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#0e111a] border border-white/[0.1] rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/[0.06] mb-1">
                Export & Compliance Artifacts
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportSarif) onExportSarif();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors group cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                    OASIS SARIF 2.1.0 <span className="text-[10px] font-mono text-cyan-400">.sarif</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Standard format for GitHub Code Scanning & CI/CD
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onOpenReport) onOpenReport();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                    CISO Security Audit Report
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Executive report with cryptographic SHA-256 seal
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportWorkflow) onExportWorkflow();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors group cursor-pointer border-t border-white/[0.04]"
              >
                <Download className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                    GitHub Actions CI/CD <span className="text-[10px] font-mono text-purple-400">.yml</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Automated pipeline security gate configuration
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

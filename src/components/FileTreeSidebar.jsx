import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, Upload, FolderTree, CheckCircle2, ChevronRight } from 'lucide-react';
import { buildFileTree, getNodeFindingsSummary } from '../utils/fileTreeBuilder';

function TreeNode({ node, level = 0, activeFilePath, onSelectFile, expandedFolders, toggleFolder }) {
  if (node.isFolder) {
    const isExpanded = expandedFolders[node.path] !== false; // Default expanded
    const summary = getNodeFindingsSummary(node);

    return (
      <div className="select-none">
        <div
          onClick={() => toggleFolder(node.path)}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 transition-colors cursor-pointer group text-[11px]"
        >
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
            <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-cyan-400' : 'text-slate-500'}`} />
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
            )}
            <span className="truncate font-bold text-slate-200 group-hover:text-cyan-300">{node.name}</span>
          </div>

          {summary.total > 0 && (
            <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold shrink-0 ml-1 ${
              summary.critical > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {summary.total} flaw{summary.total > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isExpanded && node.children && (
          <div className="space-y-0.5 mt-0.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                activeFilePath={activeFilePath}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File Node
  const file = node.file;
  const isActive = file.path === activeFilePath || file.name === activeFilePath;
  const criticals = file.findings?.filter((f) => f.severity === 'CRITICAL').length || 0;
  const totalFlaws = file.findings?.length || 0;

  return (
    <div
      onClick={() => onSelectFile(file)}
      style={{ marginLeft: `${level * 12 + 8}px` }}
      className={`flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span className="truncate text-[11px]" title={file.path || file.name}>
          {node.name}
        </span>
      </div>

      {/* Vulnerability status badge per file */}
      <div className="shrink-0 ml-1">
        {totalFlaws > 0 ? (
          <span
            className={`px-1.5 py-0.2 text-[9px] rounded-full font-extrabold font-mono ${
              criticals > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {totalFlaws} flaw{totalFlaws > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Clean
          </span>
        )}
      </div>
    </div>
  );
}

export default function FileTreeSidebar({ 
  files = [], 
  activeFilePath, 
  activeProjectName = '',
  onToggleSidebar,
  onSelectFile, 
  onUploadFolder, 
  onUploadFiles 
}) {
  const folderInputRef = React.useRef(null);
  const filesInputRef = React.useRef(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: prev[folderPath] === false ? true : false
    }));
  };

  const fileTree = React.useMemo(() => {
    return buildFileTree(files, activeProjectName);
  }, [files, activeProjectName]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col h-full shadow-xl space-y-3">
      
      {/* Hidden File & Folder Inputs */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={onUploadFolder}
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={filesInputRef}
        onChange={onUploadFiles}
        multiple
        accept=".py,.js,.jsx,.ts,.tsx,.java,.go,.dockerfile,.c,.cpp,.h,.sql,.json,.txt"
        className="hidden"
      />

      {/* Header & Upload Buttons */}
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
              title="Hide / Expand Project Explorer"
            >
              <FolderTree className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider truncate" title={activeProjectName || 'PROJECT EXPLORER'}>
                {activeProjectName || 'PROJECT EXPLORER'}
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
            {files.length} {files.length === 1 ? 'File' : 'Files'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center justify-center gap-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Upload Folder</span>
          </button>

          <button
            onClick={() => filesInputRef.current?.click()}
            className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Files</span>
          </button>
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs custom-scrollbar">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 space-y-2">
            <Folder className="w-8 h-8 opacity-40 text-cyan-400" />
            <p className="text-[11px] text-slate-400">No folder loaded</p>
            <p className="text-[10px] text-slate-600 max-w-[150px]">Upload a code directory to view multi-file security tree.</p>
          </div>
        ) : (
          fileTree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              level={0}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))
        )}
      </div>
    </div>
  );
}


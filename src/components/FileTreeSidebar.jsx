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
          className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/5 text-slate-300 transition-colors cursor-pointer group text-[11px]"
        >
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
            <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-emerald-400' : 'text-slate-500'}`} />
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
            )}
            <span className="truncate font-bold text-slate-200 group-hover:text-white">{node.name}</span>
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
          ? 'bg-[#12141a] border-emerald-500/50 text-white font-bold shadow-md shadow-black/40'
          : 'bg-[#12141a]/60 hover:bg-[#12141a] border-white/5 hover:border-white/10 text-slate-300 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
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
    <div className="bg-[#191C23] border border-white/10 rounded-2xl p-3 flex flex-col h-full shadow-2xl space-y-3">
      
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
      <div className="pb-2 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg bg-[#12141a] hover:bg-[#20242f] text-emerald-400 hover:text-emerald-300 border border-white/10 transition-colors shrink-0 cursor-pointer"
              title="Hide / Expand Project Explorer"
            >
              <FolderTree className="w-3.5 h-3.5" />
            </button>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider truncate" title={activeProjectName || 'PROJECT EXPLORER'}>
                {activeProjectName || 'PROJECT EXPLORER'}
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-[#12141a] text-slate-300 font-mono px-2 py-0.5 rounded-md border border-white/10 shrink-0 font-semibold">
            {files.length} {files.length === 1 ? 'File' : 'Files'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 bg-[#12141a] hover:bg-[#20242f] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Folder className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Folder</span>
          </button>

          <button
            onClick={() => filesInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 bg-[#12141a] hover:bg-[#20242f] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Add Files</span>
          </button>
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs custom-scrollbar">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 space-y-2">
            <Folder className="w-8 h-8 opacity-40 text-emerald-400" />
            <p className="text-[11px] text-slate-400">No folder loaded</p>
            <p className="text-[10px] text-slate-500 max-w-[150px]">Upload a code directory to view multi-file security tree.</p>
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

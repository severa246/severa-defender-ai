import React from 'react';
import { FileCode, FolderTree, X, Upload } from 'lucide-react';

export default function UploadChoiceModal({
  isOpen,
  onClose,
  onSelectUploadFiles,
  onSelectUploadFolder,
  targetProjectName = 'Project'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400">
            <Upload className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100">Upload Source Code</h3>
          </div>
          <p className="text-xs text-slate-400">
            Target Project: <span className="font-mono text-cyan-300 font-bold">{targetProjectName}</span>
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 gap-3">
          
          {/* Choice 1: Upload File(s) */}
          <button
            onClick={() => {
              onClose();
              onSelectUploadFiles();
            }}
            className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                Upload File(s)
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Select individual code files (.py, .js, .jsx, .ts, .java, .cpp, .go, Dockerfile, etc.)
              </p>
            </div>
          </button>

          {/* Choice 2: Upload Entire Folder */}
          <button
            onClick={() => {
              onClose();
              onSelectUploadFolder();
            }}
            className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Upload Entire Folder
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Select a directory from your system to import all nested code files recursively.
              </p>
            </div>
          </button>

        </div>

        {/* Footer Note */}
        <div className="text-[10px] text-slate-500 text-center font-mono pt-1 border-t border-slate-800/80">
          All files are analyzed locally with instant SAST static analysis.
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  FolderSearch, 
  Download, 
  Sparkles, 
  FileCode, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  PackageCheck, 
  Activity, 
  X,
  CornerDownLeft,
  ArrowRight,
  FolderDown
} from 'lucide-react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onScanFile,
  onScanProject,
  onExportSarif,
  onExportWorkflow,
  onDownloadFixedFolder,
  onOpenDefender,
  onGenerateAiFix,
  findings = [],
  onSelectFinding,
  onSwitchTab,
  projectFiles = [],
  onSelectFile
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };
      focusInput();
      requestAnimationFrame(focusInput);
      const t1 = setTimeout(focusInput, 30);
      const t2 = setTimeout(focusInput, 100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  // Build command items list
  const baseActions = [
    {
      id: 'scan-file',
      category: 'Analysis',
      title: 'Scan Active File',
      subtitle: 'Run AST pattern & data-flow taint analysis on active editor file',
      shortcut: 'Cmd + Enter',
      icon: Play,
      action: () => { onScanFile && onScanFile(); onClose(); }
    },
    {
      id: 'scan-project',
      category: 'Analysis',
      title: 'Scan Full Project Folder',
      subtitle: 'Deep scan all files in current workspace folder',
      shortcut: 'Shift + Enter',
      icon: FolderSearch,
      action: () => { onScanProject && onScanProject(); onClose(); }
    },
    {
      id: 'open-defender',
      category: 'Remediation',
      title: 'Open Severa Defender AI Copilot',
      subtitle: 'Contextual AI security assistant for exploit analysis and code review',
      shortcut: 'Cmd + /',
      icon: Sparkles,
      action: () => { onOpenDefender && onOpenDefender(); onClose(); }
    },
    {
      id: 'generate-fix',
      category: 'Remediation',
      title: 'Generate Enterprise Security Patch',
      subtitle: 'Synthesize automated refactoring patch for all detected flaws',
      shortcut: 'Cmd + P',
      icon: Sparkles,
      action: () => { onGenerateAiFix && onGenerateAiFix(); onClose(); }
    },
    {
      id: 'export-sarif',
      category: 'Export & Compliance',
      title: 'Export SARIF 2.1.0 Report (.sarif)',
      subtitle: 'Download OASIS SARIF report for GitHub Code Scanning and SonarQube',
      shortcut: 'Cmd + S',
      icon: Download,
      action: () => { onExportSarif && onExportSarif(); onClose(); }
    },
    {
      id: 'download-fixed-folder',
      category: 'Export & Compliance',
      title: 'Download Fixed Working Folder (.zip)',
      subtitle: 'Download clean, remediated project codebase as a standard ZIP archive',
      shortcut: 'Cmd + Shift + D',
      icon: FolderDown,
      action: () => { onDownloadFixedFolder && onDownloadFixedFolder(); onClose(); }
    },
    {
      id: 'export-workflow',
      category: 'Export & Compliance',
      title: 'Export GitHub Actions CI/CD Workflow (.yml)',
      subtitle: 'Generate automated security gate pipeline for GitHub Actions',
      icon: Download,
      action: () => { onExportWorkflow && onExportWorkflow(); onClose(); }
    },
    {
      id: 'nav-sca',
      category: 'Navigation',
      title: 'Open SCA Dependencies Scanner',
      subtitle: 'Query Google OSV.dev database for third-party CVEs',
      icon: PackageCheck,
      action: () => { onSwitchTab && onSwitchTab('sca'); onClose(); }
    },
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Open Executive Security Dashboard',
      subtitle: 'Review OWASP compliance matrices and security posture',
      icon: Layers,
      action: () => { onSwitchTab && onSwitchTab('dashboard'); onClose(); }
    }
  ];

  // Dynamic findings items
  const findingActions = findings.map((f, idx) => ({
    id: `finding-${f.id || idx}`,
    category: 'Active Flaws',
    title: `Jump to ${f.cwe || 'Flaw'}: ${f.title}`,
    subtitle: `Line ${f.line} • ${f.severity} (CVSS ${f.cvssScore || '8.5'})`,
    icon: ShieldAlert,
    severity: f.severity,
    action: () => {
      if (onSelectFinding) onSelectFinding(f);
      onClose();
    }
  }));

  // Dynamic files items
  const fileActions = projectFiles.map((file) => ({
    id: `file-${file.path}`,
    category: 'Workspace Files',
    title: `Open ${file.name}`,
    subtitle: `${file.path} (${file.findings?.length || 0} flaws)`,
    icon: FileCode,
    action: () => {
      if (onSelectFile) onSelectFile(file);
      onClose();
    }
  }));

  const allItems = [...baseActions, ...findingActions, ...fileActions];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0c101a] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[580px] text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#090D16]">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, jump to a flaw, or search workspace... (Cmd+K)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
              ESC
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar flex-1 min-h-[280px]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching commands or findings found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                      : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-md ${
                      isSelected ? 'bg-white text-black' : 'bg-white/[0.06] text-slate-300'
                    }`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100 truncate">{item.title}</span>
                        {item.category && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-[#090D16] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
          </div>
          <span>Severa Spotlight</span>
        </div>
      </div>
    </div>
  );
}

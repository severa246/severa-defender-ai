import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Code2, 
  GitPullRequest, 
  LayoutDashboard, 
  PackageCheck, 
  Sliders, 
  Cpu, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose,
  PanelLeftOpen,
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Folder, 
  FolderOpen, 
  Filter, 
  FolderPlus,
  Search,
  FilePlus,
  Upload,
  FileCode,
  LogOut
} from 'lucide-react';
import UploadChoiceModal from './UploadChoiceModal';
import { buildFileTree } from '../utils/fileTreeBuilder';

function ProjectTreeNode({
  node,
  level = 0,
  p,
  editingFileKey,
  editingFileName,
  setEditingFileName,
  setEditingFileKey,
  startRenameFile,
  saveRenameFile,
  handleDeleteFileInProjectFolder,
  handleProjectClick
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (node.isFolder) {
    return (
      <div className="space-y-0.5 select-none">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ paddingLeft: `${level * 10 + 4}px` }}
          className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-slate-900 text-[10px] font-bold text-slate-300 hover:text-cyan-400 cursor-pointer"
        >
          <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-cyan-400' : 'text-slate-500'}`} />
          {isExpanded ? <FolderOpen className="w-3 h-3 text-cyan-400 shrink-0" /> : <Folder className="w-3 h-3 text-slate-400 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </div>

        {isExpanded && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <ProjectTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                p={p}
                editingFileKey={editingFileKey}
                editingFileName={editingFileName}
                setEditingFileName={setEditingFileName}
                setEditingFileKey={setEditingFileKey}
                startRenameFile={startRenameFile}
                saveRenameFile={saveRenameFile}
                handleDeleteFileInProjectFolder={handleDeleteFileInProjectFolder}
                handleProjectClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const fileObj = node.file;
  const fileIdx = (p.files || []).findIndex((f) => (f.path || f.name) === fileObj.path || f.name === fileObj.name || f.name === node.name);
  const targetIdx = fileIdx >= 0 ? fileIdx : 0;
  const fileKey = `${p.id}-${targetIdx}`;
  const isEditingFile = editingFileKey === fileKey;

  return (
    <div
      style={{ paddingLeft: `${level * 10 + 8}px` }}
      onClick={() => handleProjectClick(p, fileObj)}
      className="flex items-center justify-between p-1 rounded hover:bg-slate-900/80 hover:text-cyan-300 cursor-pointer group/file text-[10px]"
    >
      {isEditingFile ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            saveRenameFile(p, targetIdx);
          }}
          className="flex items-center gap-1 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editingFileName}
            onChange={(e) => setEditingFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingFileKey(null);
            }}
            autoFocus
            className="flex-1 bg-slate-950 border border-cyan-500 rounded px-1 py-0.5 text-[10px] text-slate-100 focus:outline-none font-mono"
          />
          <button type="submit" className="p-0.5 text-emerald-400">
            <Check className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => setEditingFileKey(null)} className="p-0.5 text-slate-400">
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className="w-3 h-3 text-cyan-400/80 shrink-0" />
            <span className="truncate text-slate-300" title={fileObj.path || fileObj.name}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRenameFile(p.id, targetIdx, fileObj);
              }}
              className="opacity-0 group-hover/file:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition-opacity"
              title={`Rename file "${node.name}"`}
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFileInProjectFolder(p, targetIdx);
              }}
              className="opacity-0 group-hover/file:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity"
              title={`Delete file "${node.name}"`}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>

            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          </div>
        </>
      )}
    </div>
  );
}


export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  scanMetrics, 
  onOpenReport: _onOpenReport, 
  onOpenModelsModal,
  selectedProvider = 'google',
  selectedModel = 'gemini-1.5-flash',
  apiKey = '',
  customEndpoint = '',
  scanSessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  projectFolders: propProjectFolders,
  setProjectFolders: propSetProjectFolders,
  onSelectProjectSample,
  onSelectProjectFile,
  onCreateBlankProject,
  onCreateFileInProject,
  onUploadFileToProject,
  onRenameProject,
  onDeleteProject,
  onRenameFileInProject,
  onDeleteFileInProject,
  user,
  onLogout,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const isDraggingSidebar = useRef(false);

  const handleSidebarMouseDown = (e) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvt) => {
      if (!isDraggingSidebar.current) return;
      // Strict min/max limit boundary: 180px min to 380px max
      const newWidth = Math.max(180, Math.min(380, moveEvt.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingSidebar.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({ 'ai project': true, 'flask-api-suite': true });
  
  // Conversation session editing
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Interactive Project Filter & New Project Creation States
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Per-Project File Creation State
  const [creatingFileForProj, setCreatingFileForProj] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  // Project Folder Renaming State
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');

  // File Renaming State (key: `${projId}-${fileIdx}`)
  const [editingFileKey, setEditingFileKey] = useState(null);
  const [editingFileName, setEditingFileName] = useState('');

  // Upload Choice Modal State (Upload Files vs Upload Folder)
  const [isUploadChoiceOpen, setIsUploadChoiceOpen] = useState(false);
  const [targetUploadProj, setTargetUploadProj] = useState(null);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const isDemoUser = user?.email === 'demo@severa.ai';

  const [localProjectFolders, setLocalProjectFolders] = useState([]);
  const projectFolders = propProjectFolders || localProjectFolders;
  const setProjectFolders = propSetProjectFolders || setLocalProjectFolders;

  useEffect(() => {
    if (propProjectFolders) return;
    if (isDemoUser) {
      setLocalProjectFolders([
        { id: 'p1', name: 'ai project', files: [{ name: 'main.py', templateId: 'py-sqli' }], session: 'Flask SQLi & Secret Audit' },
        { id: 'p2', name: 'react-frontend-sec', files: [{ name: 'App.jsx', templateId: 'js-xss' }], session: 'React DOM XSS Audit' },
        { id: 'p3', name: 'node-express-rce', files: [{ name: 'server.js', templateId: 'node-rce' }], session: 'Node Express RCE Audit' },
        { id: 'p4', name: 'docker-containers', files: [{ name: 'Dockerfile', templateId: 'docker-sec' }], session: 'Dockerfile Root Hardening' },
        { id: 'p5', name: 'python-deser', files: [{ name: 'deserialize.py', templateId: 'py-deser' }], session: 'Insecure Pickle Deserialization' }
      ]);
    } else {
      setLocalProjectFolders([
        { id: 'p1', name: 'my-workspace', files: [{ name: 'main.py', templateId: 'blank' }], session: 'Fresh Code Audit' }
      ]);
    }
  }, [user?.email, isDemoUser, propProjectFolders]);

  const navItems = [
    { id: 'workbench', label: 'Code Workbench', icon: Code2, badge: scanMetrics?.totalFindings },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'cicd', label: 'CI/CD Security Gate', icon: GitPullRequest },
    { id: 'sca', label: 'SCA Dependencies', icon: PackageCheck },
    { id: 'rules', label: 'Custom Rules', icon: Sliders }
  ];

  // Filter projects by search query
  const filteredProjects = projectFolders.filter((p) =>
    p.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const PROJECT_INITIAL_LIMIT = 3;
  const hasMoreProjects = filteredProjects.length > PROJECT_INITIAL_LIMIT;
  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, PROJECT_INITIAL_LIMIT);

  const toggleProjectExpand = (pName) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [pName]: !prev[pName]
    }));
  };

  // Create New Project Folder (Initializes with Fresh Blank Code File)
  const handleCreateNewProject = () => {
    if (!newProjectName.trim()) return;
    const cleanName = newProjectName.trim().toLowerCase().replace(/\s+/g, '-');
    const newId = `p-${Date.now()}`;
    
    const newProj = {
      id: newId,
      name: cleanName,
      files: [{ name: 'blank.py', code: `# Fresh Blank Code File for ${cleanName}\n\n` }],
      session: 'Initial Security Audit'
    };

    setProjectFolders([newProj, ...projectFolders]);
    setExpandedProjects((prev) => ({ ...prev, [cleanName]: true }));
    setNewProjectName('');
    setIsCreatingProject(false);

    setActiveTab('workbench');
    if (onCreateBlankProject) {
      onCreateBlankProject(cleanName, 'blank.py');
    }
  };

  // RENAME PROJECT FOLDER
  const startRenameProject = (proj) => {
    setEditingProjectId(proj.id);
    setEditingProjectName(proj.name);
  };

  const saveRenameProject = (projId) => {
    if (!editingProjectName.trim()) {
      setEditingProjectId(null);
      return;
    }
    const cleanName = editingProjectName.trim().toLowerCase().replace(/\s+/g, '-');
    
    setProjectFolders((prev) =>
      prev.map((p) => {
        if (p.id === projId) {
          if (onRenameProject) onRenameProject(p.name, cleanName);
          return { ...p, name: cleanName };
        }
        return p;
      })
    );
    setEditingProjectId(null);
  };

  // DELETE PROJECT FOLDER
  const handleDeleteProjectFolder = (proj) => {
    if (confirm(`Are you sure you want to delete project folder "${proj.name}"?`)) {
      setProjectFolders((prev) => prev.filter((p) => p.id !== proj.id));
      if (onDeleteProject) onDeleteProject(proj.name);
    }
  };

  // CREATE FILE INSIDE SPECIFIC PROJECT FOLDER
  const handleCreateFileInProject = (proj) => {
    if (!newFileName.trim()) return;
    const fileName = newFileName.trim();

    setProjectFolders((prev) =>
      prev.map((p) => {
        if (p.id === proj.id) {
          return {
            ...p,
            files: [...p.files, { name: fileName, code: `# Fresh Blank Code File: ${fileName}\n\n` }]
          };
        }
        return p;
      })
    );

    setActiveTab('workbench');
    if (onCreateFileInProject) {
      onCreateFileInProject(proj.name, fileName);
    }

    setNewFileName('');
    setCreatingFileForProj(null);
  };

  // RENAME FILE INSIDE PROJECT FOLDER
  const startRenameFile = (projId, fileIdx, fileObj) => {
    setEditingFileKey(`${projId}-${fileIdx}`);
    setEditingFileName(fileObj.name);
  };

  const saveRenameFile = (proj, fileIdx) => {
    if (!editingFileName.trim()) {
      setEditingFileKey(null);
      return;
    }
    const newName = editingFileName.trim();

    setProjectFolders((prev) =>
      prev.map((p) => {
        if (p.id === proj.id) {
          const updatedFiles = [...p.files];
          const oldName = updatedFiles[fileIdx]?.name;
          updatedFiles[fileIdx] = { ...updatedFiles[fileIdx], name: newName };
          
          if (onRenameFileInProject) onRenameFileInProject(p.name, oldName, newName);
          return { ...p, files: updatedFiles };
        }
        return p;
      })
    );
    setEditingFileKey(null);
  };

  // DELETE FILE INSIDE PROJECT FOLDER
  const handleDeleteFileInProjectFolder = (proj, fileIdx) => {
    const targetFile = proj.files[fileIdx];
    if (confirm(`Delete file "${targetFile?.name || 'file'}" from "${proj.name}"?`)) {
      setProjectFolders((prev) =>
        prev.map((p) => {
          if (p.id === proj.id) {
            const updatedFiles = p.files.filter((_, idx) => idx !== fileIdx);
            return { ...p, files: updatedFiles };
          }
          return p;
        })
      );
      if (onDeleteFileInProject) onDeleteFileInProject(proj.name, targetFile?.name);
    }
  };

  // TRIGGER UPLOAD CHOICE MODAL FOR A PROJECT FOLDER
  const openUploadChoice = (proj) => {
    setTargetUploadProj(proj);
    setIsUploadChoiceOpen(true);
  };

  // IGNORED PATHS & EXTENSIONS FOR ZERO-NOISE CODE SCANNING
  const IGNORED_PATHS = [
    'node_modules/', '.git/', 'dist/', 'build/', 'coverage/', '.venv/', 'venv/',
    'vendor/', '__pycache__/', '.next/', '.cache/', '.turbo/', 'package-lock.json',
    'yarn.lock', 'pnpm-lock.yaml'
  ];
  const IGNORED_EXTS = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
    '.mp4', '.zip', '.gz', '.pdf', '.svg', '.map', '.min.js', '.min.css', '.node'
  ];

  const isSourceCodeFile = (file) => {
    const relPath = file.webkitRelativePath || file.name || '';
    if (IGNORED_PATHS.some((path) => relPath.includes(path))) return false;
    if (IGNORED_EXTS.some((ext) => relPath.toLowerCase().endsWith(ext))) return false;
    return true;
  };

  // MULTI-FILE UPLOAD HANDLER
  const handleMultipleFilesUploaded = (e) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0 || !targetUploadProj) return;

    const files = rawFiles.filter(isSourceCodeFile).slice(0, 250);

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          resolve({
            name: file.name,
            code: evt.target?.result || `# ${file.name}`
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((newFiles) => {
      setProjectFolders((prev) =>
        prev.map((p) => {
          if (p.id === targetUploadProj.id) {
            return { ...p, files: [...p.files, ...newFiles] };
          }
          return p;
        })
      );

      if (newFiles.length > 0) {
        setActiveTab('workbench');
        if (onUploadFileToProject) {
          onUploadFileToProject(targetUploadProj.name, newFiles[0].name, newFiles[0].code);
        }
      }
    });

    e.target.value = '';
  };

  // ENTIRE FOLDER UPLOAD HANDLER
  const handleFolderUploaded = (e) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0 || !targetUploadProj) return;

    const files = rawFiles.filter(isSourceCodeFile).slice(0, 250);

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const relativePath = file.webkitRelativePath || file.name;
          const parts = relativePath.split('/');
          const cleanFileName = parts.length > 1 ? parts.slice(1).join('/') : file.name;
          resolve({
            name: cleanFileName,
            code: evt.target?.result || `# ${cleanFileName}`
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((newFiles) => {
      const validCodeFiles = newFiles.filter((f) => f.code !== undefined && f.name);

      if (validCodeFiles.length > 0) {
        setProjectFolders((prev) =>
          prev.map((p) => {
            if (p.id === targetUploadProj.id) {
              return { ...p, files: validCodeFiles };
            }
            return p;
          })
        );

        setActiveTab('workbench');
        if (onUploadFileToProject) {
          onUploadFileToProject(targetUploadProj.name, validCodeFiles[0].name, validCodeFiles[0].code);
        }
      }
    });

    e.target.value = '';
  };

  const startRenaming = (session) => {
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  const saveRenaming = (sessionId) => {
    if (editingName.trim() && onRenameSession) {
      onRenameSession(sessionId, editingName.trim());
    }
    setEditingSessionId(null);
  };

  const handleProjectClick = (p, fileObj) => {
    setActiveTab('workbench');
    const fileName = fileObj?.name || 'main.py';
    if (onSelectProjectFile) {
      onSelectProjectFile(p.name, fileName);
    } else if (onSelectProjectSample) {
      onSelectProjectSample(fileObj?.templateId || 'blank', p.name, fileName);
    }
  };

  const handleConversationClick = (session) => {
    setActiveTab('workbench');
    onSelectSession(session);
  };

  return (
    <aside 
      style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px` }}
      className="bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 p-3 shadow-2xl backdrop-blur-md transition-all duration-75 relative group"
    >
      {/* Draggable Resizer Handle for Left Sidebar (Min: 180px, Max: 380px) */}
      {!isCollapsed && (
        <div
          onMouseDown={handleSidebarMouseDown}
          title="Drag left or right to resize sidebar (Min: 180px, Max: 380px limit)"
          className="absolute right-0 top-0 bottom-0 w-2 hover:w-2.5 bg-transparent hover:bg-indigo-500/60 cursor-col-resize z-50 transition-all flex items-center justify-center group/resizer"
        >
          <div className="w-0.5 h-8 bg-slate-700 group-hover/resizer:bg-indigo-300 rounded-full" />
        </div>
      )}
      
      {/* Hidden File Input for Multi-File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleMultipleFilesUploaded}
        className="hidden"
      />

      {/* Hidden Folder Input for Entire Folder Upload */}
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        multiple
        onChange={handleFolderUploaded}
        className="hidden"
      />

      {/* Upload Choice Modal (File vs Folder Selection Prompt) */}
      <UploadChoiceModal
        isOpen={isUploadChoiceOpen}
        onClose={() => setIsUploadChoiceOpen(false)}
        targetProjectName={targetUploadProj?.name || 'Project'}
        onSelectUploadFiles={() => fileInputRef.current?.click()}
        onSelectUploadFolder={() => folderInputRef.current?.click()}
      />

      {/* Top Section: Brand, Actions, Navigation, Projects Tree & Conversations History */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1 font-sans scrollbar-none">
        
        {/* Brand Header with Collapsible Toggle Bar */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              title="Expand Sidebar (Severa AI)"
              className="p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer relative group/logo shrink-0"
            >
              <ShieldAlert className="w-5 h-5" />
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                <PanelLeftOpen className="w-4 h-4 text-indigo-200" />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0 animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm text-slate-100 tracking-tight truncate">Severa AI</h1>
                  <span className="px-1.5 py-0.2 text-[8px] font-bold uppercase rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none truncate">Continuous SAST Platform</p>
              </div>
            </div>

            {/* Toggle Sidebar Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={() => {
            setActiveTab('workbench');
            onNewSession();
          }}
          title="New Audit Conversation"
          className={`w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-950/50 transition-all cursor-pointer border border-indigo-500/30 ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Audit Conversation</span>}
        </button>

        {/* Main Navigation Menu */}
        <nav className="space-y-1 pt-1 border-t border-slate-900">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Main Navigation
            </span>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border-l-2 border-indigo-500 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects Section (Filter, Create, Rename, Delete & Upload Choice) */}
        {!isCollapsed && (
          <>
            <div className="space-y-1.5 pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Projects
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <button 
                onClick={() => setIsFilterActive(!isFilterActive)}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${isFilterActive ? 'text-cyan-400' : 'text-slate-400'}`}
                title="Filter Projects"
              >
                <Filter className="w-3 h-3" />
              </button>

              <button 
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${isCreatingProject ? 'text-cyan-400' : 'text-slate-400'}`}
                title="Create New Project Folder"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Project Filter Search Bar Input */}
          {isFilterActive && (
            <div className="px-2 pt-1">
              <div className="relative flex items-center">
                <Search className="w-3 h-3 text-slate-500 absolute left-2" />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2 py-1 text-[10px] text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* New Project Creation Input Box */}
          {isCreatingProject && (
            <div className="px-2 pt-1 space-y-1">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateNewProject();
                }}
                className="flex items-center gap-1 font-mono text-xs"
              >
                <input
                  type="text"
                  placeholder="e.g. security-microservice"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsCreatingProject(false);
                  }}
                  autoFocus
                  className="flex-1 bg-slate-950 border border-cyan-500 rounded-lg px-2 py-1 text-[10px] text-slate-100 focus:outline-none"
                />
                <button type="submit" className="p-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsCreatingProject(false)} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Project Folders Tree with Full Rename, Delete, File+ and Upload Actions */}
          <div className="space-y-1 font-mono text-xs">
            {visibleProjects.map((p) => {
              const isExpanded = expandedProjects[p.name];
              const projectFilesList = p.files || [{ name: 'main.py' }];
              const isEditingProj = editingProjectId === p.id;

              return (
                <div key={p.id} className="space-y-1">
                  
                  {/* Project Folder Row */}
                  <div
                    onClick={() => {
                      toggleProjectExpand(p.name);
                      handleProjectClick(p, projectFilesList[0]);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] text-slate-300 hover:bg-slate-900 hover:text-cyan-400 transition-colors cursor-pointer group"
                  >
                    {isEditingProj ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveRenameProject(p.id);
                        }}
                        className="flex items-center gap-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditingProjectId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-[10px] text-slate-100 focus:outline-none font-mono"
                        />
                        <button type="submit" className="p-0.5 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setEditingProjectId(null)} className="p-0.5 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {isExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate font-bold text-slate-200 group-hover:text-cyan-300">{p.name}</span>
                        </div>

                        {/* Per-Project Action Icons: File+, Upload (File/Folder Choice), Rename & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreatingFileForProj(p.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition-opacity"
                            title={`Create file in ${p.name}`}
                          >
                            <FilePlus className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUploadChoice(p);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition-opacity"
                            title={`Upload File(s) or Folder to ${p.name}`}
                          >
                            <Upload className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenameProject(p);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition-opacity"
                            title={`Rename folder "${p.name}"`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProjectFolder(p);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity"
                            title={`Delete folder "${p.name}"`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjectExpand(p.name);
                            }}
                            className="p-0.5 text-slate-500 hover:text-slate-300"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Inline Create File Input inside specific Project Folder */}
                  {creatingFileForProj === p.id && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateFileInProject(p);
                      }}
                      className="pl-6 pr-2 py-1 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <input
                        type="text"
                        placeholder="e.g. app.py or server.js"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setCreatingFileForProj(null);
                        }}
                        autoFocus
                        className="flex-1 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-slate-100 focus:outline-none"
                      />
                      <button type="submit" className="text-emerald-400 p-0.5">
                        <Check className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => setCreatingFileForProj(null)} className="text-slate-400 p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </form>
                  )}

                  {/* Sub-item Files inside Project Folder with Rename & Delete */}
                  {isExpanded && (
                    <div className="pl-3 space-y-1 text-[10px] text-slate-400">
                      {buildFileTree(projectFilesList, p.name).map((node) => (
                        <ProjectTreeNode
                          key={node.path}
                          node={node}
                          level={0}
                          p={p}
                          editingFileKey={editingFileKey}
                          editingFileName={editingFileName}
                          setEditingFileName={setEditingFileName}
                          setEditingFileKey={setEditingFileKey}
                          startRenameFile={startRenameFile}
                          saveRenameFile={saveRenameFile}
                          handleDeleteFileInProjectFolder={handleDeleteFileInProjectFolder}
                          handleProjectClick={handleProjectClick}
                        />
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Show More / Show All Projects Toggle */}
          {hasMoreProjects && (
            <button
              type="button"
              onClick={() => setShowAllProjects((prev) => !prev)}
              className="w-full flex items-center justify-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 py-1.5 font-semibold transition-all cursor-pointer bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-lg mt-1 group/toggle"
            >
              <span className="group-hover/toggle:text-cyan-300">
                {showAllProjects ? 'Show Fewer Projects' : `Show All Projects (${filteredProjects.length})`}
              </span>
              <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform duration-200 ${showAllProjects ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Conversations History Section */}
        <div className="space-y-1.5 pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={() => {
                setActiveTab('workbench');
                onNewSession();
              }}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-bold px-1"
            >
              +
            </button>
          </div>

          <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto pr-1">
            {scanSessions.length === 0 ? (
              <p className="text-[10px] text-slate-500 px-2 py-1">No conversations yet.</p>
            ) : (
              scanSessions.map((session) => {
                const isSessionActive = session.id === activeSessionId;
                const isEditing = editingSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleConversationClick(session)}
                    className={`flex items-center justify-between p-1.5 rounded-xl border text-[11px] transition-all cursor-pointer group ${
                      isSessionActive
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveRenaming(session.id);
                        }}
                        className="flex items-center gap-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-slate-950 border border-cyan-500 rounded px-1 py-0.5 text-[10px] text-slate-100 focus:outline-none font-mono"
                        />
                        <button type="submit" className="text-emerald-400 p-0.5">
                          <Check className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => setEditingSessionId(null)} className="text-slate-400 p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${session.findings?.length > 0 ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                          <span className="truncate font-sans text-[11px]" title={session.name}>
                            {session.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-500 font-mono">
                            {session.timeAgo || '8h'}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenaming(session);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-cyan-400 transition-opacity"
                            title="Rename Session"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    )}

  </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-900 shrink-0">

        {/* Manage AI Models & Providers Button */}
        {(() => {
          const hasKey = Boolean(apiKey && apiKey.trim()) || selectedProvider === 'ollama' || selectedProvider === 'local' || Boolean(customEndpoint && customEndpoint.trim());
          return (
            <button
              onClick={onOpenModelsModal}
              title={isCollapsed ? (hasKey ? `AI Provider: ${selectedProvider} / ${selectedModel}` : "No API Key Connected - Click to Configure") : undefined}
              className={`w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border ${
                !hasKey ? 'border-amber-500/40 bg-amber-500/10 shadow-sm shadow-amber-500/5' : 'border-slate-800'
              } text-xs font-semibold flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } transition-all cursor-pointer text-slate-200`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Cpu className={`w-4 h-4 ${!hasKey ? 'text-amber-400 animate-pulse' : 'text-cyan-400'} shrink-0`} />
                {!isCollapsed && (
                  <div className="text-left overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block leading-none">
                        AI Provider
                      </span>
                      {hasKey ? (
                        <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-400">
                          • No Key
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-extrabold truncate block uppercase tracking-tight ${!hasKey ? 'text-amber-300' : 'text-slate-100'}`}>
                      {hasKey ? `${selectedProvider} / ${selectedModel}` : 'No API Key Connected'}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
            </button>
          );
        })()}

        {/* User info card with logout */}
        {user && (
          isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <button
                type="button"
                onClick={onLogout}
                title={`Sign out (${user.email || 'User'})`}
                className="relative group/user p-1 rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                  {(user.name || 'User').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="absolute inset-0 bg-red-600/80 rounded-full opacity-0 group-hover/user:opacity-100 flex items-center justify-center transition-opacity">
                  <LogOut className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-md">
                {(user.name || 'User').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-200 truncate">{user.name || 'User'}</p>
                <p className="text-[9px] text-slate-500 truncate">{user.email || ''}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors rounded-lg cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}
      </div>

    </aside>
  );
}

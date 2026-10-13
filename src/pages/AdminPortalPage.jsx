import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  Shield, Database, RefreshCw, Key, Lock, Trash2, Edit3, Save, X,
  Search, CheckCircle2, AlertCircle, ArrowLeft, Layers, HardDrive,
  FileCode, Terminal, Eye, ExternalLink, UserCheck, ShieldAlert
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ADMIN_CONFIG } from '../constants/config';

export default function AdminPortalPage() {
  const router = useRouter();
  const user = router?.user || null;
  const navigate = router?.navigate || (() => {});

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('severa_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab State: 'workspaces' | 'inspector' | 'storage' | 'sql'
  const [activeTab, setActiveTab] = useState('workspaces');

  // Workspaces Data
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Table Inspector Data
  const [customTableName, setCustomTableName] = useState('workspaces');
  const [tableRows, setTableRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);

  // Edit State
  const [editingRow, setEditingRow] = useState(null); // { id, data: {...} }
  const [editStatus, setEditStatus] = useState(null); // { success: boolean, msg: string }

  // Storage Buckets
  const [buckets, setBuckets] = useState([]);
  const [isLoadingBuckets, setIsLoadingBuckets] = useState(false);

  // SQL Runner
  const [sqlQuery, setSqlQuery] = useState('SELECT email, active_project_name, compressed_bytes, compression_ratio, last_saved_at FROM workspaces;');
  const [sqlResult, setSqlResult] = useState(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  // Status Notification Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Authenticate Admin
  const handleAuthenticate = (e) => {
    e.preventDefault();
    setAuthError('');
    const userEmail = user?.email || 'admin@severa.ai';
    const result = adminService.verifyAdminAccess(userEmail, adminPin);

    if (result.authorized) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('severa_admin_auth', 'true');
      } catch {}
      showToast('Admin Console Unlocked', 'success');
    } else {
      setAuthError('Access Denied: Invalid Master PIN or unauthorized account.');
    }
  };

  const handleLogoutAdmin = () => {
    try {
      sessionStorage.removeItem('severa_admin_auth');
    } catch {}
    setIsAuthenticated(false);
    setAdminPin('');
  };

  // Load Workspaces
  const loadWorkspaces = useCallback(async () => {
    setIsLoadingWorkspaces(true);
    const { data, error } = await adminService.getLiveWorkspaces();
    setIsLoadingWorkspaces(false);
    if (error) {
      showToast(`Error fetching workspaces: ${error}`, 'error');
    } else {
      setWorkspaces(data || []);
    }
  }, []);

  // Load Table Rows
  const loadTableData = useCallback(async (tableName) => {
    setIsLoadingTable(true);
    setTableError(null);
    const { data, error } = await adminService.getTableRows(tableName, 50);
    setIsLoadingTable(false);
    if (error) {
      setTableError(error);
      setTableRows([]);
      setTableColumns([]);
    } else {
      setTableRows(data || []);
      if (data && data.length > 0) {
        setTableColumns(Object.keys(data[0]));
      } else {
        setTableColumns([]);
      }
    }
  }, []);

  // Load Buckets
  const loadBuckets = useCallback(async () => {
    setIsLoadingBuckets(true);
    const { buckets, error } = await adminService.getStorageBuckets();
    setIsLoadingBuckets(false);
    if (!error) {
      setBuckets(buckets || []);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'workspaces') loadWorkspaces();
      if (activeTab === 'inspector') loadTableData(customTableName);
      if (activeTab === 'storage') loadBuckets();
    }
  }, [isAuthenticated, activeTab, loadWorkspaces, loadTableData, loadBuckets, customTableName]);

  // Handle Row Edit Save (Workspaces)
  const handleSaveWorkspaceEdit = async (rowId, updatedFields) => {
    setEditStatus(null);
    const { data, error } = await adminService.updateWorkspaceRecord(rowId, updatedFields);
    if (error) {
      showToast(`Failed to update Supabase: ${error}`, 'error');
    } else {
      showToast('Successfully updated live in Supabase!', 'success');
      setEditingRow(null);
      loadWorkspaces();
    }
  };

  // Handle Row Delete (Workspaces)
  const handleDeleteWorkspace = async (rowId, email) => {
    if (!window.confirm(`Permanently delete workspace for ${email} from Supabase?`)) return;
    const { error } = await adminService.deleteWorkspaceRecord(rowId);
    if (error) {
      showToast(`Delete failed: ${error}`, 'error');
    } else {
      showToast(`Workspace for ${email} deleted from Supabase`, 'success');
      if (selectedWorkspace?.id === rowId) setSelectedWorkspace(null);
      loadWorkspaces();
    }
  };

  // Filtered Workspaces
  const filteredWorkspaces = workspaces.filter((w) =>
    (w.email || '').toLowerCase().includes(workspaceSearch.toLowerCase()) ||
    (w.active_project_name || '').toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  // =========================================================================
  // VIEW: PIN AUTHENTICATION GATE
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 select-none">
        <div className="w-full max-w-md bg-[#0f131c] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-scaleUp">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">Supabase Admin Console</h1>
                <p className="text-[11px] text-slate-400 font-mono">Live Database &amp; Workspace Vault</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Enter the master administrative PIN to inspect, monitor, and live-edit all Supabase databases, workspaces, and storage buckets.
          </p>

          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">
                Admin Master PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 6-digit PIN..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161a26] border border-white/10 text-white placeholder-slate-500 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Default master PIN: {ADMIN_CONFIG.masterPin}</p>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Admin Console</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED ADMIN CONSOLE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-mono font-medium shadow-2xl flex items-center gap-2 animate-fadeIn ${
          toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="px-6 py-3 bg-[#0d1017] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Return to App</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Supabase Live Control Center</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-normal">
                  Connected
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                Project: rmwbfximqdtfuhzuvslf • Bidirectional Sync Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141824] border border-white/10 text-xs font-mono text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{user?.email || 'admin@severa.ai'}</span>
          </div>

          <button
            onClick={handleLogoutAdmin}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-header Bar */}
      <div className="px-6 py-2 bg-[#090b10] border-b border-white/5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('workspaces')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'workspaces' ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Live Workspaces ({workspaces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'inspector' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Table Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'storage' ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage Buckets</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'workspaces') loadWorkspaces();
            if (activeTab === 'inspector') loadTableData(customTableName);
            if (activeTab === 'storage') loadBuckets();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          title="Refresh from Supabase"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ================================================================= */}
        {/* TAB 1: LIVE WORKSPACES & COMPRESSION DATA                        */}
        {/* ================================================================= */}
        {activeTab === 'workspaces' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  placeholder="Search user email or project name..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0f131d] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syncing With Supabase
                </span>
              </div>
            </div>

            {/* Workspaces Table */}
            <div className="bg-[#0e111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141824] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">User Email</th>
                      <th className="px-4 py-3">Active Project</th>
                      <th className="px-4 py-3">Files Inside</th>
                      <th className="px-4 py-3">Original Size</th>
                      <th className="px-4 py-3">Compressed in DB</th>
                      <th className="px-4 py-3">Storage Saved</th>
                      <th className="px-4 py-3">Last Saved</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {isLoadingWorkspaces ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mx-auto mb-2" />
                          <span>Fetching live records from Supabase...</span>
                        </td>
                      </tr>
                    ) : filteredWorkspaces.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                          No workspaces found in Supabase. Make sure a user has logged in and edited a workspace, or check table creation.
                        </td>
                      </tr>
                    ) : (
                      filteredWorkspaces.map((row) => {
                        const isEditing = editingRow?.id === row.id;
                        return (
                          <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-semibold text-white">
                              {row.email}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingRow.data.active_project_name}
                                  onChange={(e) => setEditingRow({
                                    ...editingRow,
                                    data: { ...editingRow.data, active_project_name: e.target.value }
                                  })}
                                  className="px-2 py-1 rounded bg-[#181d2c] border border-emerald-500/50 text-white text-xs"
                                />
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                                  {row.active_project_name || 'workspace'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {row.fileCount || 1} files
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {((row.uncompressed_bytes || 0) / 1024).toFixed(1)} KB
                            </td>
                            <td className="px-4 py-3 text-emerald-400 font-bold">
                              {((row.compressed_bytes || 0) / 1024).toFixed(1)} KB
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                                -{row.compression_ratio || 0}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-[11px]">
                              {row.last_saved_at ? new Date(row.last_saved_at).toLocaleTimeString() : 'Recently'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveWorkspaceEdit(row.id, {
                                        active_project_name: editingRow.data.active_project_name
                                      })}
                                      className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                      title="Save to Supabase"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingRow(null)}
                                      className="p-1 rounded bg-white/10 text-slate-400 hover:text-white transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setSelectedWorkspace(row)}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                      title="Inspect Decompressed Project Files"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                    </button>
                                    <button
                                      onClick={() => setEditingRow({ id: row.id, data: { ...row } })}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                      title="Edit Record"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWorkspace(row.id, row.email)}
                                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                      title="Delete Record from Supabase"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Workspace Deep Code Inspector Modal */}
            {selectedWorkspace && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-4xl bg-[#0f131d] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white font-mono">{selectedWorkspace.email}</h2>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Project: {selectedWorkspace.active_project_name} • Savings: {selectedWorkspace.compression_ratio}%
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedWorkspace(null)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs">
                    {selectedWorkspace.decompressed?.projectFolders?.map((folder, fIdx) => (
                      <div key={fIdx} className="bg-[#080a0f] border border-white/10 rounded-xl p-4">
                        <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Folder: {folder.name}</span>
                          <span className="text-slate-500 text-[10px]">({folder.files?.length || 0} files)</span>
                        </div>
                        <div className="space-y-3">
                          {(folder.files || []).map((file, fileIdx) => (
                            <div key={fileIdx} className="bg-[#121622] rounded-lg p-3 border border-white/5">
                              <div className="text-slate-300 font-semibold mb-1 text-[11px] text-cyan-300">
                                {file.name || file.path}
                              </div>
                              <pre className="text-[10px] text-slate-400 bg-[#090b10] p-2.5 rounded overflow-x-auto max-h-40 leading-relaxed">
                                {file.code || file.content || '# Blank file'}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => setSelectedWorkspace(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold cursor-pointer"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: GENERAL TABLE INSPECTOR & ROW EDITOR                      */}
        {/* ================================================================= */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Target Table:</span>
                <input
                  type="text"
                  value={customTableName}
                  onChange={(e) => setCustomTableName(e.target.value)}
                  placeholder="e.g. workspaces, user_profiles"
                  className="px-3 py-1.5 rounded-xl bg-[#0e121d] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => loadTableData(customTableName)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  Query Table
                </button>
              </div>
            </div>

            {tableError ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                Error loading {customTableName}: {tableError}
              </div>
            ) : (
              <div className="bg-[#0e111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#141824] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                      <tr>
                        {tableColumns.map((col) => (
                          <th key={col} className="px-4 py-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {isLoadingTable ? (
                        <tr>
                          <td colSpan={tableColumns.length || 1} className="px-4 py-8 text-center text-slate-500">
                            Loading rows...
                          </td>
                        </tr>
                      ) : tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={tableColumns.length || 1} className="px-4 py-8 text-center text-slate-500">
                            No rows found in {customTableName}.
                          </td>
                        </tr>
                      ) : (
                        tableRows.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.02]">
                            {tableColumns.map((col) => {
                              const val = r[col];
                              const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                              return (
                                <td key={col} className="px-4 py-2.5 max-w-xs truncate" title={displayVal}>
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: STORAGE BUCKETS                                           */}
        {/* ================================================================= */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white font-mono">Supabase Storage Buckets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoadingBuckets ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs col-span-3">
                  Inspecting buckets...
                </div>
              ) : buckets.length === 0 ? (
                <div className="p-6 bg-[#0e111a] border border-white/10 rounded-2xl text-slate-400 text-xs font-mono col-span-3">
                  No public storage buckets currently detected. You can create a bucket like <span className="text-emerald-400">project-archives</span> in your Supabase dashboard settings.
                </div>
              ) : (
                buckets.map((b) => (
                  <div key={b.id} className="p-4 bg-[#0e111a] border border-white/10 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      <span>{b.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Created: {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

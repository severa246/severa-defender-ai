import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import {
  X,
  Plus,
  Check,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  Sparkles,
  Zap,
  Cpu,
  Server,
  Globe,
  ShieldCheck,
  Edit2,
  Star,
} from 'lucide-react';

// ── Provider catalogue ─────────────────────────────────────────────────────────
export const POPULAR_AI_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Gemini',
    icon: Sparkles,
    badge: 'Recommended',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    needsEndpoint: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: Zap,
    badge: 'Industry Standard',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4-turbo'],
    needsEndpoint: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: ShieldCheck,
    badge: 'Code Architect',
    defaultModel: 'claude-3-5-sonnet',
    models: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
    needsEndpoint: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: Cpu,
    badge: 'High Performance',
    defaultModel: 'deepseek-v3',
    models: ['deepseek-v3', 'deepseek-r1'],
    needsEndpoint: false,
  },
  {
    id: 'groq',
    name: 'Groq LPU',
    icon: Zap,
    badge: 'Sub-Second',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    needsEndpoint: false,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: Server,
    badge: 'Offline / Private',
    defaultModel: 'codellama',
    models: ['codellama', 'qwen2.5-coder', 'llama3'],
    needsEndpoint: true,
    endpointPlaceholder: 'http://localhost:11434/api',
  },
  {
    id: 'custom',
    name: 'Custom Gateway',
    icon: Globe,
    badge: 'Enterprise',
    defaultModel: '',
    models: [],
    needsEndpoint: true,
    endpointPlaceholder: 'https://your-gateway.example.com/v1',
  },
];

function getStorageKey(userEmail) {
  return userEmail ? `severa_ai_configs_${userEmail.trim().toLowerCase()}` : 'severa_ai_configs_guest';
}

function loadConfigs(userEmail) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userEmail))) || [];
  } catch {
    return [];
  }
}

function saveConfigs(userEmail, configs) {
  try {
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(configs));
  } catch {}
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Icon map helper ────────────────────────────────────────────────────────────
function ProviderIcon({ providerId, size = 14 }) {
  const p = POPULAR_AI_PROVIDERS.find((x) => x.id === providerId);
  const Icon = p?.icon || Globe;
  return <Icon size={size} />;
}

// ── Tiny Dropdown (reusable) ──────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder = 'Select…', className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200
        focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30
        transition-colors cursor-pointer w-full ${className}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o} className="bg-[#0f1117]">
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

// ── Config Form ────────────────────────────────────────────────────────────────
function ConfigForm({ initial, onSave, onCancel }) {
  const provider = initial?.provider || 'google';
  const pDef = POPULAR_AI_PROVIDERS.find((p) => p.id === provider) || POPULAR_AI_PROVIDERS[0];

  const [form, setForm] = useState({
    label: initial?.label || '',
    provider: initial?.provider || 'google',
    model: initial?.model || pDef.defaultModel,
    apiKey: initial?.apiKey || '',
    endpoint: initial?.endpoint || '',
  });
  const [showKey, setShowKey] = useState(false);

  const currentProvider = POPULAR_AI_PROVIDERS.find((p) => p.id === form.provider) || POPULAR_AI_PROVIDERS[0];

  function handleProviderChange(id) {
    const pd = POPULAR_AI_PROVIDERS.find((p) => p.id === id) || POPULAR_AI_PROVIDERS[0];
    setForm((f) => ({ ...f, provider: id, model: pd.defaultModel, endpoint: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.label.trim()) return;
    onSave({ ...form, label: form.label.trim() });
  }

  const modelOptions =
    currentProvider.models.length > 0
      ? currentProvider.models.map((m) => ({ value: m, label: m }))
      : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Configuration name</label>
        <input
          autoFocus
          type="text"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          placeholder="e.g. Work GPT-4o, Local Ollama…"
          className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200
            placeholder-slate-600 focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30 transition-colors"
          required
        />
      </div>

      {/* Provider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Provider</label>
        <Select
          value={form.provider}
          onChange={handleProviderChange}
          options={POPULAR_AI_PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
        />
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">Model identifier</label>
        {modelOptions.length > 0 ? (
          <div className="space-y-1.5">
            <Select
              value={form.model}
              onChange={(v) => setForm((f) => ({ ...f, model: v }))}
              options={modelOptions}
            />
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="Or type a custom model ID…"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 font-mono
                placeholder-slate-600 focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30 transition-colors"
            />
          </div>
        ) : (
          <input
            type="text"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            placeholder="Enter model ID…"
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 font-mono
              placeholder-slate-600 focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30 transition-colors"
          />
        )}
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">API key / bearer token</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
            placeholder="sk-… / AIza… / Bearer …"
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 pr-9 text-sm text-slate-200 font-mono
              placeholder-slate-600 focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Endpoint (only for providers that need it) */}
      {currentProvider.needsEndpoint && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">Endpoint URL</label>
          <input
            type="url"
            value={form.endpoint}
            onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
            placeholder={currentProvider.endpointPlaceholder || 'https://…'}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 font-mono
              placeholder-slate-600 focus:outline-none focus:border-[#3d7eff] focus:ring-1 focus:ring-[#3d7eff]/30 transition-colors"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-[#2a2d3a] text-sm text-slate-400 hover:text-slate-200 hover:border-[#3a3d4a] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-[#3d7eff] hover:bg-[#2f6ee8] text-white text-sm font-medium transition-colors shadow-lg shadow-[#3d7eff]/20"
        >
          Save
        </button>
      </div>
    </form>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function ManageModelsModal({
  isOpen,
  onClose,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  apiKey,
  setApiKey,
  customEndpoint,
  setCustomEndpoint,
  user,
}) {
  const [configs, setConfigs] = useState([]);
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingConfig, setEditingConfig] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const userEmail = user?.email || '';

  // Load from localStorage on mount / open
  useEffect(() => {
    if (!isOpen) return;
    const saved = loadConfigs(userEmail);
    setConfigs(saved);
    // Detect which config matches the current app state
    const match = saved.find(
      (c) => c.provider === selectedProvider && c.model === selectedModel
    );
    setActiveConfigId(match?.id || null);

    // Auto-sync API key ONLY IF selectedProvider matches an existing config AND apiKey is missing
    if (selectedProvider && match && match.apiKey && (!apiKey || apiKey !== match.apiKey)) {
      activateConfig(match);
    }
    setView('list');
    setEditingConfig(null);
    setIsConfirmingDelete(false);
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  // ── Activate a saved config ─────────────────────────────────────────────────
  function activateConfig(cfg) {
    setActiveConfigId(cfg.id);
    setSelectedProvider(cfg.provider);
    setSelectedModel(cfg.model);
    setApiKey(cfg.apiKey || '');
    setCustomEndpoint(cfg.endpoint || '');

    const key = userEmail ? userEmail.trim().toLowerCase() : 'guest';
    try {
      storageService.setUserApiKey(key, cfg.apiKey || '');
      storageService.setUserModelConfig(key, { provider: cfg.provider, model: cfg.model, endpoint: cfg.endpoint || '' });
    } catch {}
  }

  // ── Save (add or update) ────────────────────────────────────────────────────
  function handleSave(form) {
    let next;
    let targetCfg;
    if (editingConfig) {
      targetCfg = { ...editingConfig, ...form };
      next = configs.map((c) =>
        c.id === editingConfig.id ? targetCfg : c
      );
    } else {
      targetCfg = { id: makeId(), ...form };
      next = [...configs, targetCfg];
    }
    saveConfigs(userEmail, next);
    setConfigs(next);
    activateConfig(targetCfg);
    setView('list');
    setEditingConfig(null);
  }

  // Checkbox helpers
  const isAllSelected = configs.length > 0 && selectedIds.length === configs.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(configs.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Disconnect active key WITHOUT deleting saved configs from storage
  function handleDisconnectActive() {
    setActiveConfigId(null);
    setSelectedProvider('');
    setSelectedModel('');
    setApiKey('');
    setCustomEndpoint('');

    const key = userEmail ? userEmail.trim().toLowerCase() : 'guest';
    try {
      storageService.setUserApiKey(key, '');
      storageService.setUserModelConfig(key, { provider: '', model: '', endpoint: '' });
    } catch {}

    const keysToClean = userEmail
      ? [userEmail.trim().toLowerCase(), 'guest', 'demo@severa.ai']
      : ['guest', 'demo@severa.ai'];

    keysToClean.forEach((k) => {
      try {
        localStorage.removeItem(`severa_api_key_${k}`);
        localStorage.removeItem(`severa_provider_${k}`);
        localStorage.removeItem(`severa_model_${k}`);
        localStorage.removeItem(`severa_endpoint_${k}`);
        sessionStorage.removeItem(`severa_session_api_key_${k}`);
      } catch {}
    });
  }

  // Handle Delete Button Click: Checks Select All if nothing checked & triggers confirm step
  function handleDeleteButtonClick() {
    if (selectedIds.length === 0 && configs.length > 0) {
      setSelectedIds(configs.map((c) => c.id));
    }
    setIsConfirmingDelete(true);
  }

  function handleConfirmDelete() {
    handleDeleteSelected();
    setIsConfirmingDelete(false);
  }

  function handleCancelDelete() {
    setIsConfirmingDelete(false);
  }

  // Delete selected configs permanently
  function handleDeleteSelected() {
    const idsToDelete = selectedIds.length > 0 ? selectedIds : (activeConfigId ? [activeConfigId] : []);
    if (idsToDelete.length === 0) return;

    const next = configs.filter((c) => !idsToDelete.includes(c.id));
    saveConfigs(userEmail, next);
    setConfigs(next);
    setSelectedIds([]);

    if (idsToDelete.includes(activeConfigId) || next.length === 0) {
      if (next.length > 0) {
        activateConfig(next[0]);
      } else {
        handleDisconnectActive();
      }
    }
  }

  const activeConfig = configs.find((c) => c.id === activeConfigId);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#13151f] border border-[#1e2130] rounded-2xl w-full max-w-lg
        shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2130]">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">AI Provider</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {configs.length === 0
                ? 'No configurations saved yet'
                : `${configs.length} saved configuration${configs.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-[#1e2130] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Active config badge */}
          {view === 'list' && activeConfig && (
            <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-[#1a2340] border border-[#3d7eff]/30 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#3d7eff]/15 border border-[#3d7eff]/30 flex items-center justify-center text-[#3d7eff]">
                <ProviderIcon providerId={activeConfig.provider} size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{activeConfig.label}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{activeConfig.model}</p>
              </div>
              <span className="text-[10px] font-bold text-[#3d7eff] uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#3d7eff]/10 border border-[#3d7eff]/20">
                Active
              </span>
            </div>
          )}

          {view === 'list' && (
            <div className="p-4 space-y-3">

              {/* Toolbar Actions Header: Select All, Disconnect API Key, and Delete API Key */}
              {configs.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-[#0f1117] border border-[#1e2130] text-xs">
                  {/* Select All Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-3.5 h-3.5 rounded accent-[#3d7eff] cursor-pointer"
                    />
                    <span>Select All ({selectedIds.length}/{configs.length})</span>
                  </label>

                  {/* Two Separate Buttons: Disconnect API Key vs Delete API Key */}
                  <div className="flex items-center gap-2">
                    {/* Disconnect API Key Button */}
                    <button
                      type="button"
                      onClick={handleDisconnectActive}
                      title="Disconnect active API Key (Switch to Local Engine without deleting saved configs)"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Disconnect API Key</span>
                    </button>

                    {/* Delete API Key Button / Two-step Confirm & Cancel State */}
                    {!isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={handleDeleteButtonClick}
                        title="Delete API Key (Selects all check boxes & prompts to confirm)"
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={11} />
                        <span>Delete API Key</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        {/* Confirm Delete Button */}
                        <button
                          type="button"
                          onClick={handleConfirmDelete}
                          title="Confirm permanent deletion of selected API Keys"
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-red-600/30"
                        >
                          <Check size={11} />
                          <span>Confirm Delete?</span>
                        </button>

                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          title="Cancel deletion"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {configs.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#1e2130] flex items-center justify-center text-slate-600">
                    <Globe size={22} />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No configurations saved</p>
                  <p className="text-xs text-slate-600 max-w-[240px]">
                    Add a provider configuration below or use Severa's built-in offline engine.
                  </p>
                </div>
              ) : (
                configs.map((cfg) => {
                  const isActive = cfg.id === activeConfigId;
                  const isChecked = selectedIds.includes(cfg.id);
                  const pd = POPULAR_AI_PROVIDERS.find((p) => p.id === cfg.provider);
                  return (
                    <div
                      key={cfg.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all group cursor-pointer
                        ${isActive
                          ? 'border-[#3d7eff]/50 bg-[#1a2340]'
                          : isChecked
                          ? 'border-blue-500/30 bg-blue-950/20'
                          : 'border-[#1e2130] bg-[#0f1117] hover:border-[#2a2d3a]'
                        }`}
                      onClick={() => activateConfig(cfg)}
                    >
                      {/* Row Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleSelectRow(cfg.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded accent-[#3d7eff] cursor-pointer shrink-0"
                      />

                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border
                          ${isActive
                            ? 'bg-[#3d7eff]/15 border-[#3d7eff]/30 text-[#3d7eff]'
                            : 'bg-[#1e2130] border-[#2a2d3a] text-slate-500 group-hover:text-slate-300'
                          }`}
                      >
                        <ProviderIcon providerId={cfg.provider} size={14} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                            {cfg.label}
                          </span>
                          {pd && (
                            <span className="text-[9px] text-slate-500 font-medium shrink-0">{pd.name}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{cfg.model || '—'}</p>
                        {cfg.endpoint && (
                          <p className="text-[10px] text-slate-600 font-mono truncate">{cfg.endpoint}</p>
                        )}
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isActive && (
                          <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-[#3d7eff]/20 text-[#3d7eff] border border-[#3d7eff]/30 uppercase tracking-wider">
                            Active
                          </span>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConfig(cfg);
                            setView('edit');
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-[#1e2130] transition-all"
                          title="Edit Configuration"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Individual Delete */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSelected();
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                          title="Delete Configuration"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add New Configuration Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingConfig(null);
                    setView('add');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#2a2d3a]
                    text-slate-400 hover:text-white hover:border-[#3a3d4a] hover:bg-[#1e2130]/50 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add New Provider Configuration</span>
                </button>
              </div>
            </div>
          )}

          {(view === 'add' || view === 'edit') && (
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-400 mb-4">
                {view === 'edit' ? 'Edit configuration' : 'New configuration'}
              </p>
              <ConfigForm
                initial={editingConfig}
                onSave={handleSave}
                onCancel={() => {
                  setView('list');
                  setEditingConfig(null);
                }}
              />
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        {view === 'list' && (
          <div className="px-5 py-3 border-t border-[#1e2130] flex items-center justify-between">
            <div className="text-[11px] text-slate-600 font-mono">
              {activeConfig ? (
                <span>
                  <span className="text-slate-500">{activeConfig.provider}</span>
                  <span className="text-slate-700 mx-1">·</span>
                  <span className="text-slate-500 truncate max-w-[180px] inline-block align-bottom">{activeConfig.model}</span>
                </span>
              ) : (
                <span className="text-slate-700">No active configuration</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#3d7eff] hover:bg-[#2f6ee8] text-white text-xs font-medium transition-colors shadow-md shadow-[#3d7eff]/20"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

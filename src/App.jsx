import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeaderBar from './components/TopHeaderBar';
import EditorContainer from './components/EditorContainer';
import FindingsPanel from './components/FindingsPanel';
import DiffViewer from './components/DiffViewer';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CicdPipelineSimulator from './components/CicdPipelineSimulator';
import DependencyScanner from './components/DependencyScanner';
import CustomRuleBuilder from './components/CustomRuleBuilder';
import AuditReportModal from './components/AuditReportModal';
import ManageModelsModal from './components/ManageModelsModal';
import SeveraDefenderChat from './components/SeveraDefenderChat';
import { Shield, Sparkles } from 'lucide-react';

import { analyzeCode } from './engine/scannerEngine';
import { generateAiReview } from './engine/aiReviewer';
import { detectLanguage } from './engine/languageDetector';
import { CODE_TEMPLATES } from './engine/templates';
import { cloudSyncService } from './services/cloudSyncService';
import { storageService } from './services/storageService';

const INITIAL_SESSIONS = [
  { id: 'sess-1', name: 'Flask SQLi & Secret Audit', code: CODE_TEMPLATES[0].code, language: 'python', findings: [], timeAgo: '1h' },
  { id: 'sess-2', name: 'React DOM XSS Scan', code: CODE_TEMPLATES[1].code, language: 'javascript', findings: [], timeAgo: '8h' },
  { id: 'sess-3', name: 'Node Express RCE Audit', code: CODE_TEMPLATES[2].code, language: 'javascript', findings: [], timeAgo: '1d' },
  { id: 'sess-4', name: 'Dockerfile Root Security', code: CODE_TEMPLATES[3].code, language: 'dockerfile', findings: [], timeAgo: '1w' }
];

// Helper to ensure every file in projectFolders has concrete, resolved 'code' property
const resolveProjectFiles = (folders) => {
  if (!Array.isArray(folders)) return [];
  return folders.map((folder) => {
    const resolvedFiles = (folder.files || []).map((f) => {
      let fCode = f.code;
      if (fCode === undefined || fCode === null) {
        if (f.templateId === 'blank') {
          fCode = `# Fresh Blank Code File for ${folder.name}\n\n`;
        } else if (f.templateId) {
          const tpl = CODE_TEMPLATES.find((t) => t.id === f.templateId);
          fCode = tpl ? tpl.code : `# Code file for ${f.name}\n`;
        } else {
          fCode = `# Code file for ${f.name}\n`;
        }
      }
      return {
        path: f.path || f.name,
        name: f.name,
        code: fCode,
        language: f.language || detectLanguage(fCode, f.name),
        templateId: f.templateId
      };
    });
    return { ...folder, files: resolvedFiles };
  });
};

export default function App({ user, onLogout }) {
  const isDemoUser = user?.email === 'demo@severa.ai';

  const [code, setCode] = useState(() =>
    isDemoUser ? CODE_TEMPLATES[0].code : '# Welcome to Severa AI Security Platform\n# Paste or upload your source code here to analyze with Severa...\n'
  );
  const [language, setLanguage] = useState(() =>
    isDemoUser ? CODE_TEMPLATES[0].language : 'python'
  );
  const [activeTab, setActiveTab] = useState('workbench');
  const [customRules, setCustomRules] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [fixedLineNumbers, setFixedLineNumbers] = useState([]);

  // Active Project & File Breadcrumb State (User directive: Show Folder & File Name in top header)
  const [activeProjectName, setActiveProjectName] = useState(() =>
    isDemoUser ? 'ai project' : 'my-workspace'
  );
  const [activeFileName, setActiveFileName] = useState('main.py');

  // Active AI Model Provider State
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

  // Resizable Security Inspector Panel State (280px - 580px)
  const [findingsWidth, setFindingsWidth] = useState(380);
  const isDraggingFindings = useRef(false);

  const handleFindingsMouseDown = (e) => {
    e.preventDefault();
    isDraggingFindings.current = true;
    const startX = e.clientX;
    const startWidth = findingsWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvt) => {
      if (!isDraggingFindings.current) return;
      const delta = startX - moveEvt.clientX;
      const newWidth = Math.max(280, Math.min(580, startWidth + delta));
      setFindingsWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingFindings.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Scan Sessions History State
  const [scanSessions, setScanSessions] = useState(() =>
    isDemoUser ? INITIAL_SESSIONS : [
      {
        id: 'sess-new',
        name: 'Fresh Code Audit',
        code: '# Welcome to Severa AI Security Platform\n# Paste or upload your source code here to analyze with Severa...\n',
        language: 'python',
        findings: [],
        timeAgo: 'Just now'
      }
    ]
  );
  const [activeSessionId, setActiveSessionId] = useState(() =>
    isDemoUser ? 'sess-1' : 'sess-new'
  );

  // Multi-File Project Folder State & Synchronization
  const [projectFolders, setProjectFolders] = useState(() => {
    const defaultFolders = isDemoUser ? [
      { id: 'p1', name: 'ai project', files: [{ name: 'main.py', templateId: 'py-sqli' }], session: 'Flask SQLi & Secret Audit' },
      { id: 'p2', name: 'react-frontend-sec', files: [{ name: 'App.jsx', templateId: 'js-xss' }], session: 'React DOM XSS Audit' },
      { id: 'p3', name: 'node-express-rce', files: [{ name: 'server.js', templateId: 'node-rce' }], session: 'Node Express RCE Audit' },
      { id: 'p4', name: 'docker-containers', files: [{ name: 'Dockerfile', templateId: 'docker-sec' }], session: 'Dockerfile Root Hardening' },
      { id: 'p5', name: 'python-deser', files: [{ name: 'deserialize.py', templateId: 'py-deser' }], session: 'Insecure Pickle Deserialization' }
    ] : [
      { id: 'p1', name: 'my-workspace', files: [{ name: 'main.py', templateId: 'blank' }], session: 'Fresh Code Audit' }
    ];
    return resolveProjectFiles(defaultFolders);
  });

  const [projectFiles, setProjectFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);

  // Per-User Scoped AI Configurations & API Key Persistence
  useEffect(() => {
    const userEmail = user?.email || 'guest';
    try {
      const key = storageService.getUserApiKey(userEmail);
      const modelCfg = storageService.getUserModelConfig(userEmail);

      if (key) setApiKey(key);
      if (modelCfg.provider) setSelectedProvider(modelCfg.provider);
      if (modelCfg.model) setSelectedModel(modelCfg.model);
      if (modelCfg.endpoint !== undefined) setCustomEndpoint(modelCfg.endpoint);
    } catch {}
  }, [user?.email]);

  // Persistent Workspace Load across Logins, Logouts, Sessions, & Devices (Strict User Isolation)
  useEffect(() => {
    const userKey = user?.email ? user.email.trim().toLowerCase() : 'guest';
    setIsWorkspaceLoaded(false);
    
    async function loadWorkspace() {
      try {
        // Try cloud sync first if logged in
        let saved = null;
        if (user?.email) {
          saved = await cloudSyncService.fetchUserWorkspace(user.email);
        }

        // Fallback to strict per-user local device storage (NO shared/latest fallback!)
        if (!saved) {
          const savedStr = localStorage.getItem(`severa_workspace_${userKey}`);
          if (savedStr) saved = JSON.parse(savedStr);
        }

        if (saved) {
          if (saved.code !== undefined && saved.code.trim().length > 0) setCode(saved.code);
          if (saved.language) setLanguage(saved.language);
          if (saved.activeProjectName) setActiveProjectName(saved.activeProjectName);
          if (saved.activeFileName) setActiveFileName(saved.activeFileName);
          if (saved.projectFolders && Array.isArray(saved.projectFolders) && saved.projectFolders.length > 0) {
            setProjectFolders(resolveProjectFiles(saved.projectFolders));
          }
          if (saved.projectFiles && Array.isArray(saved.projectFiles) && saved.projectFiles.length > 0) setProjectFiles(saved.projectFiles);
          if (saved.scanSessions && Array.isArray(saved.scanSessions) && saved.scanSessions.length > 0) setScanSessions(saved.scanSessions);
          if (saved.activeSessionId) setActiveSessionId(saved.activeSessionId);
          if (saved.customRules && Array.isArray(saved.customRules)) setCustomRules(saved.customRules);

          // Restore AI Provider & Model Configuration
          if (saved.apiConfig) {
            if (saved.apiConfig.selectedProvider) setSelectedProvider(saved.apiConfig.selectedProvider);
            if (saved.apiConfig.selectedModel) setSelectedModel(saved.apiConfig.selectedModel);
            if (saved.apiConfig.customEndpoint) setCustomEndpoint(saved.apiConfig.customEndpoint);
          }
          const restoredKey = storageService.getUserApiKey(userKey);
          if (restoredKey) setApiKey(restoredKey);
        } else {
          // Fresh clean workspace strictly isolated to this new user account
          const initialCode = isDemoUser 
            ? CODE_TEMPLATES[0].code 
            : '# Welcome to Severa AI Security Platform\n# Paste or upload your source code here to analyze with Severa...\n';
          const initialLang = isDemoUser ? CODE_TEMPLATES[0].language : 'python';
          const initialProjName = isDemoUser ? 'ai project' : 'my-workspace';
          const initialFileName = 'main.py';

          const initialFolders = isDemoUser ? [
            { id: 'p1', name: 'ai project', files: [{ name: 'main.py', templateId: 'py-sqli' }], session: 'Flask SQLi & Secret Audit' },
            { id: 'p2', name: 'react-frontend-sec', files: [{ name: 'App.jsx', templateId: 'js-xss' }], session: 'React DOM XSS Audit' },
            { id: 'p3', name: 'node-express-rce', files: [{ name: 'server.js', templateId: 'node-rce' }], session: 'Node Express RCE Audit' },
            { id: 'p4', name: 'docker-containers', files: [{ name: 'Dockerfile', templateId: 'docker-sec' }], session: 'Dockerfile Root Hardening' },
            { id: 'p5', name: 'python-deser', files: [{ name: 'deserialize.py', templateId: 'py-deser' }], session: 'Insecure Pickle Deserialization' }
          ] : [
            { id: 'p1', name: 'my-workspace', files: [{ name: 'main.py', code: initialCode }], session: 'Fresh Code Audit' }
          ];

          const initialSessions = isDemoUser ? INITIAL_SESSIONS : [
            {
              id: 'sess-new',
              name: 'Fresh Code Audit',
              code: initialCode,
              language: initialLang,
              findings: [],
              timeAgo: 'Just now'
            }
          ];

          setCode(initialCode);
          setLanguage(initialLang);
          setActiveProjectName(initialProjName);
          setActiveFileName(initialFileName);
          setActiveFilePath(initialFileName);
          setProjectFolders(resolveProjectFiles(initialFolders));
          setProjectFiles([]);
          setScanSessions(initialSessions);
          setActiveSessionId(isDemoUser ? 'sess-1' : 'sess-new');
          setCustomRules([]);
        }
      } catch {
      } finally {
        setIsWorkspaceLoaded(true);
      }
    }

    loadWorkspace();
  }, [user?.email]);

  // Auto-Save Workspace Snapshot on any change (Strict Per-User Storage Only)
  useEffect(() => {
    if (!isWorkspaceLoaded) return; // Prevent wiping storage before load completes!

    const userKey = user?.email ? user.email.trim().toLowerCase() : 'guest';
    try {
      const snapshot = {
        code,
        language,
        activeProjectName,
        activeFileName,
        projectFolders,
        projectFiles,
        scanSessions,
        activeSessionId,
        customRules,
        apiConfig: {
          selectedProvider,
          selectedModel,
          customEndpoint
        },
        lastSavedAt: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(snapshot);
      localStorage.setItem(`severa_workspace_${userKey}`, jsonStr);

      if (user?.email) {
        cloudSyncService.saveUserWorkspace(user.email, snapshot);
      }
    } catch {}
  }, [
    isWorkspaceLoaded, code, language, activeProjectName, activeFileName, projectFolders,
    projectFiles, scanSessions, activeSessionId, customRules,
    selectedProvider, selectedModel, customEndpoint, user?.email
  ]);

  const handleSaveApiKey = (keyVal) => {
    setApiKey(keyVal);
    if (user?.email) {
      storageService.setUserApiKey(user.email, keyVal);
    }
  };

  const handleSaveProvider = (providerVal) => {
    setSelectedProvider(providerVal);
    if (user?.email) {
      storageService.setUserModelConfig(user.email, { provider: providerVal, model: selectedModel, endpoint: customEndpoint });
    }
  };

  const handleSaveModel = (modelVal) => {
    setSelectedModel(modelVal);
    if (user?.email) {
      storageService.setUserModelConfig(user.email, { provider: selectedProvider, model: modelVal, endpoint: customEndpoint });
    }
  };

  const handleSaveEndpoint = (endpointVal) => {
    setCustomEndpoint(endpointVal);
    if (user?.email) {
      storageService.setUserModelConfig(user.email, { provider: selectedProvider, model: selectedModel, endpoint: endpointVal });
    }
  };

  // Synchronous Code Edit & Paste Handler for Real-Time Storage Auto-Sync
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setFixedLineNumbers([]);

    if (activeFileName && activeProjectName) {
      setProjectFiles((prev) =>
        prev.map((f) => (f.name === activeFileName || f.path === activeFilePath ? { ...f, code: newCode } : f))
      );
      setProjectFolders((prev) =>
        prev.map((folder) => {
          if (folder.name === activeProjectName) {
            const files = folder.files || [];
            const hasFile = files.some((f) => f.name === activeFileName || f.path === activeFilePath);
            const updatedFiles = hasFile
              ? files.map((f) => (f.name === activeFileName || f.path === activeFilePath ? { ...f, code: newCode } : f))
              : [...files, { name: activeFileName, code: newCode, path: activeFilePath || activeFileName }];
            return { ...folder, files: updatedFiles };
          }
          return folder;
        })
      );
    }
  };

  // Select project & file from breadcrumbs or sidebar
  const handleSelectProjectFile = (projectName, fileName) => {
    setActiveTab('workbench');

    if (activeFileName && code) {
      const currentCode = code;
      setProjectFiles((prev) =>
        prev.map((f) => (f.name === activeFileName || f.path === activeFilePath ? { ...f, code: currentCode } : f))
      );
      setProjectFolders((prev) =>
        prev.map((folder) => {
          if (folder.name === activeProjectName) {
            const files = folder.files || [];
            const updatedFiles = files.map((f) => (f.name === activeFileName ? { ...f, code: currentCode } : f));
            return { ...folder, files: updatedFiles };
          }
          return folder;
        })
      );
    }

    setActiveProjectName(projectName);
    setActiveFileName(fileName);
    setActiveFilePath(fileName);

    const targetFolder = projectFolders.find((p) => p.name === projectName);
    const targetFileObj = targetFolder?.files?.find((f) => f.name === fileName);
    const pfMatch = projectFiles.find((f) => f.name === fileName || f.path === fileName);

    let targetCode = targetFileObj?.code !== undefined ? targetFileObj.code : pfMatch?.code;

    if (targetCode === undefined && targetFileObj?.templateId) {
      const foundTpl = CODE_TEMPLATES.find((t) => t.id === targetFileObj.templateId);
      targetCode = foundTpl ? foundTpl.code : `# Code file for ${fileName}\n`;
      setProjectFolders((prev) =>
        prev.map((p) => (p.name === projectName ? { ...p, files: (p.files || []).map((f) => (f.name === fileName ? { ...f, code: targetCode } : f)) } : p))
      );
    } else if (targetCode === undefined) {
      targetCode = `# Fresh Blank Code File for ${projectName}\n\n`;
    }

    setCode(targetCode);
    const lang = detectLanguage(targetCode, fileName);
    setLanguage(lang);
    setFixedLineNumbers([]);
    handleScan(targetCode, lang, fileName, projectName);
  };

  // Synchronize projectFiles when activeProjectName or projectFolders changes
  useEffect(() => {
    const currentFolderObj = projectFolders.find((p) => p.name === activeProjectName);
    if (currentFolderObj && currentFolderObj.files && currentFolderObj.files.length > 0) {
      const folderFiles = currentFolderObj.files.map((f) => {
        let fCode = f.code;
        if ((f.name === activeFileName || f.path === activeFilePath) && code && code.trim().length > 0) {
          fCode = code;
        } else if (fCode === undefined) {
          const foundTpl = CODE_TEMPLATES.find((t) => t.id === f.templateId);
          fCode = foundTpl ? foundTpl.code : `# Code file for ${f.name}\n`;
        }
        const fLang = detectLanguage(fCode, f.name);
        const scanRes = analyzeCode(fCode, fLang, customRules);
        return {
          path: f.path || f.name,
          name: f.name,
          code: fCode,
          language: fLang,
          findings: scanRes.findings,
          metrics: scanRes.metrics
        };
      });
      setProjectFiles(folderFiles);
    } else {
      setProjectFiles([]);
    }
  }, [activeProjectName, projectFolders, customRules]);

  const activeSession = scanSessions.find((s) => s.id === activeSessionId) || scanSessions[0] || {
    id: 'sess-default',
    name: 'Fresh Code Audit',
    code: code,
    language: language,
    findings: [],
    timeAgo: 'Just now'
  };

  const [scanMetrics, setScanMetrics] = useState({
    totalLines: 0,
    score: 100,
    grade: 'A+',
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalFindings: 0,
    complexity: 1,
    maintainability: 100
  });

  const [findings, setFindings] = useState([]);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDefenderOpen, setIsDefenderOpen] = useState(false);

  const [defenderTargetFinding, setDefenderTargetFinding] = useState(null);
  const [isApplyFixModalOpen, setIsApplyFixModalOpen] = useState(false);
  const [projectScanToast, setProjectScanToast] = useState({ show: false, fileCount: 0, findingsCount: 0, projectName: '' });

  // Open Severa Defender AI with a specific finding context
  const handleOpenDefenderWithFinding = (finding = null) => {
    setDefenderTargetFinding(finding);
    setIsDefenderOpen(true);
  };

  // Run SAST & AI Analysis on active file & update project file state
  const handleScan = useCallback((targetCode, targetLanguage, optFileName, optProjName) => {
    setIsScanning(true);
    const activeCode = targetCode !== undefined ? targetCode : code;
    const activeLang = targetLanguage || language;
    const currentFileName = optFileName || activeFileName;
    const currentProjName = optProjName || activeProjectName;

    const result = analyzeCode(activeCode, activeLang, customRules);
    let finalFindings = [...result.findings];

    setFindings(finalFindings);
    setScanMetrics(result.metrics);

    // Trigger AI remediation review generation (works offline locally & online via API key)
    if (finalFindings.length > 0 || (apiKey && apiKey.trim().length > 5)) {
      setIsAiLoading(true);
      generateAiReview(activeCode, activeLang, finalFindings, apiKey)
        .then((aiRes) => {
          if (aiRes) {
            setAiReviewData(aiRes);
            if (aiRes.aiFindings && Array.isArray(aiRes.aiFindings) && aiRes.aiFindings.length > 0) {
              const existingLineRuleMap = new Set(finalFindings.map((f) => `${f.line}:${f.ruleId}`));
              const freshAiFindings = aiRes.aiFindings.filter((f) => !existingLineRuleMap.has(`${f.line}:${f.ruleId}`));
              if (freshAiFindings.length > 0) {
                finalFindings = [...finalFindings, ...freshAiFindings];
                setFindings(finalFindings);

                let criticalCount = 0;
                let highCount = 0;
                let mediumCount = 0;
                let lowCount = 0;

                finalFindings.forEach((f) => {
                  if (f.severity === 'CRITICAL') criticalCount++;
                  else if (f.severity === 'HIGH') highCount++;
                  else if (f.severity === 'MEDIUM') mediumCount++;
                  else if (f.severity === 'LOW') lowCount++;
                });

                let score = 100 - (criticalCount * 25 + highCount * 15 + mediumCount * 8 + lowCount * 3);
                score = Math.max(0, Math.min(100, score));
                let grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

                setScanMetrics((prev) => ({
                  ...prev,
                  score,
                  grade,
                  criticalCount,
                  highCount,
                  mediumCount,
                  lowCount,
                  totalFindings: finalFindings.length
                }));
              }
            }
          }
        })
        .catch((err) => console.warn("AI security review error:", err))
        .finally(() => {
          setIsAiLoading(false);
        });
    } else {
      setAiReviewData(null);
    }

    // 1. Sync active file code & findings in projectFiles array
    setProjectFiles((prevFiles) => {
      const hasFile = prevFiles.some((f) => f.name === currentFileName || f.path === currentFileName);
      if (hasFile) {
        return prevFiles.map((file) => {
          if (file.name === currentFileName || file.path === currentFileName) {
            return {
              ...file,
              code: activeCode,
              language: activeLang,
              findings: finalFindings,
              metrics: result.metrics
            };
          }
          return file;
        });
      }
      return prevFiles;
    });

    // 2. Sync active file code in projectFolders array (Permanent Project Tree Auto-Sync)
    setProjectFolders((prevFolders) =>
      prevFolders.map((folder) => {
        if (folder.name === currentProjName) {
          const files = folder.files || [];
          const hasFile = files.some((f) => f.name === currentFileName);
          const updatedFiles = hasFile
            ? files.map((f) => (f.name === currentFileName ? { ...f, code: activeCode } : f))
            : [...files, { name: currentFileName, code: activeCode, path: currentFileName }];
          return { ...folder, files: updatedFiles };
        }
        return folder;
      })
    );

    // 3. Sync active scanSession (Conversation History)
    setScanSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, findings: finalFindings, code: activeCode, language: activeLang } : s))
    );

    setProjectScanToast((prev) => ({
      ...prev,
      findingsCount: finalFindings.length,
      fixedCount: 0
    }));

    setTimeout(() => {
      setIsScanning(false);
    }, 350);
  }, [code, language, customRules, activeFilePath, activeFileName, activeProjectName, activeSessionId, apiKey, setFindings, setScanMetrics, setIsAiLoading, setAiReviewData, setProjectFiles, setProjectFolders, setScanSessions, setIsScanning]);

  // Initial Scan on Mount
  useEffect(() => {
    handleScan(code, language);
  }, [code, language, handleScan]);

  // Scan Full Project across all project files in folder
  const handleScanFullProject = () => {
    setIsScanning(true);

    const currentFolderObj = projectFolders.find((p) => p.name === activeProjectName);
    let filesToScan = [];

    if (projectFiles && projectFiles.length > 0) {
      filesToScan = projectFiles.map((f) => {
        if (f.name === activeFileName || f.path === activeFilePath) {
          return { ...f, code: code, language: language };
        }
        return f;
      });
    } else if (currentFolderObj && currentFolderObj.files) {
      filesToScan = currentFolderObj.files.map((f) => {
        let fCode = f.code;
        if (f.name === activeFileName) {
          fCode = code;
        } else if (fCode === undefined) {
          const foundTpl = CODE_TEMPLATES.find((t) => t.id === f.templateId);
          fCode = foundTpl ? foundTpl.code : `# Code file for ${f.name}\n`;
        }
        const fLang = detectLanguage(fCode, f.name);
        return {
          path: f.name,
          name: f.name,
          code: fCode,
          language: fLang
        };
      });
    } else {
      filesToScan = [
        {
          path: activeFileName,
          name: activeFileName,
          code: code,
          language: language
        }
      ];
    }

    let totalCrit = 0;
    let totalHigh = 0;
    let totalMed = 0;
    let totalLow = 0;
    let totalProjectFindings = 0;

    const scannedFiles = filesToScan.map((fileObj) => {
      const scanRes = analyzeCode(fileObj.code, fileObj.language, customRules);
      const fileFindings = scanRes.findings || [];

      fileFindings.forEach((f) => {
        if (f.severity === 'CRITICAL') totalCrit++;
        else if (f.severity === 'HIGH') totalHigh++;
        else if (f.severity === 'MEDIUM') totalMed++;
        else totalLow++;
      });
      totalProjectFindings += fileFindings.length;

      return {
        ...fileObj,
        findings: fileFindings,
        metrics: scanRes.metrics
      };
    });

    setProjectFiles(scannedFiles);

    let overallScore = 100 - (totalCrit * 25 + totalHigh * 15 + totalMed * 8 + totalLow * 3);
    overallScore = Math.max(0, Math.min(100, overallScore));
    let overallGrade = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F';

    setScanMetrics({
      totalLines: scannedFiles.reduce((acc, f) => acc + (f.code ? f.code.split('\n').length : 0), 0),
      score: overallScore,
      grade: overallGrade,
      criticalCount: totalCrit,
      highCount: totalHigh,
      mediumCount: totalMed,
      lowCount: totalLow,
      totalFindings: totalProjectFindings,
      complexity: scannedFiles.length * 2,
      maintainability: overallScore
    });

    setProjectScanToast({
      show: true,
      fileCount: scannedFiles.length,
      findingsCount: totalProjectFindings,
      projectName: activeProjectName
    });

    setTimeout(() => {
      setIsScanning(false);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    }, 300);

    setTimeout(() => {
      setProjectScanToast((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // History Session Handlers
  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
    setCode(session.code);
    setLanguage(session.language);
    setFixedLineNumbers([]);
    handleScan(session.code, session.language);
  };

  const handleNewSession = () => {
    const newId = `sess-${Date.now()}`;
    const newSess = {
      id: newId,
      name: `Custom Audit ${scanSessions.length + 1}`,
      code: '# New Scratchpad\n',
      language: 'python',
      findings: [],
      timeAgo: 'Just now'
    };
    setScanSessions([newSess, ...scanSessions]);
    handleSelectSession(newSess);
  };

  const handleDeleteSession = (sessionId) => {
    const updated = scanSessions.filter((s) => s.id !== sessionId);
    setScanSessions(updated);
    if (updated.length > 0 && activeSessionId === sessionId) {
      handleSelectSession(updated[0]);
    }
  };

  const handleRenameSession = (sessionId, newName) => {
    setScanSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
    );
  };

  // Create Blank New Project Folder (Fresh Blank File Initialization)
  const handleCreateBlankProject = (projectName, fileName) => {
    setActiveProjectName(projectName);
    setActiveFileName(fileName);
    setActiveFilePath(fileName);

    const blankContent = `# Fresh Blank Code File for ${projectName}\n\n`;
    const detected = detectLanguage(blankContent, fileName);
    const newFileObj = { name: fileName, code: blankContent, path: fileName };

    setProjectFiles([newFileObj]);
    setProjectFolders((prev) => {
      const exists = prev.some((p) => p.name === projectName);
      if (exists) {
        return prev.map((p) => (p.name === projectName ? { ...p, files: [newFileObj, ...(p.files || []).filter((f) => f.name !== fileName)] } : p));
      }
      return [{ name: projectName, files: [newFileObj] }, ...prev];
    });

    setCode(blankContent);
    setLanguage(detected);
    setFixedLineNumbers([]);
    handleScan(blankContent, detected, fileName, projectName);
  };

  // Create New File inside Project
  const handleCreateFileInProject = (projectName, fileName) => {
    setActiveProjectName(projectName);
    setActiveFileName(fileName);
    setActiveFilePath(fileName);

    const blankContent = `# Fresh Blank Code File: ${fileName}\n\n`;
    const detected = detectLanguage(blankContent, fileName);
    const newFileObj = { name: fileName, code: blankContent, path: fileName };

    setProjectFiles((prev) => [newFileObj, ...prev.filter((f) => f.name !== fileName)]);
    setProjectFolders((prev) =>
      prev.map((folder) => {
        if (folder.name === projectName) {
          const files = folder.files || [];
          const updatedFiles = [newFileObj, ...files.filter((f) => f.name !== fileName)];
          return { ...folder, files: updatedFiles };
        }
        return folder;
      })
    );

    setCode(blankContent);
    setLanguage(detected);
    setFixedLineNumbers([]);
    handleScan(blankContent, detected, fileName, projectName);
  };

  // Upload File directly to Project Folder
  const handleUploadFileToProject = (projectName, fileName, fileContent) => {
    setActiveProjectName(projectName);
    setActiveFileName(fileName);
    setActiveFilePath(fileName);

    const detected = detectLanguage(fileContent, fileName);
    const fileObj = { name: fileName, code: fileContent, path: fileName };

    setProjectFiles((prev) => [fileObj, ...prev.filter((f) => f.name !== fileName)]);
    setProjectFolders((prev) =>
      prev.map((folder) => {
        if (folder.name === projectName) {
          const files = folder.files || [];
          const updatedFiles = [fileObj, ...files.filter((f) => f.name !== fileName)];
          return { ...folder, files: updatedFiles };
        }
        return folder;
      })
    );

    setCode(fileContent);
    setLanguage(detected);
    setFixedLineNumbers([]);
    handleScan(fileContent, detected, fileName, projectName);
  };

  // Rename Project Handler
  const handleRenameProject = (oldName, newName) => {
    if (activeProjectName === oldName) {
      setActiveProjectName(newName);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = (deletedProjectName) => {
    setProjectFolders((prev) => {
      const remaining = prev.filter((p) => p.name !== deletedProjectName);
      if (activeProjectName === deletedProjectName) {
        if (remaining.length > 0) {
          const nextProj = remaining[0];
          const nextFiles = nextProj.files || [];
          const nextFile = nextFiles[0] || { name: 'main.py', code: '# Scratchpad\n' };
          
          setActiveProjectName(nextProj.name);
          setActiveFileName(nextFile.name);
          setActiveFilePath(nextFile.path || nextFile.name);
          const fCode = nextFile.code || '# Scratchpad\n';
          setCode(fCode);
          setLanguage(nextFile.language || detectLanguage(fCode, nextFile.name));
          handleScan(fCode, nextFile.language || detectLanguage(fCode, nextFile.name), nextFile.name, nextProj.name);
        } else {
          const fallbackProj = { id: 'p-default', name: 'my-workspace', files: [{ name: 'main.py', code: '# Fresh Workspace\n' }] };
          setActiveProjectName('my-workspace');
          setActiveFileName('main.py');
          setActiveFilePath('main.py');
          setCode('# Fresh Workspace\n');
          setLanguage('python');
          return [fallbackProj];
        }
      }
      return remaining;
    });
  };

  // Rename File Handler
  const handleRenameFileInProject = (projectName, oldFileName, newFileName) => {
    if (activeProjectName === projectName && activeFileName === oldFileName) {
      setActiveFileName(newFileName);
    }
  };

  // Delete File Handler
  const handleDeleteFileInProject = (projectName, fileName) => {
    setProjectFolders((prev) =>
      prev.map((folder) => {
        if (folder.name === projectName) {
          const updatedFiles = (folder.files || []).filter((f) => f.name !== fileName && f.path !== fileName);
          return { ...folder, files: updatedFiles };
        }
        return folder;
      })
    );

    setProjectFiles((prev) => prev.filter((f) => f.name !== fileName && f.path !== fileName));

    if (activeProjectName === projectName && (activeFileName === fileName || activeFilePath === fileName)) {
      const currentFolderObj = projectFolders.find((p) => p.name === projectName);
      const remainingFiles = (currentFolderObj?.files || []).filter((f) => f.name !== fileName && f.path !== fileName);
      if (remainingFiles.length > 0) {
        const nextFile = remainingFiles[0];
        setActiveFileName(nextFile.name);
        setActiveFilePath(nextFile.path || nextFile.name);
        const fCode = nextFile.code || '# Code file\n';
        setCode(fCode);
        setLanguage(nextFile.language || detectLanguage(fCode, nextFile.name));
        handleScan(fCode, nextFile.language || detectLanguage(fCode, nextFile.name), nextFile.name, projectName);
      } else {
        setActiveFileName('main.py');
        setActiveFilePath('main.py');
        setCode('# Empty workspace\n');
        setLanguage('python');
      }
    }
  };

  // Select Project Sample from Sidebar
  const handleSelectProjectSample = (templateId, projectName = 'ai project', fileName = 'main.py') => {
    // 1. Save current active file code to projectFiles & projectFolders before switching
    if (activeFileName && code) {
      const currentCode = code;
      setProjectFiles((prev) =>
        prev.map((f) => (f.name === activeFileName || f.path === activeFilePath ? { ...f, code: currentCode } : f))
      );
      setProjectFolders((prev) =>
        prev.map((folder) => {
          if (folder.name === activeProjectName) {
            const files = folder.files || [];
            const updatedFiles = files.map((f) => (f.name === activeFileName ? { ...f, code: currentCode } : f));
            return { ...folder, files: updatedFiles };
          }
          return folder;
        })
      );
    }

    setActiveProjectName(projectName);
    setActiveFileName(fileName);
    setActiveFilePath(fileName);

    const targetFolder = projectFolders.find((p) => p.name === projectName);
    const targetFileObj = targetFolder?.files?.find((f) => f.name === fileName);

    let sampleCode = targetFileObj?.code;
    let sampleLang = targetFileObj?.language || 'python';

    if (sampleCode === undefined) {
      if (templateId === 'blank') {
        sampleCode = `# Fresh Blank Code File for ${projectName}\n\n`;
      } else {
        const found = CODE_TEMPLATES.find((t) => t.id === templateId);
        if (found) {
          sampleCode = found.code;
          sampleLang = found.language;
        } else {
          sampleCode = `# Code file for ${fileName}\n`;
        }
      }
      setProjectFolders((prev) =>
        prev.map((p) => (p.name === projectName ? { ...p, files: (p.files || []).map((f) => (f.name === fileName ? { ...f, code: sampleCode } : f)) } : p))
      );
    }

    setCode(sampleCode);
    setLanguage(sampleLang);
    setFixedLineNumbers([]);

    setProjectFiles((prev) =>
      prev.map((f) => (f.name === fileName ? { ...f, code: sampleCode } : f))
    );

    handleScan(sampleCode, sampleLang, fileName, projectName);
  };

  // Select File from Project Tree Sidebar
  const handleSelectFile = (file) => {
    if (!file) return;

    if (activeFileName && code && activeFileName !== file.name) {
      const currentCode = code;
      setProjectFiles((prev) =>
        prev.map((f) => (f.name === activeFileName || f.path === activeFilePath ? { ...f, code: currentCode } : f))
      );
      setProjectFolders((prev) =>
        prev.map((folder) => {
          if (folder.name === activeProjectName) {
            const files = folder.files || [];
            const updatedFiles = files.map((f) => (f.name === activeFileName ? { ...f, code: currentCode } : f));
            return { ...folder, files: updatedFiles };
          }
          return folder;
        })
      );
    }

    const targetName = file.name;
    const targetPath = file.path || file.name;

    setActiveFilePath(targetPath);
    setActiveFileName(targetName);

    const targetFolder = projectFolders.find((p) => p.name === activeProjectName);
    const targetFileObj = targetFolder?.files?.find((f) => f.name === targetName || f.path === targetPath);
    const pfMatch = projectFiles.find((f) => f.name === targetName || f.path === targetPath);

    let targetCode = targetFileObj?.code !== undefined ? targetFileObj.code : (pfMatch?.code !== undefined ? pfMatch.code : file.code);

    if (targetCode === undefined && (file.templateId || targetFileObj?.templateId)) {
      const tId = file.templateId || targetFileObj?.templateId;
      const foundTpl = CODE_TEMPLATES.find((t) => t.id === tId);
      targetCode = foundTpl ? foundTpl.code : `# Code file for ${targetName}\n`;
      setProjectFolders((prev) =>
        prev.map((p) => (p.name === activeProjectName ? { ...p, files: (p.files || []).map((f) => (f.name === targetName ? { ...f, code: targetCode } : f)) } : p))
      );
    } else if (targetCode === undefined) {
      targetCode = `# Code file for ${targetName}\n`;
    }

    const targetLang = file.language || detectLanguage(targetCode, targetName);

    setCode(targetCode);
    setLanguage(targetLang);
    setFixedLineNumbers([]);

    if (pfMatch?.findings && targetCode === file.code) {
      setFindings(pfMatch.findings);
      setScanMetrics(pfMatch.metrics);
    } else {
      handleScan(targetCode, targetLang, targetName, activeProjectName);
    }
  };

  // Upload Entire Directory / Folder
  // Upload Entire Directory / Folder (Filtered & Optimized for Zero-Freeze Performance)
  const handleUploadFolder = (e) => {
    const rawFiles = e?.target?.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'file';
      hiddenInput.webkitdirectory = true;
      hiddenInput.multiple = true;
      hiddenInput.onchange = (event) => handleUploadFolder(event);
      hiddenInput.click();
      return;
    }

    // Heavy dependency, build artifact, git history, and binary asset filter lists
    const IGNORED_PATHS = [
      'node_modules/', '.git/', 'dist/', 'build/', 'coverage/', '.venv/', 'venv/',
      'vendor/', '__pycache__/', '.next/', '.cache/', '.turbo/', 'package-lock.json',
      'yarn.lock', 'pnpm-lock.yaml'
    ];
    const IGNORED_EXTS = [
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
      '.mp4', '.zip', '.gz', '.pdf', '.svg', '.map', '.min.js', '.min.css'
    ];

    const filteredFiles = rawFiles.filter((file) => {
      const relPath = file.webkitRelativePath || file.name;
      if (IGNORED_PATHS.some((path) => relPath.includes(path))) return false;
      if (IGNORED_EXTS.some((ext) => relPath.toLowerCase().endsWith(ext))) return false;
      return true;
    }).slice(0, 250); // Limit to top 250 source code files for 60FPS UI speed

    const filePromises = filteredFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result || '';
          const detectedLang = detectLanguage(content, file.name);
          const scanRes = analyzeCode(content, detectedLang, customRules);

          resolve({
            path: file.webkitRelativePath || file.name,
            name: file.name,
            code: content,
            language: detectedLang,
            findings: scanRes.findings,
            metrics: scanRes.metrics
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((loadedFiles) => {
      const codeFiles = loadedFiles.filter((f) => f.code && f.code.trim().length > 0);
      if (codeFiles.length > 0) {
        setProjectFiles(codeFiles);
        const folderName = codeFiles[0].path.split('/')[0] || 'uploaded-folder';

        setProjectFolders((prev) => {
          const exists = prev.some((p) => p.name === folderName);
          if (exists) {
            return prev.map((p) => (p.name === folderName ? { ...p, files: codeFiles } : p));
          }
          return [{ name: folderName, files: codeFiles }, ...prev];
        });

        setActiveProjectName(folderName);
        handleSelectFile(codeFiles[0]);
      }
    });
  };

  // Upload Multiple Code Files
  const handleUploadFiles = (e) => {
    const rawFiles = e?.target?.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    const filePromises = rawFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result || '';
          const detectedLang = detectLanguage(content, file.name);
          const scanRes = analyzeCode(content, detectedLang, customRules);

          resolve({
            path: file.name,
            name: file.name,
            code: content,
            language: detectedLang,
            findings: scanRes.findings,
            metrics: scanRes.metrics
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then((loadedFiles) => {
      setProjectFiles(loadedFiles);
      if (loadedFiles.length > 0) {
        handleSelectFile(loadedFiles[0]);
      }
    });
  };

  // Handle GitHub Code / Repo Pull: Automatically Creates Conversation + Project Folder + Multi-File Tree
  const handleGithubPull = (pulledCode, detectedLang, filename, targetUrl = '') => {
    let repoName = 'GitHub-Import';
    if (targetUrl && targetUrl.includes('github.com')) {
      const parts = targetUrl.split('github.com/')[1]?.split('/');
      if (parts && parts.length >= 2 && parts[1].trim()) {
        repoName = parts[1].replace('.git', '').trim();
      } else if (parts && parts.length >= 1 && parts[0].trim()) {
        repoName = parts[0].trim();
      }
    } else if (filename) {
      repoName = filename.split('.')[0] || 'GitHub-Import';
    }

    const convName = `${repoName} Audit`;
    const newSessId = `sess-${Date.now()}`;

    let filesForFolder = [];

    const lowerTarget = (targetUrl + ' ' + repoName + ' ' + filename).toLowerCase();

    if (lowerTarget.includes('webgoat')) {
      filesForFolder = [
        {
          name: 'SqlInjectionLesson.java',
          code: pulledCode || `package org.owasp.webgoat.plugin;\n\nimport java.sql.*;\nimport javax.servlet.http.HttpServletRequest;\n\npublic class SqlInjectionLesson {\n    public void executeQuery(HttpServletRequest request, Connection conn) throws Exception {\n        String username = request.getParameter("username");\n        // VULNERABLE: Direct SQL string concatenation (CWE-89)\n        String query = "SELECT * FROM users WHERE name = '" + username + "'";\n        Statement stmt = conn.createStatement();\n        ResultSet rs = stmt.executeQuery(query);\n        System.out.println("User query executed for: " + username); // VULNERABLE: Sensitive log exposure\n    }\n}`,
          language: 'java'
        },
        {
          name: 'CommandInjectionLesson.java',
          code: `package org.owasp.webgoat.plugin;\n\nimport java.io.*;\n\npublic class CommandInjectionLesson {\n    public void runSystemCommand(String host) throws IOException {\n        // VULNERABLE: Unsanitized command execution (CWE-78)\n        Runtime.getRuntime().exec("ping -c 1 " + host);\n    }\n}`,
          language: 'java'
        },
        {
          name: 'JwtSecretConfig.java',
          code: `package org.owasp.webgoat.plugin;\n\npublic class JwtConfig {\n    // VULNERABLE: Hardcoded secret (CWE-798)\n    public static final String JWT_SECRET = "webgoat_super_secret_jwt_key_2026";\n}`,
          language: 'java'
        },
        {
          name: 'PathTraversalLesson.java',
          code: `package org.owasp.webgoat.plugin;\n\nimport java.io.*;\nimport javax.servlet.http.HttpServletRequest;\n\npublic class PathTraversalLesson {\n    public void readLogFile(HttpServletRequest request) throws IOException {\n        String fileName = request.getParameter("filepath");\n        // VULNERABLE: Unsanitized path traversal\n        File file = new File("/var/log/webgoat/" + fileName);\n        FileReader fr = new FileReader(file);\n    }\n}`,
          language: 'java'
        },
        {
          name: 'WeakHashService.java',
          code: `package org.owasp.webgoat.plugin;\n\nimport java.security.MessageDigest;\n\npublic class WeakHashService {\n    public byte[] hashPassword(String password) throws Exception {\n        // VULNERABLE: Weak MD5 password hash (CWE-327)\n        MessageDigest md = MessageDigest.getInstance("MD5");\n        return md.digest(password.getBytes());\n    }\n}`,
          language: 'java'
        },
        {
          name: 'WebGoatApplication.java',
          code: `package org.owasp.webgoat;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class WebGoatApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(WebGoatApplication.class, args);\n    }\n}`,
          language: 'java'
        }
      ];
    } else if (lowerTarget.includes('juice-shop')) {
      filesForFolder = [
        {
          name: 'search.js',
          code: pulledCode || `// OWASP Juice Shop - Vulnerable Product Search Route (CWE-89 SQL Injection)\nconst models = require('../models')\nconst utils = require('../utils')\n\nmodule.exports = function searchProducts () {\n  return (req, res, next) => {\n    let criteria = req.query.q === undefined ? '' : req.query.q\n    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)\n\n    models.sequelize.query("SELECT * FROM Products WHERE ((name LIKE '%" + criteria + "%' OR description LIKE '%" + criteria + "%') AND deletedAt IS NULL) ORDER BY name")\n      .then(([products]) => {\n        res.json(utils.queryResultToJson(products))\n      }).catch(error => next(error))\n  }\n}`,
          language: 'javascript'
        },
        {
          name: 'redirect.js',
          code: `const utils = require('../utils')\n\nmodule.exports = function performRedirect () {\n  return (req, res) => {\n    const target = req.query.to;\n    // VULNERABLE: Unvalidated redirect (CWE-601)\n    res.redirect(target);\n  }\n}`,
          language: 'javascript'
        },
        {
          name: 'profile.js',
          code: `// User profile update handler\nconst STRIPE_SECRET = "sk_live_juice_shop_992182"; // VULNERABLE: Hardcoded secret\n\nfunction renderProfile(userComment) {\n  // VULNERABLE: Unsanitized HTML insertion\n  document.getElementById("bio").innerHTML = userComment;\n}`,
          language: 'javascript'
        },
        {
          name: 'logViewer.js',
          code: `const fs = require('fs')\nconst path = require('path')\n\nmodule.exports = function readLog() {\n  return (req, res) => {\n    const file = req.query.file\n    // VULNERABLE: Path Traversal\n    fs.readFile(path.join('/var/log/app/', file), 'utf8', (err, data) => {\n      res.send(data)\n    })\n  }\n}`,
          language: 'javascript'
        },
        {
          name: 'server.js',
          code: `const express = require('express')\nconst app = express()\n\napp.get('/', (req, res) => res.send('Juice Shop Online'))\napp.listen(3000)`,
          language: 'javascript'
        }
      ];
    } else {
      filesForFolder = [
        {
          name: filename || 'main.js',
          code: pulledCode,
          language: detectedLang || 'javascript'
        }
      ];
    }

    const primaryFile = filesForFolder[0];

    // 1. Create & Add Conversation Session to Sidebar
    const newSession = {
      id: newSessId,
      name: convName,
      code: primaryFile.code,
      language: primaryFile.language,
      findings: [],
      timeAgo: 'Just now'
    };
    setScanSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessId);

    // 2. Create & Add Project Folder to Sidebar Tree
    const newProjectObj = {
      id: `proj-${Date.now()}`,
      name: repoName,
      files: filesForFolder.map((f) => ({ name: f.name, code: f.code })),
      session: convName
    };
    setProjectFolders((prev) => {
      const filtered = prev.filter((p) => p.name !== repoName);
      return [newProjectObj, ...filtered];
    });

    // 3. Set Active Workspace Context
    setActiveProjectName(repoName);
    setActiveFileName(primaryFile.name);
    setActiveFilePath(primaryFile.name);
    setCode(primaryFile.code);
    setLanguage(primaryFile.language);
    setFixedLineNumbers([]);

    // 4. Build scanned project files array for Project Explorer
    const scannedProjectFiles = filesForFolder.map((f) => {
      const scanRes = analyzeCode(f.code, f.language, customRules);
      return {
        path: f.name,
        name: f.name,
        code: f.code,
        language: f.language,
        findings: scanRes.findings,
        metrics: scanRes.metrics
      };
    });
    setProjectFiles(scannedProjectFiles);

    // 5. Trigger SAST scan on primary active file
    setTimeout(() => {
      handleScan(primaryFile.code, primaryFile.language);
    }, 100);
  };

  // Run AI Repair & Open Apply Fix Modal Prompt
  const handleGenerateAiFix = async () => {
    setIsAiLoading(true);
    try {
      const review = await generateAiReview(code, language, findings, apiKey);
      setAiReviewData(review);
      setIsApplyFixModalOpen(true);
    } catch (e) {
      console.error("AI Review error:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply AI Fix to Editor Buffer
  const handleApplyFix = (newSecureCode) => {
    const targetCode = newSecureCode || aiReviewData?.fixedCode;
    if (!targetCode) return;

    const remediatedLines = findings.map((f) => f.line);
    setCode(targetCode);
    handleScan(targetCode, language);
    setAiReviewData((prev) => (prev ? { ...prev, applied: true } : null));
    setFixedLineNumbers(remediatedLines);
    setIsApplyFixModalOpen(false);
  };

  // Apply AI Security Fix / Remediation to ALL files in the active project folder (Fast Parallel Execution)
  const handleApplyFixToAllFiles = async () => {
    setIsAiLoading(true);

    try {
      const currentFolderObj = projectFolders.find((p) => p.name === activeProjectName);

      // 1. Gather ALL files in active project folder
      let folderFileEntries = currentFolderObj?.files || [];
      if (folderFileEntries.length === 0 && projectFiles.length > 0) {
        folderFileEntries = projectFiles;
      }

      let filesToProcess = folderFileEntries.map((f) => {
        let fCode = f.code;
        if (f.name === activeFileName && code) {
          fCode = code;
        }
        if (!fCode || fCode.trim().length === 0) {
          const matchInPf = projectFiles.find((pf) => pf.name === f.name);
          if (matchInPf && matchInPf.code) {
            fCode = matchInPf.code;
          } else if (f.templateId) {
            const foundTpl = CODE_TEMPLATES.find((t) => t.id === f.templateId);
            fCode = foundTpl ? foundTpl.code : `# Code file for ${f.name}\n`;
          }
        }
        const fLang = detectLanguage(fCode || '', f.name);
        return {
          path: f.path || f.name,
          name: f.name,
          code: fCode || `# Code for ${f.name}\n`,
          language: fLang
        };
      });

      // 2. Remediate ALL files in PARALLEL using Promise.all for ZERO delay
      let totalVulnerabilitiesFixed = 0;

      const filePromises = filesToProcess.map(async (fileObj) => {
        const fLang = fileObj.language || detectLanguage(fileObj.code, fileObj.name);
        const scanRes = analyzeCode(fileObj.code, fLang, customRules);

        if (scanRes.findings.length > 0) {
          totalVulnerabilitiesFixed += scanRes.findings.length;
          const aiReview = await generateAiReview(fileObj.code, fLang, scanRes.findings, apiKey);
          if (aiReview && aiReview.fixedCode) {
            const postScan = analyzeCode(aiReview.fixedCode, fLang, customRules);
            return {
              path: fileObj.path || fileObj.name,
              name: fileObj.name,
              code: aiReview.fixedCode,
              language: fLang,
              findings: postScan.findings,
              metrics: postScan.metrics,
              aiReview
            };
          }
        }

        return {
          ...fileObj,
          findings: scanRes.findings,
          metrics: scanRes.metrics
        };
      });

      const updatedFiles = await Promise.all(filePromises);

      // 3. Update active file in workspace editor if currently open
      const activeFileUpdated = updatedFiles.find((uf) => uf.name === activeFileName) || updatedFiles[0];
      if (activeFileUpdated) {
        setCode(activeFileUpdated.code);
        setFindings(activeFileUpdated.findings);
        setScanMetrics(activeFileUpdated.metrics);
        if (activeFileUpdated.aiReview) {
          setAiReviewData(activeFileUpdated.aiReview);
        }
        setFixedLineNumbers([]);
      }

      // 4. Update projectFiles state for File Tree & Breakdown
      setProjectFiles(updatedFiles);

      // 5. Update projectFolders state so project files retain updated code permanently
      setProjectFolders((prevFolders) =>
        prevFolders.map((folder) => {
          if (folder.name === activeProjectName) {
            return {
              ...folder,
              files: updatedFiles.map((uf) => ({
                name: uf.name,
                code: uf.code,
                path: uf.path
              }))
            };
          }
          return folder;
        })
      );

      // 6. Update active scanSession code & findings
      setScanSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, code: activeFileUpdated.code, findings: activeFileUpdated.findings }
            : s
        )
      );

      // 7. Calculate total remaining vulnerabilities across folder
      let totalCrit = 0, totalHigh = 0, totalMed = 0, totalLow = 0, totalProjectFindings = 0;
      updatedFiles.forEach((f) => {
        (f.findings || []).forEach((finding) => {
          if (finding.severity === 'CRITICAL') totalCrit++;
          else if (finding.severity === 'HIGH') totalHigh++;
          else if (finding.severity === 'MEDIUM') totalMed++;
          else totalLow++;
        });
        totalProjectFindings += (f.findings?.length || 0);
      });

      let overallScore = 100 - (totalCrit * 25 + totalHigh * 15 + totalMed * 8 + totalLow * 3);
      overallScore = Math.max(0, Math.min(100, overallScore));
      let overallGrade = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F';

      setScanMetrics({
        totalLines: updatedFiles.reduce((acc, f) => acc + (f.code ? f.code.split('\n').length : 0), 0),
        score: overallScore,
        grade: overallGrade,
        criticalCount: totalCrit,
        highCount: totalHigh,
        mediumCount: totalMed,
        lowCount: totalLow,
        totalFindings: totalProjectFindings,
        complexity: updatedFiles.length * 2,
        maintainability: overallScore
      });

      setProjectScanToast({
        show: true,
        fileCount: updatedFiles.length,
        findingsCount: totalProjectFindings,
        projectName: `${activeProjectName} (Fixed ${totalVulnerabilitiesFixed} Flaws across ${updatedFiles.length} files)`
      });
    } catch (err) {
      console.error("Error applying fix to all files in active folder:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex">
      
      {/* Antigravity-Style Sidebar with Projects Tree & Conversations History */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scanMetrics={scanMetrics}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenModelsModal={() => setIsModelsModalOpen(true)}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        apiKey={apiKey}
        customEndpoint={customEndpoint}
        scanSessions={scanSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        projectFolders={projectFolders}
        setProjectFolders={setProjectFolders}
        onSelectProjectSample={handleSelectProjectSample}
        onCreateBlankProject={handleCreateBlankProject}
        onCreateFileInProject={handleCreateFileInProject}
        onUploadFileToProject={handleUploadFileToProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onRenameFileInProject={handleRenameFileInProject}
        onDeleteFileInProject={handleDeleteFileInProject}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Antigravity Top Header Bar displaying Folder Name, Active File Name & Conversation Name */}
        <TopHeaderBar
          activeSession={activeSession}
          onRenameSession={handleRenameSession}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          apiKey={apiKey}
          customEndpoint={customEndpoint}
          activeProjectName={activeProjectName}
          activeFileName={activeFileName}
          projectFolders={projectFolders}
          onSelectProjectFile={handleSelectProjectFile}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenDefender={() => handleOpenDefenderWithFinding(null)}
          onScanFullProject={handleScanFullProject}
        />

        {/* Full Project Scan Completed Toast Banner */}
        {projectScanToast.show && (
          <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900/90 border-b border-purple-500/40 px-6 py-2.5 flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span className="text-xs font-bold text-slate-100 font-mono">
                🛡️ Full Project Scan Completed on <span className="text-purple-300 font-extrabold">{projectScanToast.projectName}</span>: Analyzed <span className="text-cyan-300 font-bold">{projectScanToast.fileCount}</span> file(s), identified <span className="text-amber-300 font-bold">{projectScanToast.findingsCount}</span> vulnerability finding(s).
              </span>
            </div>
            <button
              onClick={() => setProjectScanToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 w-full p-2.5 sm:p-3 space-y-3">
          
          {/* Tab 1: Enterprise Code Workbench */}
          {activeTab === 'workbench' && (
            <div className="space-y-3 h-full">
              <div className="flex flex-col lg:flex-row gap-2 h-full lg:h-[calc(100vh-115px)] min-h-0">
                
                {/* Center Main Editor Area */}
                <div className="flex-1 min-w-0 h-full">
                  <EditorContainer
                    code={code}
                    setCode={handleCodeChange}
                    language={language}
                    setLanguage={setLanguage}
                    onScan={handleScan}
                    onScanFullProject={handleScanFullProject}
                    onGenerateAiFix={handleGenerateAiFix}
                    aiReviewData={aiReviewData}
                    onApplyFix={handleApplyFix}
                    onApplyFixAll={handleApplyFixToAllFiles}
                    findings={findings}
                    isScanning={isScanning}
                    isAiLoading={isAiLoading}
                    projectFiles={projectFiles}
                    activeFilePath={activeFilePath}
                    activeProjectName={activeProjectName}
                    onSelectFile={handleSelectFile}
                    onUploadFolder={handleUploadFolder}
                    onUploadFiles={handleUploadFiles}
                    onGithubPull={handleGithubPull}
                    fixedLineNumbers={fixedLineNumbers}
                  />
                </div>

                {/* Draggable Resizer Handle for Security Inspector Panel */}
                <div
                  onMouseDown={handleFindingsMouseDown}
                  title="Drag left or right to resize security inspector panel (Min: 280px, Max: 580px limit)"
                  className="hidden lg:flex w-2 hover:w-2.5 bg-transparent hover:bg-indigo-500/50 cursor-col-resize shrink-0 items-center justify-center transition-all group/resizer"
                >
                  <div className="w-0.5 h-10 bg-slate-800 group-hover/resizer:bg-indigo-300 rounded-full" />
                </div>

                {/* Right Side Security Inspector Panel */}
                <div 
                  style={{ width: `${findingsWidth}px` }} 
                  className="w-full shrink-0 h-full min-h-0 overflow-hidden"
                >
                  <FindingsPanel
                    findings={findings}
                    projectFiles={projectFiles}
                    onSelectFinding={(f) => console.log('Selected finding:', f)}
                    onSelectFile={handleSelectFile}
                    onGenerateAiFix={handleGenerateAiFix}
                    onOpenDefender={handleOpenDefenderWithFinding}
                    onScanFullProject={handleScanFullProject}
                    aiReviewData={aiReviewData}
                    onApplyFix={handleApplyFix}
                    onApplyFixAll={handleApplyFixToAllFiles}
                  />
                </div>
              </div>

              {/* AI Auto-Fix Diff Panel */}
              {aiReviewData && (
                <DiffViewer
                  aiReviewData={aiReviewData}
                  onApplyFix={handleApplyFix}
                  onClose={() => setAiReviewData(null)}
                />
              )}
            </div>
          )}

          {/* Tab 2: Executive Dashboard */}
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard scanMetrics={scanMetrics} findings={findings} />
          )}

          {/* Tab 3: CI/CD Pipeline Simulator */}
          {activeTab === 'cicd' && (
            <CicdPipelineSimulator scanMetrics={scanMetrics} findings={findings} />
          )}

          {/* Tab 4: Software Composition Analysis (SCA) */}
          {activeTab === 'sca' && <DependencyScanner />}

          {/* Tab 5: Custom Rule Builder */}
          {activeTab === 'rules' && (
            <CustomRuleBuilder customRules={customRules} setCustomRules={setCustomRules} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 shrink-0">
          Severa AI • Production Enterprise Edition • Continuous Code Review & SAST Vulnerability Detection System
        </footer>
      </div>

      {/* Audit Report Modal */}
      <AuditReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        scanMetrics={scanMetrics}
        findings={findings}
        language={language}
        code={code}
        aiReviewData={aiReviewData}
      />

      {/* Central Manage Models & AI Providers Modal */}
      <ManageModelsModal
        isOpen={isModelsModalOpen}
        onClose={() => setIsModelsModalOpen(false)}
        selectedProvider={selectedProvider}
        setSelectedProvider={handleSaveProvider}
        selectedModel={selectedModel}
        setSelectedModel={handleSaveModel}
        apiKey={apiKey}
        setApiKey={handleSaveApiKey}
        customEndpoint={customEndpoint}
        setCustomEndpoint={handleSaveEndpoint}
        user={user}
      />

      {/* Severa Defender AI Chat Assistant Modal */}
      <SeveraDefenderChat
        isOpen={isDefenderOpen}
        onClose={() => {
          setIsDefenderOpen(false);
          setDefenderTargetFinding(null);
        }}
        activeFileName={activeFileName}
        language={language}
        code={code}
        findings={findings}
        targetFinding={defenderTargetFinding}
        apiKey={apiKey}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        customEndpoint={customEndpoint}
      />

      {/* Interactive AI Fix Confirmation Modal ("Apply Correct Code") */}
      {isApplyFixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0d18] border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">AI Security Patch Ready</h3>
                <p className="text-xs text-slate-400">Severa AI generated a remediated patch for <span className="text-cyan-300 font-mono font-bold">{activeFileName}</span></p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-emerald-400">🛡️ Refactored Security Standard Applied:</p>
              <p className="text-slate-400">This fix eliminates unvalidated inputs, replaces raw dynamic concatenations with parameterized statements, and enforces environment secret loading.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsApplyFixModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleApplyFix();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Apply Correct Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Severa Defender Quick Launcher Trigger Button */}
      <button
        onClick={() => handleOpenDefenderWithFinding(null)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-indigo-500/40 group"
      >
        <div className="relative w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
          <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
        </div>
        <span>Severa Defender AI</span>
        {findings.length > 0 && (
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
            {findings.length}
          </span>
        )}
      </button>
    </div>
  );
}

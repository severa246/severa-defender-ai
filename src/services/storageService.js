// Severa AI Security Platform - Storage Service
// Handles user-scoped local storage persistence cleanly with error boundaries.

import { INITIAL_REGISTERED_EMAILS } from '../constants/config';

export const storageService = {
  // Current logged in user session
  getUserSession() {
    try {
      const saved = localStorage.getItem('severa_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_e) {
      return null;
    }
  },

  setUserSession(user) {
    try {
      if (user) {
        localStorage.setItem('severa_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('severa_user');
      }
    } catch (_e) {}
  },

  // Registered Emails list (for duplicate user checks)
  getRegisteredEmails() {
    try {
      const saved = localStorage.getItem('severa_registered_emails');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_EMAILS;
    } catch (_e) {
      return INITIAL_REGISTERED_EMAILS;
    }
  },

  registerEmail(email) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getRegisteredEmails();
    const updated = [...new Set([...existing, cleanEmail])];
    try {
      localStorage.setItem('severa_registered_emails', JSON.stringify(updated));
    } catch (_e) {}
  },

  isEmailRegistered(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getRegisteredEmails();
    return existing.includes(cleanEmail);
  },

  unregisterEmail(email) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getRegisteredEmails();
    const updated = existing.filter((e) => e !== cleanEmail);
    try {
      localStorage.setItem('severa_registered_emails', JSON.stringify(updated));
    } catch (_e) {}
  },

  resetRegisteredEmails() {
    try {
      localStorage.removeItem('severa_registered_emails');
      localStorage.removeItem('severa_user');
    } catch (_e) {}
  },

  // Per-User Scoped Ephemeral Session Storage for API Keys (Cleared when browser tab closes)
  getUserApiKey(email) {
    const userKey = email ? email.trim().toLowerCase() : 'guest';
    try {
      // Purge legacy plaintext key from localStorage if present
      localStorage.removeItem(`severa_api_key_${userKey}`);
      let key = sessionStorage.getItem(`severa_session_api_key_${userKey}`);
      if (!key) {
        const modelCfg = this.getUserModelConfig(userKey);
        if (modelCfg.provider && modelCfg.provider !== 'ollama' && modelCfg.provider !== 'local') {
          // Fallback: check saved provider configs in severa_ai_configs_${userKey} or severa_ai_configs_guest
          const savedConfigsStr = localStorage.getItem(`severa_ai_configs_${userKey}`) || localStorage.getItem('severa_ai_configs_guest');
          if (savedConfigsStr) {
            const savedConfigs = JSON.parse(savedConfigsStr);
            if (Array.isArray(savedConfigs) && savedConfigs.length > 0) {
              const activeCfg = savedConfigs.find((c) => c.provider === modelCfg.provider && c.model === modelCfg.model);
              if (activeCfg && activeCfg.apiKey) {
                key = activeCfg.apiKey;
                sessionStorage.setItem(`severa_session_api_key_${userKey}`, key);
              }
            }
          }
        }
      }
      return key || '';
    } catch (_e) {
      return '';
    }
  },

  setUserApiKey(email, apiKey) {
    const userKey = email ? email.trim().toLowerCase() : 'guest';
    try {
      localStorage.removeItem(`severa_api_key_${userKey}`);
      if (apiKey) {
        sessionStorage.setItem(`severa_session_api_key_${userKey}`, apiKey);
      } else {
        sessionStorage.removeItem(`severa_session_api_key_${userKey}`);
      }
    } catch (_e) {}
  },

  // Per-User Scoped Provider & Model Choice
  getUserModelConfig(email) {
    const userKey = email ? email.trim().toLowerCase() : 'guest';
    try {
      return {
        provider: localStorage.getItem(`severa_provider_${userKey}`) || 'google',
        model: localStorage.getItem(`severa_model_${userKey}`) || 'gemini-1.5-flash',
        endpoint: localStorage.getItem(`severa_endpoint_${userKey}`) || ''
      };
    } catch (_e) {
      return { provider: 'google', model: 'gemini-1.5-flash', endpoint: '' };
    }
  },

  setUserModelConfig(email, { provider, model, endpoint }) {
    const userKey = email ? email.trim().toLowerCase() : 'guest';
    try {
      if (provider !== undefined) localStorage.setItem(`severa_provider_${userKey}`, provider);
      if (model !== undefined) localStorage.setItem(`severa_model_${userKey}`, model);
      if (endpoint !== undefined) localStorage.setItem(`severa_endpoint_${userKey}`, endpoint);
    } catch (_e) {}
  }
};

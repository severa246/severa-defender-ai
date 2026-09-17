// Severa AI Security Platform - Central Configuration & Constants

export const APP_NAME = 'Severa AI Security Platform';
export const APP_VERSION = '1.0.0';

export const DEFAULT_AI_PROVIDERS = [
  { id: 'google', name: 'Google Gemini', defaultModel: 'gemini-1.5-flash' },
  { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o' },
  { id: 'anthropic', name: 'Anthropic Claude', defaultModel: 'claude-3-5-sonnet-20241022' },
  { id: 'ollama', name: 'Ollama (Local LLM)', defaultModel: 'llama3:8b' }
];

export const DEMO_USER = {
  name: 'Demo Security Analyst',
  email: 'demo@severa.ai',
  isNewUser: false
};

export const INITIAL_REGISTERED_EMAILS = [
  'demo@severa.ai',
  'user@gmail.com',
  'developer@github.com'
];

# Severa AI Security Platform

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://github.com/severa-ai/severa-platform)
[![Open Source](https://img.shields.io/badge/Open%20Source-Mini%20Project-emerald.svg)](#license--open-source-notice)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/severa-ai/severa-platform)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev)

> **Severa AI** is an open-source mini-project AI Security Platform designed to detect, explain, and refactor security vulnerabilities in source code, dependency trees, and Docker containers before deployment.

---

## 🌟 Core Capabilities

* 🔍 **Multi-Language SAST Engine**: Client-side static analysis engine detecting SQL Injection, DOM XSS, Remote Code Execution (RCE), Docker root privileges, and insecure deserialization across Python, JavaScript, Node.js, and Dockerfiles.
* 🤖 **Severa Defender AI**: Interactive AI security copilot explaining root cause vulnerabilities, presenting instant side-by-side diff patches, and generating future prevention blueprints.
* 📦 **Software Composition Analysis (SCA)**: Automated dependency scanning highlighting CVE severity scores, affected versions, and patch releases.
* ⚡ **CI/CD Security Gate**: Simulated pull-request scanning pipeline enforcing zero-critical vulnerability policies before deployment.
* 🛠️ **Custom Rule Builder**: Regex-based rule creation engine allowing teams to enforce company-specific security guidelines.
* 🔒 **Zero-Trust User Isolation**: Per-user API key and model config storage (`severa_api_key_${email}`) ensuring complete credential isolation between workspace users.

---

## 🏗️ Architecture & Directory Structure

```
/data/ai project
├── .env.example            # Environment variables configuration template
├── DEPLOYMENT.md           # Production deployment & hosting guide
├── README.md               # Product documentation
├── index.html              # HTML5 entry point
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Vite build configuration
└── src/
    ├── constants/          # Application configuration & defaults
    │   └── config.js
    ├── services/           # Encapsulated Auth & Storage services
    │   ├── storageService.js
    │   └── authService.js
    ├── hooks/              # Custom React hooks
    │   ├── useAuth.js
    │   └── useScanner.js
    ├── engine/             # SAST & SCA scanning logic
    │   ├── sastRules.js
    │   ├── scaScanner.js
    │   ├── scannerEngine.js
    │   └── aiReviewer.js
    ├── components/         # UI Components & Modals
    │   ├── SeveraDefenderChat.jsx
    │   ├── ManageModelsModal.jsx
    │   ├── Sidebar.jsx
    │   └── EditorContainer.jsx
    ├── pages/              # Landing Page, Login & Workbench
    │   ├── LandingPage.jsx
    │   └── LoginPage.jsx
    ├── router/             # Context-based SPA router
    │   └── RouterContext.jsx
    └── utils/              # PDF & JSON security audit report generator
        └── reportGenerator.js
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Production Build
```bash
npm run build
```
The optimized bundle will be created inside the `/dist` directory.

---

## 🔐 Environment Configuration

Create a `.env` file in the project root (see [.env.example](.env.example)):

```env
# Severa AI Backend API Endpoint (Optional)
VITE_SEVERA_API_URL=http://localhost:3000

# Default AI Provider Configuration
VITE_DEFAULT_AI_PROVIDER=google
VITE_DEFAULT_AI_MODEL=gemini-1.5-flash

# Supabase Auth & Cloud Database (Optional for OAuth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Production Deployment Options

Detailed hosting and deployment instructions are available in [DEPLOYMENT.md](DEPLOYMENT.md).

* **Vercel / Netlify**: Connect GitHub repository, set build command `npm run build` and output folder `dist`.
* **Supabase / Firebase**: Enable Google & GitHub OAuth providers in Supabase dashboard.
* **Docker Container**: Build production static bundle and serve via Nginx container.

---

## 📄 License & Open Source Notice

This project is an **Open Source Mini Project** created for **AI-Powered Continuous Code Review and Vulnerability Detection System**. Feel free to inspect, extend, and adapt the security scanning engines for research and educational purposes.

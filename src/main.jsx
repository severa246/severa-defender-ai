import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, useRouter } from './router/RouterContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import App from './App';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error?.toString() || 'Render error' };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Severa UI ErrorBoundary Caught Exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto font-black text-xl">
              🛡️
            </div>
            <h2 className="text-lg font-black text-white">Severa Workspace Ready</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {this.state.errorInfo}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorInfo: null });
                window.location.href = '/';
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Continue to Severa AI
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const router = useRouter();
  const page = router?.page || '/';
  const navigate = router?.navigate || (() => {});
  const user = router?.user || null;
  const setUser = router?.setUser || (() => {});

  function handleLogin(userInfo) {
    setUser(userInfo);
    navigate('/app');
  }

  function handleLogout() {
    setUser(null);
    navigate('/');
  }

  if (page === '/login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (page === '/app') {
    if (!user) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <App user={user} onLogout={handleLogout} />;
  }

  // Default: landing
  return <LandingPage />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider>
        <Root />
      </RouterProvider>
    </ErrorBoundary>
  </StrictMode>,
);

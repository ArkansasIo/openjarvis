// Must stay the first import: fills in crypto.randomUUID before any module uses it.
import './lib/polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import { initApiBase } from './lib/api';
import { initAnalytics } from './lib/analytics';
import './index.css';

function applyTheme() {
  try {
    const raw = localStorage.getItem('openjarvis-settings');
    const settings = raw ? JSON.parse(raw) : {};
    const theme = settings.theme || 'system';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  } catch { /* use system default */ }
}

applyTheme();

const isGitHubPages = import.meta.env.BASE_URL === '/openjarvis/app/';
const Router = isGitHubPages ? HashRouter : BrowserRouter;
const routerProps = isGitHubPages ? {} : { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' };

initApiBase().finally(() => {
  void initAnalytics();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <Router {...routerProps}>
          <App />
        </Router>
      </ErrorBoundary>
    </StrictMode>,
  );
});

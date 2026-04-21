import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const attach = () => {
    document.querySelectorAll('.reveal:not(.is-visible), .reveal-slide:not(.is-visible)').forEach((el) => observer.observe(el));
  };

  const domObserver = new MutationObserver(() => attach());
  window.addEventListener('load', () => {
    attach();
    domObserver.observe(document.body, { childList: true, subtree: true });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);

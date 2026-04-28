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

  const animateCounter = (el) => {
    const raw = (el.dataset.target ?? el.textContent ?? '').trim();
    const match = raw.match(/^(\d+(?:\.\d+)?)([A-Za-z+%]*)$/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const suffix = match[2] || '';
    if (!Number.isFinite(target) || target <= 0) return;
    const duration = 1500;
    const startTime = performance.now();
    const isFloat = !Number.isInteger(target);
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const attach = () => {
    document
      .querySelectorAll('.reveal:not(.is-visible), .reveal-slide:not(.is-visible), .photo-grid-item:not(.is-visible)')
      .forEach((el) => observer.observe(el));
    document
      .querySelectorAll('.stat-number:not([data-counted])')
      .forEach((el) => {
        const raw = (el.dataset.target ?? el.textContent ?? '').trim();
        const match = raw.match(/^(\d+(?:\.\d+)?)/);
        if (!match || parseFloat(match[1]) <= 0) return;
        el.setAttribute('data-counted', '1');
        counterObserver.observe(el);
      });
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

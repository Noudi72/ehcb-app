// API Configuration für Production Deployment
const isDevelopment = import.meta.env.MODE === 'development';

// Local override via LocalStorage (ohne Rebuild änderbar)
const LS_OVERRIDE = typeof window !== 'undefined' ? window.localStorage.getItem('API_BASE_URL') : null;

// Prefer explicit env var; otherwise, if hosted on GitHub Pages, fall back to public Railway URL
const ENV_API = import.meta.env.VITE_API_BASE_URL;
const GITHUB_PAGES_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const RAILWAY_FALLBACK = 'https://ehcb-app-production.up.railway.app';

const PRODUCTION_API_URL = LS_OVERRIDE || ENV_API || (GITHUB_PAGES_HOST ? RAILWAY_FALLBACK : '');
const DEVELOPMENT_API_URL = LS_OVERRIDE || 'http://localhost:3001';

export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// Logging für Debug-Zwecke
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 API Base URL:', API_BASE_URL || '(relative to same origin)');

// Falls erforderlich, können hier weitere API-bezogene Einstellungen gespeichert werden

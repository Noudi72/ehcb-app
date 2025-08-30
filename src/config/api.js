// API Configuration für Production Deployment
const isDevelopment = import.meta.env.MODE === 'development';

// Production API URL (nach Domain-Setup zu aktualisieren)
const PRODUCTION_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ehcb-spirit.ch';
const DEVELOPMENT_API_URL = 'http://localhost:3001';

export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// Logging für Debug-Zwecke
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 API Base URL:', API_BASE_URL);

// Falls erforderlich, können hier weitere API-bezogene Einstellungen gespeichert werden

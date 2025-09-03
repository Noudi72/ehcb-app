// API Configuration für Production Deployment
// HINWEIS: Diese App wurde zu Supabase migriert - Railway API wird nicht mehr verwendet
const isDevelopment = (import.meta.env.MODE === 'development' || import.meta.env.DEV) && 
                      (typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1'));

// Legacy support für News und andere Module die noch Railway verwenden
const ENV_API = import.meta.env.VITE_API_BASE_URL || 'https://ehcb-app-production.up.railway.app';
const GITHUB_PAGES_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const VERCEL_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
const RAILWAY_FALLBACK = 'https://ehcb-app-production.up.railway.app';

// Legacy API für Module die noch nicht zu Supabase migriert wurden
const PRODUCTION_API_URL = RAILWAY_FALLBACK;
const DEVELOPMENT_API_URL = ENV_API || 'http://localhost:3001';

export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// Logging reduziert für weniger Console-Output
if (isDevelopment) {
  console.log('🔗 Legacy API Base URL:', API_BASE_URL);
}

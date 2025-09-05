// API Configuration für Production Deployment
// HINWEIS: Wir verwenden ausschließlich Supabase als Backend
console.log('🚀 Verwende Supabase als Backend');

// Legacy support für News und andere Module die noch Railway verwenden
// DEAKTIVIERT: Railway ist nicht mehr verfügbar (503 Error)
const ENV_API = null; // Deaktiviert
const GITHUB_PAGES_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const VERCEL_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
const RAILWAY_FALLBACK = null; // Deaktiviert

// Export der API URL - null da wir nur Supabase verwenden
export const API_BASE_URL = null;

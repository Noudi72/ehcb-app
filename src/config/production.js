// Production API Configuration - Legacy für Module die noch Railway verwenden
// HINWEIS: Umfragen wurden zu Supabase migriert

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ehcb-app-production.up.railway.app';

// Legacy Referenz für Module die noch nicht migriert wurden
console.log('🔗 Legacy API Base URL:', API_BASE_URL);

// Production API Configuration
// Ersetze diese URL nach dem Railway Deployment

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Production URLs (nach Deployment zu aktualisieren):
// Frontend: https://ehcb-app.vercel.app
// Backend: https://ehcb-app-production.railway.app

console.log('🌍 API Base URL:', API_BASE_URL);
console.log('🏗️ Environment:', import.meta.env.MODE);

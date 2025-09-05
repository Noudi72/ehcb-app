import { useEffect } from 'react';
import { useUmfrage } from "../context/UmfrageContext";

// Custom Hook für aggressives Daten-Refresh
export const useAutoRefresh = (dependencies = []) => {
  const { fetchSurveys } = useUmfrage() || {};

  useEffect(() => {
    // Immediate force refresh when component mounts
    if (fetchSurveys && typeof fetchSurveys === 'function') {
      console.log('🔄 Auto-refreshing surveys data...');
      fetchSurveys();
    }
    
    // Set up interval to refresh every 10 seconds to combat server caching
    const interval = setInterval(() => {
      if (fetchSurveys && typeof fetchSurveys === 'function') {
        console.log('⏰ Interval refresh...');
        fetchSurveys();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, dependencies);
  
  // Also refresh when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && fetchSurveys && typeof fetchSurveys === 'function') {
        console.log('👁️ Page visible - refreshing...');
        fetchSurveys();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchSurveys]);
};

export default useAutoRefresh;

import { useEffect } from 'react';
import { useUmfrage } from '../context/UmfrageContext';

// Custom Hook für aggressives Daten-Refresh
export const useAutoRefresh = (dependencies = []) => {
  const { fetchSurveys } = useUmfrage();

  useEffect(() => {
    // Immediate force refresh when component mounts
    console.log('🔄 Auto-refreshing surveys data...');
    fetchSurveys(true);
    
    // Set up interval to refresh every 10 seconds to combat server caching
    const interval = setInterval(() => {
      console.log('⏰ Interval refresh...');
      fetchSurveys(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, dependencies);
  
  // Also refresh when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - refreshing...');
        fetchSurveys(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchSurveys]);
};

export default useAutoRefresh;

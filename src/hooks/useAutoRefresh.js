import { useEffect } from 'react';
import { useUmfrage } from '../context/UmfrageContext';

// Custom Hook für automatisches Daten-Refresh
export const useAutoRefresh = (dependencies = []) => {
  const { fetchSurveys } = useUmfrage();

  useEffect(() => {
    // Force refresh when component mounts or dependencies change
    console.log('🔄 Auto-refreshing surveys data...');
    fetchSurveys(true);
  }, dependencies);
};

export default useAutoRefresh;

// Service Worker und Cache Reset Utilities

export const clearAllCaches = async () => {
  console.log('🧹 Clearing all caches...');
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('📦 Found caches:', cacheNames);
    
    const deletePromises = cacheNames.map(cacheName => {
      console.log('🗑️ Deleting cache:', cacheName);
      return caches.delete(cacheName);
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All caches cleared');
  }
};

export const unregisterServiceWorker = async () => {
  console.log('🔄 Unregistering service worker...');
  
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (let registration of registrations) {
      console.log('🗑️ Unregistering SW:', registration.scope);
      await registration.unregister();
    }
    
    console.log('✅ Service worker unregistered');
  }
};

export const performNuclearReset = async () => {
  console.log('💥 NUCLEAR RESET - Clearing everything...');
  
  try {
    // Clear all caches
    await clearAllCaches();
    
    // Unregister service worker
    await unregisterServiceWorker();
    
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log('✅ NUCLEAR RESET complete');
    
    // Force reload
    window.location.reload(true);
    
  } catch (error) {
    console.error('❌ Nuclear reset failed:', error);
  }
};

// Test script to debug the import issue
console.log('🔍 Testing imports...');

try {
  console.log('1. Testing UmfrageContext import...');
  const { useUmfrage, UmfrageProvider } = await import('../src/context/UmfrageContext.jsx');
  console.log('✅ UmfrageContext imported successfully');
  console.log('   useUmfrage:', typeof useUmfrage);
  console.log('   UmfrageProvider:', typeof UmfrageProvider);
} catch (error) {
  console.error('❌ UmfrageContext import failed:', error);
}

try {
  console.log('2. Testing AuthContext import...');
  const { useAuth } = await import('../src/context/AuthContext.jsx');
  console.log('✅ AuthContext imported successfully');
  console.log('   useAuth:', typeof useAuth);
} catch (error) {
  console.error('❌ AuthContext import failed:', error);
}

try {
  console.log('3. Testing supabase-api import...');
  const { surveys } = await import('../src/config/supabase-api.js');
  console.log('✅ supabase-api imported successfully');
  console.log('   surveys:', typeof surveys);
} catch (error) {
  console.error('❌ supabase-api import failed:', error);
}

// Quick test to verify Supabase connection
import { supabase } from './src/lib/supabase.js';

console.log('🔗 Testing Supabase connection...');
console.log('📍 URL:', process.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('🔑 Key:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

try {
  const { data, error } = await supabase.from('surveys').select('count');
  if (error) {
    console.error('❌ Supabase error:', error);
  } else {
    console.log('✅ Supabase connection successful');
    console.log('📊 Data received:', data);
  }
} catch (err) {
  console.error('❌ Connection failed:', err);
}

// Test script to add some sample users to Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kljuuwuycwyhzsjkpqki.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsanV1d3V5Y3d5aHpzamtwcWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NjEzNjcsImV4cCI6MjA0MTAzNzM2N30.iIZhkHF5BZ_Q5qhCGSyWbMTSM8IfQ41rPqpkGdJYQQ8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addSampleUsers() {
  console.log('🔧 Adding sample users to Supabase...');
  
  const sampleUsers = [
    {
      name: 'Max Mustermann',
      username: 'max.mustermann',
      email: 'max@ehcb.ch',
      role: 'player',
      teams: ['U18-Elit'],
      active: true,
      created_at: new Date().toISOString()
    },
    {
      name: 'Anna Schmidt',
      username: 'anna.schmidt', 
      email: 'anna@ehcb.ch',
      role: 'player',
      teams: ['U16-Elit'],
      active: true,
      created_at: new Date().toISOString()
    },
    {
      name: 'Tom Weber',
      username: 'tom.weber',
      email: 'tom@ehcb.ch', 
      role: 'player',
      teams: ['U21-Elit'],
      active: false,
      created_at: new Date().toISOString()
    }
  ];

  for (const user of sampleUsers) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) {
        console.log('❌ Error adding user:', user.name, error.message);
      } else {
        console.log('✅ Added user:', user.name);
      }
    } catch (err) {
      console.log('❌ Failed to add user:', user.name, err.message);
    }
  }

  // Check final result
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.log('❌ Could not fetch users:', error.message);
    } else {
      console.log('📊 Total users in database:', data?.length || 0);
    }
  } catch (err) {
    console.log('❌ Could not check users:', err.message);
  }
}

addSampleUsers().then(() => {
  console.log('✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});

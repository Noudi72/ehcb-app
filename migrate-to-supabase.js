import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase configuration (hardcoded for migration)
const supabaseUrl = 'https://keeploxoeugecriqqqjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZXBsb3hvZXVnZWNyaXFxcWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDU2NjYsImV4cCI6MjA3MjQ4MTY2Nn0.A8Bd6vr2q8-N_mKRW7t4Gt41N3IleFTjZvl7hpBr4gk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Read exported data
const surveys = JSON.parse(fs.readFileSync('/tmp/railway-surveys.json', 'utf8'))
const questions = JSON.parse(fs.readFileSync('/tmp/railway-questions.json', 'utf8'))

console.log('🚀 Starting migration to Supabase...')
console.log(`📊 Found ${surveys.length} surveys and ${questions.length} questions`)

async function migrateSurveys() {
  console.log('\n📋 Migrating surveys...')
  
  for (const survey of surveys) {
    const supabaseSurvey = {
      id: survey.id,
      title: survey.title,
      description: survey.description || '',
      active: survey.active,
      anonymous: survey.anonymous,
      anonymity_level: survey.anonymityLevel || 'coaches-private',
      results_visible_to_players: survey.resultsVisibleToPlayers || false,
      target_teams: survey.targetTeams || [],
      created_at: survey.createdAt,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('surveys')
      .insert(supabaseSurvey)
    
    if (error) {
      console.error(`❌ Error inserting survey ${survey.id}:`, error)
    } else {
      console.log(`✅ Survey migrated: ${survey.title}`)
    }
  }
}

async function migrateQuestions() {
  console.log('\n📝 Migrating questions...')
  
  for (const question of questions) {
    // Find which survey this question belongs to
    let surveyId = null
    
    // Check surveys to find which one references this question
    for (const survey of surveys) {
      if (survey.questions && survey.questions.includes(question.id)) {
        surveyId = survey.id
        break
      }
    }
    
    if (!surveyId) {
      console.log(`⚠️ Question ${question.id} not linked to any survey, skipping`)
      continue
    }
    
    const supabaseQuestion = {
      id: question.id,
      survey_id: surveyId,
      question: question.text,
      type: question.type || 'text',
      options: question.options || [],
      required: question.required !== false, // default to true
      order_index: 0 // could be improved with actual order
    }
    
    const { data, error } = await supabase
      .from('questions')
      .insert(supabaseQuestion)
    
    if (error) {
      console.error(`❌ Error inserting question ${question.id}:`, error)
    } else {
      console.log(`✅ Question migrated: ${question.text.substring(0, 50)}...`)
    }
  }
}

async function createTestUsers() {
  console.log('\n👥 Creating test users...')
  
  const testUsers = [
    {
      username: 'coach',
      name: 'Coach',
      role: 'coach',
      teams: []
    },
    {
      username: 'testspieler2',
      name: 'Testspieler2',
      role: 'player', 
      teams: ['u18-elit']
    }
  ]
  
  for (const user of testUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
    
    if (error) {
      console.error(`❌ Error creating user ${user.username}:`, error)
    } else {
      console.log(`✅ User created: ${user.username}`)
    }
  }
}

// Run migration
async function migrate() {
  try {
    await migrateSurveys()
    await migrateQuestions()
    await createTestUsers()
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('You can now switch your app to use Supabase!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

migrate()

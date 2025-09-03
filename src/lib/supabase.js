import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Schema Types (TypeScript-like documentation)
/*
Tables we'll create:

1. surveys
   - id (bigint, primary key)
   - title (text)
   - description (text)
   - active (boolean)
   - anonymous (boolean)
   - anonymity_level (text)
   - results_visible_to_players (boolean)
   - target_teams (text[]) // array of team names
   - created_at (timestamp)
   - updated_at (timestamp)

2. questions  
   - id (bigint, primary key)
   - survey_id (bigint, foreign key to surveys)
   - question (text)
   - type (text) // 'text', 'multiple-choice', 'checkbox', 'rating'
   - options (text[]) // array for multiple choice options
   - required (boolean)
   - order_index (integer)
   - created_at (timestamp)

3. survey_responses
   - id (bigint, primary key) 
   - survey_id (bigint, foreign key to surveys)
   - player_name (text)
   - responses (jsonb) // {questionId: answer}
   - submitted_at (timestamp)

4. users
   - id (bigint, primary key)
   - username (text, unique)
   - name (text)
   - teams (text[]) // array of team names
   - role (text) // 'player', 'coach'
   - created_at (timestamp)
*/

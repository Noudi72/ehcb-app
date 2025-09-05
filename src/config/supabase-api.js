// Simplified Supabase API - Working Version
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  keyPreview: supabaseAnonKey?.substring(0, 20) + '...'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Survey Functions (Updated for existing questions table)
export const surveys = {
  async getAll() {
    console.log('📥 Fetching surveys from Supabase...');
    try {
      const { data: surveysData, error: surveysError } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (surveysError) {
        console.error('❌ Supabase surveys error:', surveysError);
        return [];
      }
      
      console.log('📊 Surveys loaded:', surveysData?.length || 0);
      
      // Load questions for each survey
      if (surveysData && surveysData.length > 0) {
        for (let survey of surveysData) {
          try {
            const { data: questionsData, error: questionsError } = await supabase
              .from('questions')
              .select('*')
              .eq('survey_id', survey.id)
              .order('id', { ascending: true });
            
            if (!questionsError && questionsData) {
              survey.questions = questionsData.map(q => ({
                id: q.id,
                content: q.question || q.content,
                type: q.type || 'multiple-choice',
                options: q.options || [],
                required: q.required || false
              }));
              console.log(`✅ Loaded ${questionsData.length} questions for survey ${survey.id}`);
            } else {
              survey.questions = [];
            }
          } catch (qError) {
            console.warn('⚠️ Could not load questions for survey:', survey.id, qError);
            survey.questions = [];
          }
        }
      }
      
      return surveysData || [];
    } catch (error) {
      console.error('❌ Failed to fetch surveys:', error);
      return [];
    }
  },

  async getById(id) {
    console.log('📥 Fetching survey by ID:', id);
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('❌ Survey by ID error:', error);
        return null;
      }
      
      // Load questions for this survey
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('survey_id', id)
          .order('id', { ascending: true });
        
        if (!questionsError && questionsData) {
          data.questions = questionsData.map(q => ({
            id: q.id,
            content: q.question || q.content,
            type: q.type || 'multiple-choice',
            options: q.options || [],
            required: q.required || false
          }));
          console.log(`✅ Loaded ${questionsData.length} questions for survey ${id}`);
        } else {
          data.questions = [];
        }
      } catch (qError) {
        console.warn('⚠️ Could not load questions for survey:', id, qError);
        data.questions = [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch survey by ID:', error);
      return null;
    }
  },

  async create(survey) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert(survey)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Failed to create survey:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Failed to update survey:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Failed to delete survey:', error);
      throw error;
    }
  }
}

// News Functions (Fallback - table doesn't exist yet)
export const news = {
  async getAll() {
    console.log('📥 News: returning empty array (table not available in Supabase)');
    return [];
  },
  
  async create(newsData) {
    console.log('📥 News: create not available (table not created)');
    return null;
  },

  async update(id, updates) {
    console.log('📥 News: update not available (table not created)');
    return null;
  },

  async delete(id) {
    console.log('📥 News: delete not available (table not created)');
    return false;
  }
}

// Users Functions (Fix active column issue)
export const users = {
  async getAll() {
    try {
      console.log('📥 Fetching users from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Users error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Users: returning empty array');
      return [];
    }
  },

  async getByName(playerName) {
    try {
      console.log('📥 Fetching user by name:', playerName);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', playerName)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found
      
      if (error && !error.message.includes('multiple rows')) {
        console.warn('⚠️ User by name error (but continuing):', error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ User by name: returning null, error:', error.message);
      return null;
    }
  },

  async getPending() {
    try {
      console.log('📥 Fetching pending users from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .order('id', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Pending users error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Pending users: returning empty array');
      return [];
    }
  },

  async create(userData) {
    try {
      console.log('📥 Creating user in Supabase:', userData);
      
      // Remove fields that might not exist in the database schema
      const { active, email, ...safeUserData } = userData;
      
      // Only include fields that definitely exist
      const cleanUserData = {
        name: safeUserData.name,
        password: safeUserData.password,
        team: safeUserData.team,
        status: safeUserData.status || 'pending',
        role: safeUserData.role || 'player'
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert(cleanUserData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ User creation error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      // Remove fields that might not exist in the database schema
      const { active, email, ...safeUpdates } = updates;
      
      // Only include safe fields
      const cleanUpdates = {};
      if (safeUpdates.name) cleanUpdates.name = safeUpdates.name;
      if (safeUpdates.password) cleanUpdates.password = safeUpdates.password;
      if (safeUpdates.team) cleanUpdates.team = safeUpdates.team;
      if (safeUpdates.status) cleanUpdates.status = safeUpdates.status;
      if (safeUpdates.role) cleanUpdates.role = safeUpdates.role;
      
      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }
}

// Teams Functions
export const teams = {
  async getAll() {
    try {
      console.log('📥 Fetching teams from Supabase...');
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.warn('⚠️ Teams error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Teams: returning empty array');
      return [];
    }
  },

  async create(teamData) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      throw error;
    }
  }
}

// Questions Functions
export const questions = {
  async getAll() {
    try {
      console.log('📥 Fetching questions from Supabase...');
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.warn('⚠️ Questions error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Questions: returning empty array');
      return [];
    }
  },

  async create(questionData) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(questionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to create question:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to update question:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Failed to delete question:', error);
      throw error;
    }
  }
}

// Responses Functions
export const responses = {
  async getAll() {
    try {
      console.log('📥 Fetching responses from Supabase...');
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('id', { ascending: false }); // Use 'id' instead of 'created_at'
      
      if (error) {
        console.warn('⚠️ Responses error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Responses: returning empty array');
      return [];
    }
  },

  async create(responseData) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert(responseData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to create response:', error);
      throw error;
    }
  }
}

// Cardio Functions - FIXED with fallback to JSON
export const cardio = {
  async getAll() {
    console.log('📥 Cardio: with fallback to db.json');
    try {
      // Try Supabase first
      const { data, error } = await supabase.from('cardio_programs').select('*');
      if (!error && data?.length > 0) {
        return data;
      }
    } catch (e) {
      console.log('📥 Supabase cardio_programs not available, using fallback');
    }
    
    // Fallback: load from db.json via JSON server
    try {
      const response = await fetch('http://localhost:3001/cardio-programs');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded', data.length, 'cardio programs from JSON fallback');
        return data;
      }
    } catch (e) {
      console.log('📥 JSON server not available either');
    }
    
    return [];
  },

  async create(cardioData) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('cardio_programs')
        .insert(cardioData)
        .select()
        .single();
      
      if (!error) return data;
    } catch (e) {
      console.log('📥 Supabase cardio create not available, trying JSON server');
    }
    
    // Fallback to JSON server
    try {
      const response = await fetch('/api/cardio-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardioData)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('📥 JSON server cardio create also failed');
    }
    
    return null;
  }
}

// Fallback Functions removed - using real Supabase tables below

// SportFood Functions - FIXED with fallback to JSON
export const sportFood = {
  async getAll() {
    console.log('📥 SportFood: fallback to db.json data');
    try {
      // Try Supabase first
      const { data, error } = await supabase.from('sport_food_items').select('*');
      if (!error && data?.length > 0) {
        return data;
      }
    } catch (e) {
      console.log('📥 Supabase sport_food_items not available, using fallback');
    }
    
    // Fallback to JSON server
    try {
      const response = await fetch('http://localhost:3001/sport-food-items');
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.log('📥 JSON server not available either');
    }
    
    return [];
  },

  async getAllItems() {
    console.log('📥 SportFood Items: with fallback to db.json');
    try {
      // Try Supabase first
      const { data, error } = await supabase.from('sport_food_items').select('*');
      if (!error && data?.length > 0) {
        return data;
      }
    } catch (e) {
      console.log('📥 Supabase sport_food_items not available, using fallback');
    }
    
    // Fallback: load from db.json via JSON server
    try {
      const response = await fetch('http://localhost:3001/sport-food-items');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded', data.length, 'sport food items from JSON fallback');
        return data;
      }
    } catch (e) {
      console.log('📥 JSON server not available either');
    }
    
    return [];
  },

  async getAllCategories() {
    console.log('📥 SportFood Categories: with fallback to db.json');
    try {
      // Try Supabase first
      const { data, error } = await supabase.from('sport_food_categories').select('*');
      if (!error && data?.length > 0) {
        return data;
      }
    } catch (e) {
      console.log('📥 Supabase sport_food_categories not available, using fallback');
    }
    
    // Fallback: load from db.json via JSON server  
    try {
      const response = await fetch('http://localhost:3001/sport-food-categories');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded', data.length, 'sport food categories from JSON fallback');
        return data;
      }
    } catch (e) {
      console.log('📥 JSON server not available either');
    }
    
    return [];
  },

  async create(sportFoodData) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('sport_food_items')
        .insert(sportFoodData)
        .select()
        .single();
      
      if (!error) return data;
    } catch (e) {
      console.log('📥 Supabase create not available, trying JSON server');
    }
    
    // Fallback to JSON server
    try {
      const response = await fetch('/api/sport-food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sportFoodData)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('📥 JSON server create also failed');
    }
    
    return null;
  }
}

// Reflexions Functions
export const reflexions = {
  async getAll() {
    try {
      console.log('📥 Fetching reflexions from Supabase...');
      const { data, error } = await supabase
        .from('reflexions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Reflexions error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Reflexions: returning empty array');
      return [];
    }
  },

  async create(reflexionData) {
    try {
      const { data, error } = await supabase
        .from('reflexions')
        .insert(reflexionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to create reflexion:', error);
      throw error;
    }
  }
}

// Notifications Functions
export const notifications = {
  async getAll() {
    try {
      console.log('📥 Fetching notifications from Supabase...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Notifications error:', error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Notifications: returning empty array');
      return [];
    }
  },

  async create(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      throw error;
    }
  }
}

console.log('✅ Simplified Supabase API loaded');

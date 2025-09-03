-- EHCB App Database Schema for Supabase
-- Execute this in the Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    teams TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'player',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Surveys table  
CREATE TABLE surveys (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    anonymous BOOLEAN DEFAULT false,
    anonymity_level TEXT DEFAULT 'coaches-private',
    results_visible_to_players BOOLEAN DEFAULT false,
    target_teams TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Questions table
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    survey_id BIGINT REFERENCES surveys(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- 'text', 'multiple-choice', 'checkbox', 'rating'
    options TEXT[] DEFAULT '{}', -- for multiple choice questions
    required BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Survey responses table
CREATE TABLE survey_responses (
    id BIGSERIAL PRIMARY KEY,
    survey_id BIGINT REFERENCES surveys(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    responses JSONB NOT NULL, -- {questionId: answer, questionId2: answer2}
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_surveys_active ON surveys(active);
CREATE INDEX idx_surveys_target_teams ON surveys USING GIN(target_teams);
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_order ON questions(survey_id, order_index);
CREATE INDEX idx_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_responses_submitted_at ON survey_responses(submitted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;  
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're not using Supabase Auth yet)
-- Users table policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);

-- Surveys table policies  
CREATE POLICY "Enable read access for all users" ON surveys FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON surveys FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON surveys FOR DELETE USING (true);

-- Questions table policies
CREATE POLICY "Enable read access for all users" ON questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON questions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON questions FOR DELETE USING (true);

-- Survey responses table policies
CREATE POLICY "Enable read access for all users" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON survey_responses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON survey_responses FOR DELETE USING (true);

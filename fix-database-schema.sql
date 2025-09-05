-- Fix database schema to add missing columns
-- Run these commands in Supabase SQL Editor

-- Fix users table columns
-- Add status column to users table for pending registrations
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active';

-- Add active column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Add teams column as jsonb array for multiple team assignments
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS teams jsonb DEFAULT '[]'::jsonb;

-- Add mainTeam column for primary team assignment
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mainTeam varchar(50);

-- Update existing users to have proper status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Create index on active for faster queries  
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Fix surveys table columns
-- Ensure surveys table has proper structure
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Add description column if missing
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS description text;

-- Add timestamps if missing
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add target_teams column for team targeting
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS target_teams jsonb DEFAULT '[]'::jsonb;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for surveys table
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Show updated table structures
SELECT 'users table columns:' as table_info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'surveys table columns:' as table_info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'surveys' 
ORDER BY ordinal_position;

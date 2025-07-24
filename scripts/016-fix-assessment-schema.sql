-- Fix the saved_assessments table to handle null constraints properly
ALTER TABLE saved_assessments 
ALTER COLUMN assessment_data SET DEFAULT '{}',
ALTER COLUMN assessment_data SET NOT NULL;

-- Update any existing null values
UPDATE saved_assessments 
SET assessment_data = '{}' 
WHERE assessment_data IS NULL;

-- Ensure skills_data also has proper defaults
ALTER TABLE saved_assessments 
ALTER COLUMN skills_data SET DEFAULT '{}';

UPDATE saved_assessments 
SET skills_data = '{}' 
WHERE skills_data IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user_id ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_created_at ON saved_assessments(created_at);

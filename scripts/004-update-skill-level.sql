-- Update skills table to allow flexible level formats
-- First, update any existing N/A values to L1 as a default
UPDATE skills SET level = 'L1' WHERE level = 'N/A' OR level IS NULL;

-- Add a check constraint to ensure level follows the pattern (Letter + Number)
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_level_check;
ALTER TABLE skills ADD CONSTRAINT skills_level_check CHECK (level ~ '^[A-Z][0-9]+$');

-- Make level column NOT NULL
ALTER TABLE skills ALTER COLUMN level SET NOT NULL;

-- Update the skill categories table to add a description for better admin UX
ALTER TABLE skill_categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Update skill categories with descriptions
UPDATE skill_categories SET description = 
  CASE 
    WHEN slug = 'technical' THEN 'Core technical competencies and domain expertise required for the role'
    WHEN slug = 'delivery' THEN 'Skills related to planning, executing, and delivering work effectively'
    WHEN slug = 'communication' THEN 'Interpersonal skills including feedback, collaboration, and communication'
    WHEN slug = 'leadership' THEN 'Leadership capabilities and people management skills'
    WHEN slug = 'strategic' THEN 'Strategic thinking and organizational impact abilities'
    ELSE 'General skill category'
  END
WHERE description IS NULL;

-- Add some example skills with different level types for demonstration
INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order) 
SELECT 1, 1, 'Advanced Security', 'L3', 'Implements advanced security measures', 'Advanced security implementation and threat analysis', 10
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Advanced Security');

INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order) 
SELECT 1, 4, 'Team Leadership', 'M2', 'Leads small development teams', 'Manages and mentors junior developers, coordinates team activities', 20
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Team Leadership');

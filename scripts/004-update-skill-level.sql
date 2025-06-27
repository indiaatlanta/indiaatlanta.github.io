-- Update skills table to make level a proper required field
-- First, update any existing N/A values to L1 as a default
UPDATE skills SET level = 'L1' WHERE level = 'N/A' OR level IS NULL;

-- Add a check constraint to ensure level is always one of the valid values (excluding N/A)
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_level_check;
ALTER TABLE skills ADD CONSTRAINT skills_level_check CHECK (level IN ('L1', 'L2', 'L3', 'L4', 'L5'));

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

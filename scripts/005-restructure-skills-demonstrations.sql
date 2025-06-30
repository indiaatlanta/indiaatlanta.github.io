-- Restructure the database to separate skills from demonstrations
-- This allows one skill to have multiple demonstration descriptions at different levels

-- First, create the new structure

-- Create a new skills_master table for core skill information
CREATE TABLE IF NOT EXISTS skills_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES skill_categories(id) ON DELETE CASCADE,
    description TEXT NOT NULL, -- This is the main skill description
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category_id) -- Prevent duplicate skills in the same category
);

-- Create skill_demonstrations table to link skills to job roles with specific demonstrations
CREATE TABLE IF NOT EXISTS skill_demonstrations (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    demonstration TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data from skills table to the new structure
-- First, insert unique skills into skills_master
INSERT INTO skills_master (name, category_id, description, sort_order)
SELECT DISTINCT 
    s.name,
    s.category_id,
    s.full_description,
    MIN(s.sort_order)
FROM skills s
GROUP BY s.name, s.category_id, s.full_description
ON CONFLICT (name, category_id) DO NOTHING;

-- Then, insert skill demonstrations
INSERT INTO skill_demonstrations (skill_id, demonstration)
SELECT id, unnest(string_to_array(demonstrations, ',')) as demonstration
FROM skills 
WHERE demonstrations IS NOT NULL AND demonstrations != '';

-- Drop the old demonstrations column
ALTER TABLE skills DROP COLUMN IF EXISTS demonstrations;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skill_demonstrations_skill_id ON skill_demonstrations(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_demonstrations_job_role_id ON skill_demonstrations(job_role_id);
CREATE INDEX IF NOT EXISTS idx_skills_master_category_id ON skills_master(category_id);

-- Add a view to maintain compatibility with existing queries
CREATE OR REPLACE VIEW skills_view AS
SELECT 
    sd.id,
    sm.name,
    sd.level,
    sd.demonstration_description as description,
    sm.description as full_description,
    sm.category_id,
    sc.name as category_name,
    sc.color as category_color,
    sd.job_role_id,
    sd.sort_order,
    sm.id as skill_master_id
FROM skill_demonstrations sd
JOIN skills_master sm ON sd.skill_master_id = sm.id
JOIN skill_categories sc ON sm.category_id = sc.id;

-- Note: We'll keep the old skills table for now to ensure no data loss
-- After confirming the migration works, we can drop it in a future script

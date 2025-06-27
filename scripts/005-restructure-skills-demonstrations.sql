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
    skill_master_id INTEGER REFERENCES skills_master(id) ON DELETE CASCADE,
    job_role_id INTEGER REFERENCES job_roles(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL CHECK (level ~ '^[A-Z][0-9]+$'),
    demonstration_description TEXT NOT NULL, -- Specific demonstration for this level/role
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(skill_master_id, job_role_id) -- One demonstration per skill per job role
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
INSERT INTO skill_demonstrations (skill_master_id, job_role_id, level, demonstration_description, sort_order)
SELECT 
    sm.id,
    s.job_role_id,
    s.level,
    s.description,
    s.sort_order
FROM skills s
JOIN skills_master sm ON s.name = sm.name AND s.category_id = sm.category_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skill_demonstrations_skill_master_id ON skill_demonstrations(skill_master_id);
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

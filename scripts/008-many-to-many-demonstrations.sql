-- Create new demonstration templates table
CREATE TABLE IF NOT EXISTS demonstration_templates (
    id SERIAL PRIMARY KEY,
    skill_master_id INTEGER NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    level VARCHAR(10) NOT NULL,
    demonstration_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS demonstration_job_roles (
    id SERIAL PRIMARY KEY,
    demonstration_template_id INTEGER NOT NULL REFERENCES demonstration_templates(id) ON DELETE CASCADE,
    job_role_id INTEGER NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demonstration_template_id, job_role_id)
);

-- Migrate existing data from skill_demonstrations to new structure
INSERT INTO demonstration_templates (skill_master_id, level, demonstration_description, created_at, updated_at)
SELECT DISTINCT skill_master_id, level, demonstration_description, created_at, updated_at
FROM skill_demonstrations;

-- Link existing demonstrations to their job roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id, sort_order)
SELECT dt.id, sd.job_role_id, sd.sort_order
FROM skill_demonstrations sd
JOIN demonstration_templates dt ON (
    sd.skill_master_id = dt.skill_master_id 
    AND sd.level = dt.level 
    AND sd.demonstration_description = dt.demonstration_description
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_demonstration_templates_skill_master ON demonstration_templates(skill_master_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_template ON demonstration_job_roles(demonstration_template_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_job_role ON demonstration_job_roles(job_role_id);

-- Add updated_at trigger for demonstration_templates
CREATE OR REPLACE FUNCTION update_demonstration_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_demonstration_templates_updated_at
    BEFORE UPDATE ON demonstration_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_demonstration_templates_updated_at();

-- Note: We'll keep the old skill_demonstrations table for now to ensure data safety
-- After confirming the migration works, we can drop it with:
-- DROP TABLE skill_demonstrations;

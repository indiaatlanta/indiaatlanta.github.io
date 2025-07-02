-- Add missing columns to match the application expectations
ALTER TABLE saved_assessments 
ADD COLUMN IF NOT EXISTS job_role_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS department_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS skills_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_skills INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_skills INTEGER DEFAULT 0;

-- Update existing records to populate the new columns from related tables
UPDATE saved_assessments 
SET 
    job_role_name = jr.name,
    department_name = d.name
FROM job_roles jr
JOIN departments d ON jr.department_id = d.id
WHERE saved_assessments.role_id = jr.id
AND saved_assessments.job_role_name IS NULL;

-- Create index for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_saved_assessments_completion ON saved_assessments(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_score ON saved_assessments(overall_score);

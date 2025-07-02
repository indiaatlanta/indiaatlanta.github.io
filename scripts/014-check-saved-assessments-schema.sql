-- Check and create the saved_assessments table with correct column names
CREATE TABLE IF NOT EXISTS saved_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assessment_name VARCHAR(255) NOT NULL,
  job_role_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  skills_data JSONB NOT NULL DEFAULT '{}',
  overall_score DECIMAL(5,2) DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  total_skills INTEGER DEFAULT 0,
  completed_skills INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user_id ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_created_at ON saved_assessments(created_at);

-- Check if we need to migrate old column names
DO $$
BEGIN
  -- Check if old 'name' column exists and rename it
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'name') THEN
    ALTER TABLE saved_assessments RENAME COLUMN name TO assessment_name;
  END IF;
  
  -- Check if old 'job_role' column exists and rename it
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'job_role') THEN
    ALTER TABLE saved_assessments RENAME COLUMN job_role TO job_role_name;
  END IF;
  
  -- Check if old 'department' column exists and rename it
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'department') THEN
    ALTER TABLE saved_assessments RENAME COLUMN department TO department_name;
  END IF;
END $$;

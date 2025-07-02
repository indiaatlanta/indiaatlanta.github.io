-- Check the actual schema of saved_assessments table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'saved_assessments'
ORDER BY ordinal_position;

-- If the table doesn't exist, create it with the correct schema
CREATE TABLE IF NOT EXISTS saved_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    job_role_name VARCHAR(255),
    department_name VARCHAR(255),
    completed_skills INTEGER DEFAULT 0,
    total_skills INTEGER DEFAULT 0,
    assessment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user_id ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_created_at ON saved_assessments(created_at);

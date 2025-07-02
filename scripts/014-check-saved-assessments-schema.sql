-- Check if saved_assessments table exists and create it if not
CREATE TABLE IF NOT EXISTS saved_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    job_role_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    skills_data JSONB NOT NULL,
    overall_score DECIMAL(5,2) DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user_id ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_created_at ON saved_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_job_role ON saved_assessments(job_role_name);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_department ON saved_assessments(department_name);

-- Add some sample data if table is empty
INSERT INTO saved_assessments (user_id, name, job_role_name, department_name, skills_data, overall_score, completion_percentage)
SELECT 1, 'Frontend Development Assessment', 'Frontend Developer', 'Engineering', 
       '{"skills": [{"name": "React", "level": 4}, {"name": "JavaScript", "level": 5}]}', 
       85.5, 100.0
WHERE NOT EXISTS (SELECT 1 FROM saved_assessments LIMIT 1);

INSERT INTO saved_assessments (user_id, name, job_role_name, department_name, skills_data, overall_score, completion_percentage)
SELECT 1, 'Backend Development Assessment', 'Backend Developer', 'Engineering', 
       '{"skills": [{"name": "Node.js", "level": 3}, {"name": "Database Design", "level": 4}]}', 
       75.0, 80.0
WHERE NOT EXISTS (SELECT 1 FROM saved_assessments WHERE name = 'Backend Development Assessment');

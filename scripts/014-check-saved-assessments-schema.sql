-- Check if saved_assessments table exists and create if needed
DO $$
BEGIN
    -- Create saved_assessments table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_assessments') THEN
        CREATE TABLE saved_assessments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            assessment_name VARCHAR(255) NOT NULL,
            job_role VARCHAR(255) NOT NULL,
            department VARCHAR(255) NOT NULL,
            skills_data JSONB NOT NULL,
            overall_score DECIMAL(5,2) DEFAULT 0,
            completion_percentage DECIMAL(5,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_saved_assessments_user_id ON saved_assessments(user_id);
        CREATE INDEX idx_saved_assessments_created_at ON saved_assessments(created_at);
        CREATE INDEX idx_saved_assessments_job_role ON saved_assessments(job_role);
        CREATE INDEX idx_saved_assessments_department ON saved_assessments(department);
        
        RAISE NOTICE 'Created saved_assessments table with indexes';
    ELSE
        RAISE NOTICE 'saved_assessments table already exists';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'overall_score') THEN
        ALTER TABLE saved_assessments ADD COLUMN overall_score DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE 'Added overall_score column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'completion_percentage') THEN
        ALTER TABLE saved_assessments ADD COLUMN completion_percentage DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE 'Added completion_percentage column';
    END IF;
END $$;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'saved_assessments'
ORDER BY ordinal_position;

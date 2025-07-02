-- Check if saved_assessments table exists and create it if not
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
            completion_percentage DECIMAL(5,2) DEFAULT 0,
            total_skills INTEGER DEFAULT 0,
            completed_skills INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create index for faster queries
        CREATE INDEX idx_saved_assessments_user_id ON saved_assessments(user_id);
        CREATE INDEX idx_saved_assessments_created_at ON saved_assessments(created_at);
        
        RAISE NOTICE 'Created saved_assessments table';
    ELSE
        RAISE NOTICE 'saved_assessments table already exists';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'completion_percentage') THEN
        ALTER TABLE saved_assessments ADD COLUMN completion_percentage DECIMAL(5,2) DEFAULT 0;
        RAISE NOTICE 'Added completion_percentage column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'total_skills') THEN
        ALTER TABLE saved_assessments ADD COLUMN total_skills INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_skills column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'saved_assessments' AND column_name = 'completed_skills') THEN
        ALTER TABLE saved_assessments ADD COLUMN completed_skills INTEGER DEFAULT 0;
        RAISE NOTICE 'Added completed_skills column';
    END IF;
END $$;

-- Add saved assessments table
CREATE TABLE IF NOT EXISTS saved_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    assessment_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user_id ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_created_at ON saved_assessments(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_saved_assessments_updated_at ON saved_assessments;
CREATE TRIGGER update_saved_assessments_updated_at
    BEFORE UPDATE ON saved_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_assessments_updated_at();

-- User Management System Schema
-- This script creates the complete user management system with roles and saved data

-- Create users table with proper authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    department VARCHAR(255),
    job_title VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user profiles table for additional information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills TEXT[], -- Array of skill names
    interests TEXT[],
    career_goals TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved role comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    role_ids INTEGER[] NOT NULL, -- Array of job role IDs being compared
    comparison_data JSONB, -- Store the comparison results and user notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved self reviews table
CREATE TABLE IF NOT EXISTS saved_self_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_role_id INTEGER REFERENCES job_roles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    skill_assessments JSONB NOT NULL, -- Store skill ratings and notes
    overall_score DECIMAL(3,2), -- Overall percentage score
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user_id ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user_id ON saved_self_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_role_id ON saved_self_reviews(job_role_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);

-- Insert demo users with hashed passwords (password is the same as the role name + "123")
-- Note: In production, these should be created through the application with proper password hashing
INSERT INTO users (email, password_hash, name, role, department, job_title) VALUES
    ('admin@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'admin', 'IT', 'System Administrator'),
    ('manager@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Manager User', 'manager', 'Engineering', 'Engineering Manager'),
    ('user@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Regular User', 'user', 'Engineering', 'Software Developer')
ON CONFLICT (email) DO NOTHING;

-- Set up manager relationships (manager manages the regular user)
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for demo users
INSERT INTO user_profiles (user_id, bio, skills, interests, career_goals) VALUES
    ((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 
     'System administrator with 10+ years of experience in managing enterprise systems.',
     ARRAY['System Administration', 'Database Management', 'Security', 'Cloud Infrastructure'],
     ARRAY['Technology Leadership', 'Process Improvement', 'Team Management'],
     'Lead digital transformation initiatives and mentor technical teams.'),
    ((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'), 
     'Engineering manager passionate about building high-performing teams and delivering quality software.',
     ARRAY['Team Leadership', 'Project Management', 'Software Architecture', 'Agile Methodologies'],
     ARRAY['Team Development', 'Technical Strategy', 'Product Innovation'],
     'Scale engineering teams and drive technical excellence across the organization.'),
    ((SELECT id FROM users WHERE email = 'user@henryscheinone.com'), 
     'Software developer with expertise in full-stack development and a passion for clean code.',
     ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
     ARRAY['Web Development', 'API Design', 'Database Optimization'],
     'Become a senior developer and eventually move into technical leadership roles.')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_comparisons_updated_at BEFORE UPDATE ON saved_comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_self_reviews_updated_at BEFORE UPDATE ON saved_self_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

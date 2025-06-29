-- Add user management system with roles and saved data

-- Update users table to support the new role system
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update the role constraint to include manager
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user'));

-- Create saved comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role_ids INTEGER[] NOT NULL,
    role_names TEXT[] NOT NULL,
    comparison_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved self reviews table
CREATE TABLE IF NOT EXISTS saved_self_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES job_roles(id),
    role_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    review_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    skills TEXT[],
    interests TEXT[],
    goals TEXT,
    avatar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user_id ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user_id ON saved_self_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_role_id ON saved_self_reviews(role_id);

-- Insert some sample users for testing
INSERT INTO users (email, password_hash, name, role, department_id, job_title, hire_date) VALUES
('admin@henryscheinone.com', '$2a$10$rQZ9QmjlZKZZ9QmjlZKZZOeJ9QmjlZKZZ9QmjlZKZZ9QmjlZKZZ9Q', 'Admin User', 'admin', 1, 'System Administrator', '2023-01-01'),
('manager@henryscheinone.com', '$2a$10$rQZ9QmjlZKZZ9QmjlZKZZOeJ9QmjlZKZZ9QmjlZKZZ9QmjlZKZZ9Q', 'Manager User', 'manager', 1, 'Engineering Manager', '2023-02-01'),
('user@henryscheinone.com', '$2a$10$rQZ9QmjlZKZZ9QmjlZKZZ9QmjlZKZZ9QmjlZKZZ9QmjlZKZZ9Q', 'Regular User', 'user', 1, 'Software Engineer', '2023-03-01')
ON CONFLICT (email) DO NOTHING;

-- Update the manager relationship (user reports to manager)
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for the sample users
INSERT INTO user_profiles (user_id, bio, skills, interests, goals) VALUES
((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 'System administrator with expertise in database management and user systems.', ARRAY['Database Management', 'System Administration', 'Security'], ARRAY['Technology', 'Process Improvement'], 'Maintain secure and efficient systems'),
((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'), 'Engineering manager focused on team development and technical excellence.', ARRAY['Team Leadership', 'Technical Architecture', 'Project Management'], ARRAY['Team Building', 'Mentoring'], 'Build high-performing engineering teams'),
((SELECT id FROM users WHERE email = 'user@henryscheinone.com'), 'Software engineer passionate about clean code and continuous learning.', ARRAY['JavaScript', 'React', 'Node.js'], ARRAY['Web Development', 'Open Source'], 'Become a senior engineer')
ON CONFLICT (user_id) DO NOTHING;

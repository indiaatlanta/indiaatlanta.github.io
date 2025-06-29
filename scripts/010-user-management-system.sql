-- Create users table with enhanced fields
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

-- Create user_profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills_summary TEXT,
    career_goals TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role_1_id INTEGER NOT NULL REFERENCES job_roles(id),
    role_2_id INTEGER NOT NULL REFERENCES job_roles(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_self_reviews table
CREATE TABLE IF NOT EXISTS saved_self_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES job_roles(id),
    skill_assessments JSONB NOT NULL, -- Store skill ratings as JSON
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user ON saved_self_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Insert sample departments
INSERT INTO departments (name, description) VALUES 
    ('Engineering', 'Software development and technical teams'),
    ('Product', 'Product management and design'),
    ('Sales', 'Sales and business development'),
    ('Marketing', 'Marketing and communications'),
    ('HR', 'Human resources and people operations'),
    ('Finance', 'Finance and accounting'),
    ('Operations', 'Operations and support')
ON CONFLICT DO NOTHING;

-- Insert demo users with hashed passwords (password is the same as the role name + "123")
-- Note: In production, these should be properly hashed with bcrypt
INSERT INTO users (email, password_hash, name, role, department, job_title) VALUES
    ('admin@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Admin User', 'admin', 'IT', 'System Administrator'),
    ('manager@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Manager User', 'manager', 'Engineering', 'Engineering Manager'),
    ('user@henryscheinone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Regular User', 'user', 'Engineering', 'Software Developer')
ON CONFLICT (email) DO NOTHING;

-- Update manager relationships
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for demo users
INSERT INTO user_profiles (user_id, bio, skills_summary, career_goals) VALUES 
    ((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 
     'System administrator with 10+ years of experience in IT infrastructure and user management.',
     'System Administration, Database Management, Security, User Management',
     'Continue improving system efficiency and security protocols'),
    ((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'),
     'Engineering manager passionate about team development and technical excellence.',
     'Team Leadership, Software Architecture, Project Management, Mentoring',
     'Build high-performing engineering teams and drive technical innovation'),
    ((SELECT id FROM users WHERE email = 'user@henryscheinone.com'),
     'Software developer focused on creating efficient and scalable solutions.',
     'JavaScript, React, Node.js, Database Design, API Development',
     'Advance to senior developer role and specialize in full-stack development')
ON CONFLICT DO NOTHING;

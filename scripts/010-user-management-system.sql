-- Add user management system with roles and saved data

-- Create users table with proper authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  department VARCHAR(255),
  manager_id INTEGER REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role1_id INTEGER REFERENCES job_roles(id),
    role2_id INTEGER REFERENCES job_roles(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved self reviews table  
CREATE TABLE IF NOT EXISTS saved_self_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES job_roles(id),
    skill_assessments JSONB NOT NULL, -- Store skill ratings as JSON
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user profiles table for additional info
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills_focus TEXT[],
    career_goals TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user ON saved_self_reviews(user_id);

-- Insert demo users with hashed passwords
-- Password for all demo users is their role + "123" (admin123, manager123, user123)
INSERT INTO users (email, password_hash, name, role, department) VALUES
('admin@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', 'IT'),
('manager@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager User', 'manager', 'Engineering'),
('user@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'user', 'Engineering')
ON CONFLICT (email) DO NOTHING;

-- Set up manager relationships (manager manages the regular user)
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for the sample users
INSERT INTO user_profiles (user_id, bio, skills_focus, career_goals) VALUES
((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 'System administrator with expertise in database management and user systems.', ARRAY['Database Management', 'System Administration', 'Security'], 'Maintain secure and efficient systems'),
((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'), 'Engineering manager focused on team development and technical excellence.', ARRAY['Team Leadership', 'Technical Architecture', 'Project Management'], 'Build high-performing engineering teams'),
((SELECT id FROM users WHERE email = 'user@henryscheinone.com'), 'Software engineer passionate about clean code and continuous learning.', ARRAY['JavaScript', 'React', 'Node.js'], 'Become a senior engineer')
ON CONFLICT (user_id) DO NOTHING;

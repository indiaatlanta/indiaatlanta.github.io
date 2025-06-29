-- Create users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    department VARCHAR(255),
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
    skills JSONB, -- Store user's self-reported skills
    goals TEXT,
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
    role_id INTEGER NOT NULL REFERENCES job_roles(id),
    name VARCHAR(255) NOT NULL,
    assessment_data JSONB NOT NULL, -- Store skill ratings and notes
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

-- Add foreign key constraint for department_id in users table
-- No change needed as department is now a VARCHAR field

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user ON saved_self_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

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
INSERT INTO users (email, password_hash, name, role, department) VALUES
    ('admin@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', 'admin', 'IT'),
    ('manager@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Manager', 'manager', 'Engineering'),
    ('user@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'user', 'Engineering')
ON CONFLICT (email) DO NOTHING;

-- Update manager relationships
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for demo users
INSERT INTO user_profiles (user_id, bio, goals) VALUES 
    ((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 'System administrator with focus on career development tools', 'Improve platform adoption and user experience'),
    ((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'), 'Engineering manager passionate about team development', 'Help team members advance their careers and develop new skills'),
    ((SELECT id FROM users WHERE email = 'user@henryscheinone.com'), 'Software developer looking to grow technical and leadership skills', 'Advance to senior developer role within 2 years')
ON CONFLICT DO NOTHING;

-- Create users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    manager_id INTEGER REFERENCES users(id),
    department_id INTEGER,
    job_title VARCHAR(255),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills_focus TEXT[],
    career_goals TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    role_1_id INTEGER REFERENCES job_roles(id),
    role_2_id INTEGER REFERENCES job_roles(id),
    comparison_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_self_reviews table
CREATE TABLE IF NOT EXISTS saved_self_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    role_id INTEGER REFERENCES job_roles(id),
    review_data JSONB NOT NULL,
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
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_self_reviews_user ON saved_self_reviews(user_id);

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

-- Insert sample users (passwords are hashed versions of simple passwords for demo)
-- admin123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- manager123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  
-- user123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (email, password_hash, name, role, department_id, job_title, hire_date) VALUES 
    ('admin@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 1, 'IT Administrator', '2023-01-01'),
    ('manager@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engineering Manager', 'manager', 1, 'Senior Engineering Manager', '2023-02-01'),
    ('user@henryscheinone.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Software Developer', 'user', 1, 'Senior Software Developer', '2023-03-01')
ON CONFLICT (email) DO NOTHING;

-- Update manager relationships
UPDATE users SET manager_id = (SELECT id FROM users WHERE email = 'manager@henryscheinone.com') 
WHERE email = 'user@henryscheinone.com';

-- Create user profiles for sample users
INSERT INTO user_profiles (user_id, bio, skills_focus, career_goals) VALUES 
    ((SELECT id FROM users WHERE email = 'admin@henryscheinone.com'), 'System administrator with 10+ years experience', ARRAY['System Administration', 'Security', 'DevOps'], 'Lead technical infrastructure initiatives'),
    ((SELECT id FROM users WHERE email = 'manager@henryscheinone.com'), 'Engineering manager focused on team growth', ARRAY['Leadership', 'Software Architecture', 'Team Management'], 'Build high-performing engineering teams'),
    ((SELECT id FROM users WHERE email = 'user@henryscheinone.com'), 'Full-stack developer passionate about user experience', ARRAY['React', 'Node.js', 'UI/UX'], 'Become a senior technical lead')
ON CONFLICT DO NOTHING;

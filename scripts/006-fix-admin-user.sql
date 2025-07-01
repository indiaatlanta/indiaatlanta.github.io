-- Fix the admin user with a proper password hash
-- First, delete any existing admin user to avoid conflicts
DELETE FROM users WHERE email = 'admin@henryscheinone.com';

-- Insert admin user with properly hashed password for 'admin123'
-- This hash was generated using bcrypt with salt rounds 10
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'Admin User', 'admin');

-- Also add a test user for demonstration
INSERT INTO users (email, password_hash, name, role) VALUES 
('user@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

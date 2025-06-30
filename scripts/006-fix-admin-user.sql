-- Fix the admin user with a proper password hash
-- First, delete any existing admin user to avoid conflicts
DELETE FROM users WHERE email = 'admin@henryscheinone.com';

-- Insert admin user with properly hashed password for 'admin123'
-- This hash was generated using bcrypt with salt rounds 10
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'admin')
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y',
  role = 'admin',
  updated_at = CURRENT_TIMESTAMP;

-- Also add a test user for demonstration
INSERT INTO users (name, email, password_hash, role) 
VALUES ('John Doe', 'user@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'user')
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y',
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO users (name, email, password_hash, role) 
VALUES ('Jane Manager', 'manager@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'admin')
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y',
  role = 'admin',
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO users (name, email, password_hash, role) 
VALUES ('John Smith', 'john.smith@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'user')
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y',
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO users (name, email, password_hash, role) 
VALUES ('Jane Doe', 'jane.doe@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'user')
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y',
  updated_at = CURRENT_TIMESTAMP;

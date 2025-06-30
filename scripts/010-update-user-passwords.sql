-- Update user passwords to plain text for demo purposes
-- This removes password hashing for easier testing

-- Update existing users with plain text passwords
UPDATE users 
SET password_hash = 'admin123' 
WHERE email = 'admin@henryscheinone.com';

UPDATE users 
SET password_hash = 'user123' 
WHERE email = 'user@henryscheinone.com';

-- Insert demo users if they don't exist
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT 'Demo Admin', 'admin@henryscheinone.com', 'admin123', 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@henryscheinone.com');

INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT 'Demo User', 'user@henryscheinone.com', 'user123', 'user', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@henryscheinone.com');

-- Add more demo users for testing
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT 'John Smith', 'john.smith@henryscheinone.com', 'password123', 'user', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.smith@henryscheinone.com');

INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT 'Jane Doe', 'jane.doe@henryscheinone.com', 'password123', 'user', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.doe@henryscheinone.com');

INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
SELECT 'Manager User', 'manager@henryscheinone.com', 'manager123', 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@henryscheinone.com');

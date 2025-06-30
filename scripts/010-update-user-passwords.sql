-- Update existing users with plain text passwords for demo purposes
-- WARNING: This is for demo/development only - never use plain text passwords in production

-- Update existing users if they exist
UPDATE users SET password_hash = 'admin123' WHERE email = 'admin@henryscheinone.com';
UPDATE users SET password_hash = 'user123' WHERE email = 'user@henryscheinone.com';

-- Insert demo users if they don't exist
INSERT INTO users (email, password_hash, name, role) 
VALUES 
  ('admin@henryscheinone.com', 'admin123', 'Admin User', 'admin'),
  ('user@henryscheinone.com', 'user123', 'Regular User', 'user'),
  ('manager@henryscheinone.com', 'manager123', 'Manager User', 'admin'),
  ('john.smith@henryscheinone.com', 'password123', 'John Smith', 'user'),
  ('jane.doe@henryscheinone.com', 'password123', 'Jane Doe', 'user')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Add name column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';

-- Update names for existing users without names
UPDATE users SET name = 'Admin User' WHERE email = 'admin@henryscheinone.com' AND (name IS NULL OR name = 'User');
UPDATE users SET name = 'Regular User' WHERE email = 'user@henryscheinone.com' AND (name IS NULL OR name = 'User');
UPDATE users SET name = 'Manager User' WHERE email = 'manager@henryscheinone.com' AND (name IS NULL OR name = 'User');
UPDATE users SET name = 'John Smith' WHERE email = 'john.smith@henryscheinone.com' AND (name IS NULL OR name = 'User');
UPDATE users SET name = 'Jane Doe' WHERE email = 'jane.doe@henryscheinone.com' AND (name IS NULL OR name = 'User');

-- Update existing users with plain text passwords for demo purposes
-- WARNING: This is for demo/development only - never use plain text passwords in production

UPDATE users SET password_hash = 'admin123' WHERE email = 'admin@henryscheinone.com';
UPDATE users SET password_hash = 'user123' WHERE email = 'user@henryscheinone.com';

-- Insert additional demo users if they don't exist
INSERT INTO users (email, name, role, password_hash, created_at, updated_at)
VALUES 
  ('manager@henryscheinone.com', 'Demo Manager', 'admin', 'manager123', NOW(), NOW()),
  ('john.smith@henryscheinone.com', 'John Smith', 'user', 'password123', NOW(), NOW()),
  ('jane.doe@henryscheinone.com', 'Jane Doe', 'user', 'password123', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verify the updates
SELECT id, email, name, role, password_hash FROM users ORDER BY id;

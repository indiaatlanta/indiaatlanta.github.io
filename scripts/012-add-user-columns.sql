-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update existing users with default names based on their email
UPDATE users 
SET name = CASE 
    WHEN email LIKE '%admin%' THEN 'Admin User'
    WHEN email LIKE '%manager%' THEN 'Manager User'
    ELSE SPLIT_PART(email, '@', 1)
END
WHERE name IS NULL;

-- Make name column NOT NULL after populating existing records
ALTER TABLE users 
ALTER COLUMN name SET NOT NULL;

-- Add index for better performance on last_login queries
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Update last_login for existing users (set to created_at as default)
UPDATE users 
SET last_login = created_at 
WHERE last_login IS NULL;

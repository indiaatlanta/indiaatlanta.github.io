-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update existing users with default names based on email
UPDATE users 
SET name = CASE 
    WHEN email = 'admin@henryscheinone.com' THEN 'Admin User'
    WHEN email = 'user@henryscheinone.com' THEN 'Regular User'
    ELSE SPLIT_PART(email, '@', 1)
END
WHERE name IS NULL;

-- Set name as NOT NULL after updating existing records
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Create index for better performance on last_login queries
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

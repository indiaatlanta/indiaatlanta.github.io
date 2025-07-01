-- Add missing columns to users table
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
END $$;

-- Update existing users with default names based on their email
UPDATE users 
SET name = CASE 
    WHEN email LIKE 'admin%' THEN 'Admin User'
    WHEN email LIKE 'manager%' THEN 'Manager User'
    WHEN email LIKE 'john.smith%' THEN 'John Smith'
    WHEN email LIKE 'jane.doe%' THEN 'Jane Doe'
    ELSE INITCAP(SPLIT_PART(email, '@', 1))
END
WHERE name IS NULL;

-- Make name column NOT NULL after populating existing records
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Add index on last_login for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Update demo user passwords (hashed version of 'password123')
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G'
WHERE email IN (
    'admin@henryscheinone.com',
    'user@henryscheinone.com', 
    'manager@henryscheinone.com',
    'john.smith@henryscheinone.com',
    'jane.doe@henryscheinone.com'
);

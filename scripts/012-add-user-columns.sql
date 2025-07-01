-- Add missing columns to users table
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
        
        -- Update existing users with default names based on email
        UPDATE users SET name = 
            CASE 
                WHEN email LIKE '%admin%' THEN 'Admin User'
                WHEN email LIKE '%manager%' THEN 'Manager User'
                WHEN email LIKE 'john.smith%' THEN 'John Smith'
                WHEN email LIKE 'jane.doe%' THEN 'Jane Doe'
                ELSE INITCAP(SPLIT_PART(email, '@', 1))
            END
        WHERE name IS NULL;
        
        -- Make name NOT NULL after populating existing records
        ALTER TABLE users ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
    END IF;
END $$;

-- Update existing demo users with proper names if they exist
UPDATE users SET 
    name = CASE 
        WHEN email = 'admin@henryscheinone.com' THEN 'Admin User'
        WHEN email = 'user@henryscheinone.com' THEN 'Regular User'
        WHEN email = 'manager@henryscheinone.com' THEN 'Manager User'
        WHEN email = 'john.smith@henryscheinone.com' THEN 'John Smith'
        WHEN email = 'jane.doe@henryscheinone.com' THEN 'Jane Doe'
        ELSE name
    END
WHERE email IN (
    'admin@henryscheinone.com',
    'user@henryscheinone.com', 
    'manager@henryscheinone.com',
    'john.smith@henryscheinone.com',
    'jane.doe@henryscheinone.com'
);

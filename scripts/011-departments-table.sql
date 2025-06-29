-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, slug, description, color, sort_order) VALUES
('Engineering', 'engineering', 'Software development and technical roles', '#3B82F6', 1),
('Product', 'product', 'Product management and strategy roles', '#10B981', 2),
('Design', 'design', 'User experience and visual design roles', '#8B5CF6', 3),
('Marketing', 'marketing', 'Marketing and growth roles', '#F59E0B', 4),
('Sales', 'sales', 'Sales and business development roles', '#EF4444', 5),
('Operations', 'operations', 'Operations and support roles', '#6B7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- Add department_id to job_roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_roles' AND column_name = 'department_id') THEN
        ALTER TABLE job_roles ADD COLUMN department_id INTEGER REFERENCES departments(id);
    END IF;
END $$;

-- Update existing job roles to have department associations
UPDATE job_roles SET department_id = 1 WHERE department_id IS NULL AND (name ILIKE '%engineer%' OR name ILIKE '%developer%' OR name ILIKE '%architect%');
UPDATE job_roles SET department_id = 2 WHERE department_id IS NULL AND (name ILIKE '%product%' OR name ILIKE '%pm%');
UPDATE job_roles SET department_id = 3 WHERE department_id IS NULL AND (name ILIKE '%design%' OR name ILIKE '%ux%' OR name ILIKE '%ui%');
UPDATE job_roles SET department_id = 4 WHERE department_id IS NULL AND (name ILIKE '%marketing%' OR name ILIKE '%growth%');
UPDATE job_roles SET department_id = 5 WHERE department_id IS NULL AND (name ILIKE '%sales%' OR name ILIKE '%account%');
UPDATE job_roles SET department_id = 6 WHERE department_id IS NULL AND department_id IS NULL;

-- Set default department for any remaining null values
UPDATE job_roles SET department_id = 1 WHERE department_id IS NULL;

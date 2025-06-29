-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample departments
INSERT INTO departments (name, slug, description, color, sort_order) VALUES
('Engineering', 'engineering', 'Software development and technical roles', '#3B82F6', 1),
('Product', 'product', 'Product management and strategy roles', '#10B981', 2),
('Design', 'design', 'User experience and visual design roles', '#8B5CF6', 3),
('Marketing', 'marketing', 'Marketing and growth roles', '#F59E0B', 4),
('Sales', 'sales', 'Sales and business development roles', '#EF4444', 5),
('Operations', 'operations', 'Operations and support roles', '#6B7280', 6)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- Add department_id to job_roles if it doesn't exist
ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);

-- Update existing job roles to assign them to departments based on their codes/titles
UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'engineering') 
WHERE (code LIKE 'SE%' OR code LIKE 'M-EM%' OR title ILIKE '%engineer%' OR title ILIKE '%developer%');

UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'product') 
WHERE (code LIKE 'PM%' OR code LIKE 'M-PD%' OR title ILIKE '%product%');

UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'design') 
WHERE (code LIKE 'UX%' OR code LIKE 'UI%' OR code LIKE 'M-DM%' OR title ILIKE '%design%' OR title ILIKE '%ux%');

UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'marketing') 
WHERE (code LIKE 'MK%' OR code LIKE 'M-MM%' OR title ILIKE '%marketing%');

UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'sales') 
WHERE (code LIKE 'SR%' OR code LIKE 'M-SM%' OR title ILIKE '%sales%');

UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'operations') 
WHERE (code LIKE 'OP%' OR code LIKE 'M-OM%' OR title ILIKE '%operations%' OR title ILIKE '%support%');

-- Set default department for any unassigned roles
UPDATE job_roles SET department_id = (SELECT id FROM departments WHERE slug = 'engineering') 
WHERE department_id IS NULL;

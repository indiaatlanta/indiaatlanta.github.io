-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
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
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- Add department_id to job_roles if it doesn't exist
ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id);

-- Update existing job roles to assign them to departments based on their names
UPDATE job_roles SET department_id = (
    CASE 
        WHEN title ILIKE '%engineer%' OR title ILIKE '%developer%' OR title ILIKE '%architect%' THEN 
            (SELECT id FROM departments WHERE slug = 'engineering')
        WHEN title ILIKE '%product%' OR title ILIKE '%pm%' THEN 
            (SELECT id FROM departments WHERE slug = 'product')
        WHEN title ILIKE '%design%' OR title ILIKE '%ux%' OR title ILIKE '%ui%' THEN 
            (SELECT id FROM departments WHERE slug = 'design')
        WHEN title ILIKE '%marketing%' OR title ILIKE '%growth%' THEN 
            (SELECT id FROM departments WHERE slug = 'marketing')
        WHEN title ILIKE '%sales%' OR title ILIKE '%account%' THEN 
            (SELECT id FROM departments WHERE slug = 'sales')
        WHEN title ILIKE '%operations%' OR title ILIKE '%ops%' OR title ILIKE '%support%' THEN 
            (SELECT id FROM departments WHERE slug = 'operations')
        ELSE 
            (SELECT id FROM departments WHERE slug = 'engineering')
    END
) WHERE department_id IS NULL;

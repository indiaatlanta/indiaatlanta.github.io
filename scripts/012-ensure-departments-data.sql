-- Ensure departments table exists and has data
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
  sort_order = EXCLUDED.sort_order;

-- Update job roles to have proper department assignments
UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'engineering'
) WHERE LOWER(name) LIKE '%engineer%' OR LOWER(name) LIKE '%developer%' OR LOWER(name) LIKE '%architect%';

UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'product'
) WHERE LOWER(name) LIKE '%product%' OR LOWER(name) LIKE '%pm%';

UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'design'
) WHERE LOWER(name) LIKE '%design%' OR LOWER(name) LIKE '%ux%' OR LOWER(name) LIKE '%ui%';

UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'marketing'
) WHERE LOWER(name) LIKE '%marketing%' OR LOWER(name) LIKE '%growth%';

UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'sales'
) WHERE LOWER(name) LIKE '%sales%' OR LOWER(name) LIKE '%account%';

UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'operations'
) WHERE LOWER(name) LIKE '%operations%' OR LOWER(name) LIKE '%support%' OR LOWER(name) LIKE '%admin%';

-- Set default department for any unassigned roles
UPDATE job_roles SET department_id = (
  SELECT id FROM departments WHERE slug = 'engineering' LIMIT 1
) WHERE department_id IS NULL;

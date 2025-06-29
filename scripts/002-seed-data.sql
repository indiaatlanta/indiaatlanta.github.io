-- Insert initial data

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@henryscheinone.com', '$2b$10$rQZ8kqH5FqGzJ4yJ4yJ4yOzJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4yJ4y', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert departments
INSERT INTO departments (name, slug, description) VALUES 
('Engineering', 'engineering', 'Software development and technical roles'),
('Design', 'design', 'Product design and user experience roles'),
('Customer Success', 'customer-success', 'Customer support and success roles'),
('Marketing/Growth', 'marketing-growth', 'Marketing and growth roles'),
('Operations', 'operations', 'Operations and process roles'),
('People', 'people', 'Human resources and people operations'),
('Finance', 'finance', 'Finance and accounting roles'),
('Product', 'product', 'Product management roles')
ON CONFLICT (slug) DO NOTHING;

-- Insert skill categories
INSERT INTO skill_categories (name, slug, color, sort_order) VALUES 
('Technical Skills', 'technical', 'blue', 1),
('Delivery', 'delivery', 'green', 2),
('Feedback, Communication & Collaboration', 'communication', 'purple', 3),
('Leadership', 'leadership', 'indigo', 4),
('Strategic Impact', 'strategic', 'orange', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample job roles for Engineering department
INSERT INTO job_roles (department_id, name, code, level, salary_min, salary_max, location_type) 
SELECT d.id, 'Junior Engineer', 'E1', 1, 35000, 45000, 'Hybrid'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (department_id, name, code, level, salary_min, salary_max, location_type) 
SELECT d.id, 'Software Engineer', 'E2', 2, 45000, 60000, 'Hybrid'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (department_id, name, code, level, salary_min, salary_max, location_type) 
SELECT d.id, 'Senior Engineer', 'E3', 3, 60000, 80000, 'Hybrid'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

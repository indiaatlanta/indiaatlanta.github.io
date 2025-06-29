-- Insert skill categories
INSERT INTO skill_categories (name, color, sort_order) VALUES
('Technical Skills', 'blue', 1),
('Delivery', 'green', 2),
('Feedback, Communication & Collaboration', 'purple', 3),
('Leadership', 'indigo', 4),
('Strategic Impact', 'orange', 5),
('Language and Technologies Familiarity', 'cyan', 6)
ON CONFLICT DO NOTHING;

-- Insert departments
INSERT INTO departments (name, slug, description, color, sort_order) VALUES
('Engineering', 'engineering', 'Software development and technical roles', '#3B82F6', 1),
('Product', 'product', 'Product management and strategy roles', '#10B981', 2),
('Design', 'design', 'User experience and visual design roles', '#8B5CF6', 3),
('Marketing', 'marketing', 'Marketing and growth roles', '#F59E0B', 4),
('Sales', 'sales', 'Sales and business development roles', '#EF4444', 5),
('Operations', 'operations', 'Operations and support roles', '#6B7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample skills
INSERT INTO skills_master (name, category_id, description, sort_order) 
SELECT 
    'JavaScript/TypeScript', 
    sc.id, 
    'Proficiency in modern JavaScript and TypeScript development including ES6+ features, async/await, and type systems.',
    1
FROM skill_categories sc WHERE sc.name = 'Technical Skills'
ON CONFLICT DO NOTHING;

INSERT INTO skills_master (name, category_id, description, sort_order) 
SELECT 
    'React/Next.js', 
    sc.id, 
    'Experience with React ecosystem including hooks, state management, and Next.js framework features.',
    2
FROM skill_categories sc WHERE sc.name = 'Technical Skills'
ON CONFLICT DO NOTHING;

INSERT INTO skills_master (name, category_id, description, sort_order) 
SELECT 
    'Problem Solving', 
    sc.id, 
    'Ability to analyze complex problems, break them down into manageable components, and implement effective solutions.',
    1
FROM skill_categories sc WHERE sc.name = 'Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO skills_master (name, category_id, description, sort_order) 
SELECT 
    'Team Collaboration', 
    sc.id, 
    'Working effectively with cross-functional teams, providing constructive feedback, and supporting team goals.',
    1
FROM skill_categories sc WHERE sc.name = 'Feedback, Communication & Collaboration'
ON CONFLICT DO NOTHING;

INSERT INTO skills_master (name, category_id, description, sort_order) 
SELECT 
    'Technical Leadership', 
    sc.id, 
    'Leading technical decisions, mentoring team members, and driving technical excellence across projects.',
    1
FROM skill_categories sc WHERE sc.name = 'Leadership'
ON CONFLICT DO NOTHING;

-- Insert sample job roles for Engineering department
INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Software Engineer I',
    'Software Engineer I', 
    'SE1',
    d.id,
    1,
    70000,
    90000,
    'Hybrid',
    'Entry-level software engineer responsible for implementing features and learning from senior team members.',
    1
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Software Engineer II',
    'Software Engineer II', 
    'SE2',
    d.id,
    2,
    90000,
    120000,
    'Hybrid',
    'Mid-level software engineer who works independently and mentors junior developers.',
    2
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Senior Software Engineer',
    'Senior Software Engineer', 
    'SSE',
    d.id,
    3,
    120000,
    160000,
    'Hybrid',
    'Senior engineer who leads technical decisions and architects complex systems.',
    3
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Engineering Manager',
    'Engineering Manager', 
    'M1',
    d.id,
    4,
    140000,
    180000,
    'Hybrid',
    'Engineering manager responsible for team leadership and technical strategy.',
    4
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

-- Insert sample job roles for Product department
INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Product Manager I',
    'Product Manager I', 
    'PM1',
    d.id,
    1,
    80000,
    100000,
    'Hybrid',
    'Entry-level product manager learning product strategy and working with engineering teams.',
    1
FROM departments d WHERE d.slug = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Product Manager II',
    'Product Manager II', 
    'PM2',
    d.id,
    2,
    100000,
    130000,
    'Hybrid',
    'Mid-level product manager who owns product features and drives roadmap execution.',
    2
FROM departments d WHERE d.slug = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (name, title, code, department_id, level, salary_min, salary_max, location_type, description, sort_order)
SELECT 
    'Senior Product Manager',
    'Senior Product Manager', 
    'SPM',
    d.id,
    3,
    130000,
    170000,
    'Hybrid',
    'Senior product manager who leads product strategy and manages complex product initiatives.',
    3
FROM departments d WHERE d.slug = 'product'
ON CONFLICT DO NOTHING;

-- Insert demonstration templates and link to job roles
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Intermediate',
    'Demonstrates proficiency in JavaScript and TypeScript',
    'Can write clean, maintainable code using modern JavaScript features and TypeScript for type safety'
FROM skills_master sm WHERE sm.name = 'JavaScript/TypeScript'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Advanced',
    'Expert level JavaScript and TypeScript skills',
    'Architects complex applications, mentors others on best practices, and drives technical decisions'
FROM skills_master sm WHERE sm.name = 'JavaScript/TypeScript'
ON CONFLICT DO NOTHING;

-- Link skills to job roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SE1', 'SE2')
WHERE sm.name = 'JavaScript/TypeScript' AND dt.level = 'Intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SSE', 'M1')
WHERE sm.name = 'JavaScript/TypeScript' AND dt.level = 'Advanced'
ON CONFLICT DO NOTHING;

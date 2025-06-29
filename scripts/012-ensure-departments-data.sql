-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample departments if they don't exist
INSERT INTO departments (name, slug, description, color, sort_order) 
VALUES 
    ('Engineering', 'engineering', 'Software development and technical roles', '#3B82F6', 1),
    ('Product', 'product', 'Product management and strategy roles', '#10B981', 2),
    ('Design', 'design', 'User experience and visual design roles', '#8B5CF6', 3),
    ('Marketing', 'marketing', 'Marketing and growth roles', '#F59E0B', 4),
    ('Sales', 'sales', 'Sales and business development roles', '#EF4444', 5),
    ('Operations', 'operations', 'Operations and support roles', '#6B7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- Create job_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    level VARCHAR(50),
    description TEXT,
    full_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample job roles
INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'Software Engineer I', d.id, 'Junior', 'Entry-level software development position', 'Responsible for writing clean, maintainable code and learning from senior team members.'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'Software Engineer II', d.id, 'Mid', 'Mid-level software development position', 'Develops features independently and mentors junior developers.'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'Senior Software Engineer', d.id, 'Senior', 'Senior-level software development position', 'Leads technical decisions and architects complex systems.'
FROM departments d WHERE d.slug = 'engineering'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'Product Manager', d.id, 'Mid', 'Product strategy and roadmap management', 'Defines product requirements and works with engineering teams.'
FROM departments d WHERE d.slug = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'Senior Product Manager', d.id, 'Senior', 'Senior product strategy and team leadership', 'Leads product strategy and manages multiple product lines.'
FROM departments d WHERE d.slug = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO job_roles (title, department_id, level, description, full_description)
SELECT 
    'UX Designer', d.id, 'Mid', 'User experience design and research', 'Creates user-centered designs and conducts usability research.'
FROM departments d WHERE d.slug = 'design'
ON CONFLICT DO NOTHING;

-- Create skills_master table if it doesn't exist
CREATE TABLE IF NOT EXISTS skills_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample skills
INSERT INTO skills_master (name, category, description) VALUES
    ('JavaScript', 'Programming Languages', 'Modern JavaScript development'),
    ('React', 'Frontend Frameworks', 'React.js library for building user interfaces'),
    ('Node.js', 'Backend Technologies', 'Server-side JavaScript runtime'),
    ('Product Strategy', 'Product Management', 'Strategic product planning and roadmapping'),
    ('User Research', 'Design', 'Understanding user needs and behaviors'),
    ('SQL', 'Databases', 'Structured Query Language for databases'),
    ('Python', 'Programming Languages', 'Python programming language'),
    ('TypeScript', 'Programming Languages', 'Typed superset of JavaScript'),
    ('AWS', 'Cloud Platforms', 'Amazon Web Services cloud platform'),
    ('Docker', 'DevOps', 'Containerization platform')
ON CONFLICT DO NOTHING;

-- Create role_skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_skills (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES job_roles(id),
    skill_id INTEGER REFERENCES skills_master(id),
    required_level INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample role-skill relationships
INSERT INTO role_skills (role_id, skill_id, required_level, is_required)
SELECT jr.id, sm.id, 2, true
FROM job_roles jr, skills_master sm
WHERE jr.title = 'Software Engineer I' AND sm.name = 'JavaScript'
ON CONFLICT DO NOTHING;

INSERT INTO role_skills (role_id, skill_id, required_level, is_required)
SELECT jr.id, sm.id, 3, true
FROM job_roles jr, skills_master sm
WHERE jr.title = 'Senior Software Engineer' AND sm.name = 'JavaScript'
ON CONFLICT DO NOTHING;

INSERT INTO role_skills (role_id, skill_id, required_level, is_required)
SELECT jr.id, sm.id, 2, true
FROM job_roles jr, skills_master sm
WHERE jr.title = 'Product Manager' AND sm.name = 'Product Strategy'
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Departments created:' as info, COUNT(*) as count FROM departments
UNION ALL
SELECT 'Job roles created:', COUNT(*) FROM job_roles
UNION ALL
SELECT 'Skills created:', COUNT(*) FROM skills_master
UNION ALL
SELECT 'Role-skill relationships:', COUNT(*) FROM role_skills;

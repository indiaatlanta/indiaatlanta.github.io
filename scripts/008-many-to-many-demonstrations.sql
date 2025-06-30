-- Create demonstration_templates table for reusable demonstrations
CREATE TABLE IF NOT EXISTS demonstration_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create many-to-many relationship between demonstration templates and job roles
CREATE TABLE IF NOT EXISTS demonstration_job_roles (
    id SERIAL PRIMARY KEY,
    demonstration_id INTEGER REFERENCES demonstration_templates(id) ON DELETE CASCADE,
    job_role_id INTEGER REFERENCES job_roles(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demonstration_id, job_role_id)
);

-- Create many-to-many relationship between demonstration templates and skills
CREATE TABLE IF NOT EXISTS demonstration_skills (
    id SERIAL PRIMARY KEY,
    demonstration_id INTEGER REFERENCES demonstration_templates(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demonstration_id, skill_id)
);

-- Insert some sample demonstration templates
INSERT INTO demonstration_templates (title, description, category) VALUES
('Build a REST API', 'Create a RESTful API with CRUD operations, authentication, and proper error handling', 'Backend Development'),
('Create a React Dashboard', 'Build a responsive dashboard with charts, data tables, and real-time updates', 'Frontend Development'),
('Database Design Project', 'Design and implement a normalized database schema with proper relationships', 'Database Management'),
('DevOps Pipeline Setup', 'Set up CI/CD pipeline with automated testing and deployment', 'DevOps'),
('Mobile App Development', 'Create a cross-platform mobile application with native features', 'Mobile Development'),
('Data Analysis Report', 'Perform comprehensive data analysis and create visualizations and insights', 'Data Science'),
('Security Audit', 'Conduct security assessment and implement security best practices', 'Cybersecurity'),
('Cloud Architecture Design', 'Design scalable cloud infrastructure with proper monitoring and backup', 'Cloud Computing');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_demonstration_id ON demonstration_job_roles(demonstration_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_job_role_id ON demonstration_job_roles(job_role_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_skills_demonstration_id ON demonstration_skills(demonstration_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_skills_skill_id ON demonstration_skills(skill_id);

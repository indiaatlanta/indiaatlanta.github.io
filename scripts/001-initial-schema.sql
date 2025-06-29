-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
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

-- Create job_roles table
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    department_id INTEGER REFERENCES departments(id),
    level INTEGER DEFAULT 1,
    salary_min INTEGER,
    salary_max INTEGER,
    location_type VARCHAR(50) DEFAULT 'Hybrid',
    description TEXT,
    full_description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skills_master table
CREATE TABLE IF NOT EXISTS skills_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES skill_categories(id),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create demonstration_templates table
CREATE TABLE IF NOT EXISTS demonstration_templates (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER REFERENCES skills_master(id),
    level VARCHAR(50) NOT NULL,
    description TEXT,
    demonstration_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create demonstration_job_roles table (many-to-many)
CREATE TABLE IF NOT EXISTS demonstration_job_roles (
    id SERIAL PRIMARY KEY,
    demonstration_template_id INTEGER REFERENCES demonstration_templates(id),
    job_role_id INTEGER REFERENCES job_roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demonstration_template_id, job_role_id)
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_roles_department ON job_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_skills_master_category ON skills_master(category_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_templates_skill ON demonstration_templates(skill_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_template ON demonstration_job_roles(demonstration_template_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_job ON demonstration_job_roles(job_role_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);

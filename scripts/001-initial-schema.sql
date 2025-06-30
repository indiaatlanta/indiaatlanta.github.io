-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job_roles table
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skills_master table
CREATE TABLE IF NOT EXISTS skills_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create demonstration_templates table
CREATE TABLE IF NOT EXISTS demonstration_templates (
    id SERIAL PRIMARY KEY,
    skill_master_id INTEGER REFERENCES skills_master(id),
    level VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
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

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_demonstration_templates_skill ON demonstration_templates(skill_master_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_template ON demonstration_job_roles(demonstration_template_id);
CREATE INDEX IF NOT EXISTS idx_demonstration_job_roles_role ON demonstration_job_roles(job_role_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);

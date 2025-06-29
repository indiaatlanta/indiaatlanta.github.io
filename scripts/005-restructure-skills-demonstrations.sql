-- This script restructures the skills and demonstrations relationship
-- to better support the many-to-many relationship between skills and job roles

-- First, let's ensure we have proper foreign key constraints
ALTER TABLE demonstration_job_roles 
DROP CONSTRAINT IF EXISTS demonstration_job_roles_demonstration_template_id_fkey;

ALTER TABLE demonstration_job_roles 
DROP CONSTRAINT IF EXISTS demonstration_job_roles_job_role_id_fkey;

ALTER TABLE demonstration_job_roles 
ADD CONSTRAINT demonstration_job_roles_demonstration_template_id_fkey 
FOREIGN KEY (demonstration_template_id) REFERENCES demonstration_templates(id) ON DELETE CASCADE;

ALTER TABLE demonstration_job_roles 
ADD CONSTRAINT demonstration_job_roles_job_role_id_fkey 
FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE;

-- Add more comprehensive skill demonstrations for different roles
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Beginner',
    'Basic team collaboration skills',
    'Participates actively in team meetings, asks clarifying questions, and supports team goals'
FROM skills_master sm 
WHERE sm.name = 'Team Collaboration'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Beginner'
);

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Intermediate',
    'Strong collaboration and communication skills',
    'Facilitates cross-team communication, provides constructive feedback, and helps resolve conflicts'
FROM skills_master sm 
WHERE sm.name = 'Team Collaboration'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Intermediate'
);

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Advanced',
    'Expert collaboration and team leadership',
    'Builds high-performing teams, mentors others in collaboration skills, and drives organizational alignment'
FROM skills_master sm 
WHERE sm.name = 'Team Collaboration'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Advanced'
);

-- Link Team Collaboration skills to appropriate roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SE1', 'PM1')
WHERE sm.name = 'Team Collaboration' AND dt.level = 'Beginner'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SE2', 'PM2')
WHERE sm.name = 'Team Collaboration' AND dt.level = 'Intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SSE', 'SPM', 'M1')
WHERE sm.name = 'Team Collaboration' AND dt.level = 'Advanced'
ON CONFLICT DO NOTHING;

-- Add Technical Leadership demonstrations
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Intermediate',
    'Emerging technical leadership capabilities',
    'Guides technical decisions for small projects, mentors junior developers, and contributes to architecture discussions'
FROM skills_master sm 
WHERE sm.name = 'Technical Leadership'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Intermediate'
);

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Advanced',
    'Strong technical leadership and strategic thinking',
    'Drives technical strategy, leads complex initiatives, and influences engineering culture across teams'
FROM skills_master sm 
WHERE sm.name = 'Technical Leadership'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Advanced'
);

-- Link Technical Leadership to senior roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code = 'SSE'
WHERE sm.name = 'Technical Leadership' AND dt.level = 'Intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code = 'M1'
WHERE sm.name = 'Technical Leadership' AND dt.level = 'Advanced'
ON CONFLICT DO NOTHING;

-- Add React/Next.js skills to more roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SE1', 'SE2')
WHERE sm.name = 'React/Next.js' AND dt.level = 'Intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SSE', 'M1')
WHERE sm.name = 'React/Next.js' AND dt.level = 'Advanced'
ON CONFLICT DO NOTHING;

-- Add Problem Solving to all engineering and product roles
INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SE1', 'SE2', 'PM1', 'PM2')
WHERE sm.name = 'Problem Solving' AND dt.level = 'Intermediate'
ON CONFLICT DO NOTHING;

INSERT INTO demonstration_job_roles (demonstration_template_id, job_role_id)
SELECT dt.id, jr.id
FROM demonstration_templates dt
JOIN skills_master sm ON dt.skill_id = sm.id
JOIN job_roles jr ON jr.code IN ('SSE', 'SPM', 'M1')
WHERE sm.name = 'Problem Solving' AND dt.level = 'Advanced'
ON CONFLICT DO NOTHING;

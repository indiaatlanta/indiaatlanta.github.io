-- Update skills table to allow flexible level formats
-- First, update any existing N/A values to L1 as a default
UPDATE skills SET level = 'L1' WHERE level = 'N/A' OR level IS NULL;

-- Update skill levels to be more descriptive
UPDATE skills SET level = 'Beginner' WHERE level = '1' OR level = 'Basic';
UPDATE skills SET level = 'Intermediate' WHERE level = '2' OR level = 'Medium';
UPDATE skills SET level = 'Advanced' WHERE level = '3' OR level = 'High';
UPDATE skills SET level = 'Expert' WHERE level = '4' OR level = 'Expert';

-- Add a check constraint to ensure level follows the pattern (Letter + Number)
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_level_check;
ALTER TABLE skills ADD CONSTRAINT skills_level_check CHECK (level ~ '^[A-Z][0-9]+$');

-- Make level column NOT NULL
ALTER TABLE skills ALTER COLUMN level SET NOT NULL;

-- Update the skill categories table to add a description for better admin UX
ALTER TABLE skill_categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Update skill categories with descriptions
UPDATE skill_categories SET description = 
  CASE 
    WHEN slug = 'technical' THEN 'Core technical competencies and domain expertise required for the role'
    WHEN slug = 'delivery' THEN 'Skills related to planning, executing, and delivering work effectively'
    WHEN slug = 'communication' THEN 'Interpersonal skills including feedback, collaboration, and communication'
    WHEN slug = 'leadership' THEN 'Leadership capabilities and people management skills'
    WHEN slug = 'strategic' THEN 'Strategic thinking and organizational impact abilities'
    ELSE 'General skill category'
  END
WHERE description IS NULL;

-- Add some example skills with different level types for demonstration
INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order) 
SELECT 1, 1, 'Advanced Security', 'L3', 'Implements advanced security measures', 'Advanced security implementation and threat analysis', 10
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Advanced Security');

INSERT INTO skills (job_role_id, category_id, name, level, description, full_description, sort_order) 
SELECT 1, 4, 'Team Leadership', 'M2', 'Leads small development teams', 'Manages and mentors junior developers, coordinates team activities', 20
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Team Leadership');

-- Add some additional skills
INSERT INTO skills (name, category, level, description, full_description) VALUES
('TypeScript', 'Programming', 'Advanced', 'Typed superset of JavaScript', 'TypeScript adds static type definitions to JavaScript, enabling better tooling, error detection, and code maintainability in large applications.'),
('Vue.js', 'Frontend', 'Intermediate', 'Progressive JavaScript framework', 'Vue.js is a progressive framework for building user interfaces, known for its gentle learning curve and flexible architecture.'),
('Angular', 'Frontend', 'Intermediate', 'Platform for building mobile and desktop web applications', 'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.'),
('Express.js', 'Backend', 'Advanced', 'Web application framework for Node.js', 'Express.js is a minimal and flexible Node.js web application framework that provides robust features for web and mobile applications.'),
('MongoDB', 'Database', 'Intermediate', 'NoSQL document database', 'MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need.'),
('PostgreSQL', 'Database', 'Advanced', 'Advanced open source relational database', 'PostgreSQL is a powerful, open source object-relational database system with strong reputation for reliability and performance.'),
('Redis', 'Database', 'Intermediate', 'In-memory data structure store', 'Redis is an open source, in-memory data structure store, used as a database, cache, and message broker.'),
('Kubernetes', 'DevOps', 'Intermediate', 'Container orchestration platform', 'Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management.'),
('Jenkins', 'DevOps', 'Intermediate', 'Automation server for CI/CD', 'Jenkins is an open source automation server which enables developers to build, test and deploy their applications.'),
('Terraform', 'DevOps', 'Beginner', 'Infrastructure as Code tool', 'Terraform is an open-source infrastructure as code software tool that enables you to safely and predictably create, change, and improve infrastructure.');

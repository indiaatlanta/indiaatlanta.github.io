-- Debug and fix skills data
SELECT 'Current skills count:' as info, COUNT(*) as count FROM skills;

-- Check for duplicate skills
SELECT name, COUNT(*) as count 
FROM skills 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Ensure we have proper skill categories
UPDATE skills SET category = 'Programming' WHERE category IS NULL AND name IN ('JavaScript', 'Python', 'TypeScript');
UPDATE skills SET category = 'Frontend' WHERE category IS NULL AND name IN ('React', 'Vue.js', 'Angular', 'HTML', 'CSS');
UPDATE skills SET category = 'Backend' WHERE category IS NULL AND name IN ('Node.js', 'Express.js');
UPDATE skills SET category = 'Database' WHERE category IS NULL AND name IN ('SQL', 'MongoDB', 'PostgreSQL', 'Redis');
UPDATE skills SET category = 'DevOps' WHERE category IS NULL AND name IN ('Docker', 'Kubernetes', 'Jenkins', 'Terraform');
UPDATE skills SET category = 'Cloud' WHERE category IS NULL AND name IN ('AWS');

-- Add missing essential skills if they don't exist
INSERT INTO skills (name, category, level, description, full_description) 
SELECT 'Git', 'Tools', 'Advanced', 'Version control system', 'Git is a distributed version control system for tracking changes in source code during software development.'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Git');

INSERT INTO skills (name, category, level, description, full_description) 
SELECT 'REST APIs', 'Backend', 'Advanced', 'RESTful web services', 'Understanding of REST architectural principles and ability to design and implement RESTful APIs.'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'REST APIs');

INSERT INTO skills (name, category, level, description, full_description) 
SELECT 'Agile', 'Methodology', 'Intermediate', 'Agile development methodology', 'Experience with Agile development practices including Scrum, Kanban, and iterative development.'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Agile');

-- Show final skills summary
SELECT category, COUNT(*) as skill_count 
FROM skills 
GROUP BY category 
ORDER BY category;

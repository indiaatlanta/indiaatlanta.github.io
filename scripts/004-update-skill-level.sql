-- Update demonstration_templates to have more realistic skill levels
UPDATE demonstration_templates 
SET level = CASE 
    WHEN level = 'Intermediate' AND skill_id IN (
        SELECT id FROM skills_master WHERE name LIKE '%JavaScript%'
    ) THEN 'Intermediate'
    WHEN level = 'Advanced' AND skill_id IN (
        SELECT id FROM skills_master WHERE name LIKE '%JavaScript%'
    ) THEN 'Advanced'
    ELSE level
END;

-- Add more demonstration templates for different skill levels
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Beginner',
    'Basic understanding of JavaScript fundamentals',
    'Understands basic syntax, variables, functions, and can write simple scripts with guidance'
FROM skills_master sm 
WHERE sm.name = 'JavaScript/TypeScript'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Beginner'
);

-- Add React skill demonstrations
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Intermediate',
    'Proficient in React development',
    'Can build complex React applications using hooks, context, and modern patterns'
FROM skills_master sm 
WHERE sm.name = 'React/Next.js'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Intermediate'
);

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Advanced',
    'Expert React developer',
    'Architects scalable React applications, optimizes performance, and mentors others'
FROM skills_master sm 
WHERE sm.name = 'React/Next.js'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Advanced'
);

-- Add Problem Solving demonstrations
INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Intermediate',
    'Strong analytical and problem-solving abilities',
    'Can break down complex problems, identify root causes, and implement effective solutions'
FROM skills_master sm 
WHERE sm.name = 'Problem Solving'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Intermediate'
);

INSERT INTO demonstration_templates (skill_id, level, description, demonstration_description)
SELECT 
    sm.id,
    'Advanced',
    'Expert problem solver and strategic thinker',
    'Tackles ambiguous challenges, designs innovative solutions, and guides others in problem-solving approaches'
FROM skills_master sm 
WHERE sm.name = 'Problem Solving'
AND NOT EXISTS (
    SELECT 1 FROM demonstration_templates dt 
    WHERE dt.skill_id = sm.id AND dt.level = 'Advanced'
);

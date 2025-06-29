-- Add full_description column to job_roles if it doesn't exist
ALTER TABLE job_roles 
ADD COLUMN IF NOT EXISTS full_description TEXT;

-- Update existing records with more detailed descriptions
UPDATE job_roles 
SET full_description = CASE 
    WHEN code = 'SE1' THEN 'As a Software Engineer I, you will be responsible for writing clean, maintainable code while learning from senior team members. You will work on feature development, bug fixes, and participate in code reviews. This role is perfect for new graduates or developers with 0-2 years of experience who are eager to grow their technical skills in a collaborative environment.'
    WHEN code = 'SE2' THEN 'Software Engineer II is an intermediate role where you will work independently on complex features and mentor junior developers. You will participate in technical design discussions, lead small projects, and contribute to architectural decisions. This position requires 2-4 years of experience and strong problem-solving skills.'
    WHEN code = 'SSE' THEN 'Senior Software Engineers are technical leaders who architect complex systems and drive technical excellence across projects. You will mentor team members, lead technical initiatives, and make critical architectural decisions. This role requires 5+ years of experience and deep expertise in software development practices.'
    WHEN code = 'M1' THEN 'Engineering Managers lead and develop engineering teams while maintaining technical excellence. You will be responsible for team performance, career development, project planning, and technical strategy. This role combines people management with technical leadership and requires both engineering expertise and management skills.'
    WHEN code = 'PM1' THEN 'Product Manager I works closely with engineering and design teams to define and deliver product features. You will gather requirements, write user stories, and ensure successful product launches. This entry-level PM role is ideal for those with 0-2 years of product management experience.'
    WHEN code = 'PM2' THEN 'Product Manager II owns product features end-to-end and drives roadmap execution. You will conduct market research, analyze user feedback, and make data-driven product decisions. This role requires 2-4 years of product management experience and strong analytical skills.'
    WHEN code = 'SPM' THEN 'Senior Product Managers lead product strategy and manage complex product initiatives. You will define product vision, work with executive stakeholders, and drive cross-functional collaboration. This role requires 5+ years of product management experience and proven track record of successful product launches.'
    ELSE description
END
WHERE full_description IS NULL;

-- Check what skill categories exist
SELECT 'Categories:' as info, id, name, color, sort_order FROM skill_categories ORDER BY sort_order;

-- Check what skills exist and their categories
SELECT 'Skills Master:' as info, sm.id, sm.name, sc.name as category, sc.color 
FROM skills_master sm 
JOIN skill_categories sc ON sm.category_id = sc.id 
ORDER BY sc.sort_order, sm.sort_order, sm.name;

-- Check skill demonstrations by role
SELECT 'Demonstrations by Role:' as info, jr.name as role_name, sm.name as skill_name, sc.name as category_name
FROM skill_demonstrations sd
JOIN job_roles jr ON sd.job_role_id = jr.id
JOIN skills_master sm ON sd.skill_master_id = sm.id
JOIN skill_categories sc ON sm.category_id = sc.id
ORDER BY jr.name, sc.sort_order, sm.name;

-- Check if Language and Technologies Familiarity category exists
SELECT 'Language Category Check:' as info, * FROM skill_categories WHERE name ILIKE '%language%' OR name ILIKE '%technolog%';

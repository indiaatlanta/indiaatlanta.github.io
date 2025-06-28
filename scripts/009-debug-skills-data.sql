-- Debug script to check current skills data structure
SELECT 'Current skill_demonstrations structure:' as info;
SELECT 
  sd.id,
  sm.name as skill_name,
  sd.level,
  jr.name as role_name,
  jr.code as role_code,
  sc.name as category_name,
  sc.color as category_color,
  sc.sort_order as category_sort,
  sm.sort_order as skill_sort,
  sd.sort_order as demo_sort
FROM skill_demonstrations sd
JOIN skills_master sm ON sd.skill_master_id = sm.id
JOIN job_roles jr ON sd.job_role_id = jr.id
JOIN skill_categories sc ON sm.category_id = sc.id
WHERE jr.department_id = (SELECT id FROM departments WHERE slug = 'engineering')
ORDER BY jr.code, sc.sort_order, sm.sort_order, sd.sort_order;

SELECT 'Skill categories:' as info;
SELECT * FROM skill_categories ORDER BY sort_order;

SELECT 'Skills master with sort order:' as info;
SELECT 
  sm.id,
  sm.name,
  sm.sort_order,
  sc.name as category_name,
  sc.sort_order as category_sort
FROM skills_master sm
JOIN skill_categories sc ON sm.category_id = sc.id
ORDER BY sc.sort_order, sm.sort_order;

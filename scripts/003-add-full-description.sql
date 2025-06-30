-- Add full_description column to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS full_description TEXT;

-- Update existing skills with sample full descriptions
UPDATE skills SET full_description = 
  CASE 
    WHEN name = 'Security' THEN 
      'Security is a fundamental aspect of software engineering that encompasses understanding and implementing measures to protect systems, data, and users from various threats and vulnerabilities.

At the L1 level, engineers should:
- Understand basic security principles and common vulnerabilities (OWASP Top 10)
- Recognize the importance of secure coding practices
- Be aware of authentication and authorization concepts
- Understand the basics of data encryption and secure communication
- Know when to escalate security concerns to senior team members
- Follow established security guidelines and protocols
- Participate in security training and stay updated on security best practices'
    
    WHEN name = 'Work Breakdown' THEN
      'Work Breakdown is the practice of decomposing large, complex work items into smaller, manageable pieces that can be delivered incrementally and continuously deployed.

At the L1 level, engineers should understand:
- The value of small, independent work items for faster feedback cycles
- How smaller work items reduce risk and enable continuous deployment
- The importance of incremental delivery for business value
- Basic techniques for breaking down user stories and technical tasks
- The relationship between work item size and team velocity
- How proper work breakdown enables better estimation and planning

Key principles include:
- Each work item should be completable within a sprint
- Work items should be independently testable and deployable
- Dependencies between work items should be minimized
- Each piece should deliver some measurable value
- Work breakdown should consider technical architecture and team capabilities'
    
    WHEN name = 'JavaScript' THEN
      'Comprehensive understanding and application of JavaScript programming language, including ES6+ features, asynchronous programming, and modern development practices.'
    
    WHEN name = 'React' THEN
      'Proficiency in React.js framework for building user interfaces, including hooks, state management, component lifecycle, and modern React patterns.'
    
    WHEN name = 'Node.js' THEN
      'Experience with Node.js runtime environment for server-side JavaScript development, including npm ecosystem, modules, and backend application development.'
    
    WHEN name = 'Python' THEN
      'Knowledge of Python programming language, including syntax, data structures, object-oriented programming, and popular frameworks like Django or Flask.'
    
    WHEN name = 'SQL' THEN
      'Understanding of SQL database management, including query optimization, database design, normalization, and working with relational databases.'
    
    WHEN name = 'HTML' THEN
      'Proficiency in HTML5 markup language for structuring web content, including semantic elements, accessibility best practices, and modern HTML features.'
    
    WHEN name = 'CSS' THEN
      'Expertise in CSS3 for styling web applications, including flexbox, grid, animations, responsive design, and CSS preprocessors.'
    
    WHEN name = 'Git' THEN
      'Experience with Git version control system, including branching strategies, merge conflict resolution, and collaborative development workflows.'
    
    WHEN name = 'Docker' THEN
      'Knowledge of Docker containerization technology, including creating Dockerfiles, managing containers, and orchestration with Docker Compose.'
    
    WHEN name = 'AWS' THEN
      'Understanding of AWS cloud services, including EC2, S3, Lambda, RDS, and other core services for building scalable cloud applications.'
    
    ELSE description
  END
WHERE full_description IS NULL;

-- Set full_description to description for any remaining NULL values
UPDATE skills SET full_description = description WHERE full_description IS NULL;

-- Make full_description NOT NULL going forward
ALTER TABLE skills ALTER COLUMN full_description SET NOT NULL;

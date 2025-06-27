-- Add full_description column to skills table
ALTER TABLE skills ADD COLUMN full_description TEXT;

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
- Participate in security training and stay updated on security best practices

This foundational understanding ensures that security considerations are integrated into the development process from the beginning, rather than being an afterthought. Engineers at this level should be able to identify potential security issues and seek guidance when needed.'
    
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
- Work breakdown should consider technical architecture and team capabilities

Understanding work breakdown at this level helps engineers contribute to more predictable delivery cycles and enables the team to respond quickly to changing requirements.'
    
    ELSE description
  END
WHERE full_description IS NULL;

-- Set full_description to description for any remaining NULL values
UPDATE skills SET full_description = description WHERE full_description IS NULL;

-- Make full_description NOT NULL going forward
ALTER TABLE skills ALTER COLUMN full_description SET NOT NULL;

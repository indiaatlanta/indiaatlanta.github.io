-- Create one_on_ones table
CREATE TABLE IF NOT EXISTS one_on_ones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create one_on_one_action_items table (correct name)
CREATE TABLE IF NOT EXISTS one_on_one_action_items (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create one_on_one_discussions table (correct name)
CREATE TABLE IF NOT EXISTS one_on_one_discussions (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_one_on_ones_user_id ON one_on_ones(user_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_manager_id ON one_on_ones(manager_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_meeting_date ON one_on_ones(meeting_date);
CREATE INDEX IF NOT EXISTS idx_one_on_one_action_items_one_on_one_id ON one_on_one_action_items(one_on_one_id);
CREATE INDEX IF NOT EXISTS idx_one_on_one_action_items_status ON one_on_one_action_items(status);
CREATE INDEX IF NOT EXISTS idx_one_on_one_discussions_one_on_one_id ON one_on_one_discussions(one_on_one_id);

-- Insert demo managers if they don't exist
INSERT INTO users (id, name, email, role, password_hash) VALUES
  (10, 'Sarah Johnson', 'sarah.johnson@henryscheinone.com', 'manager', '$2a$12$demo.hash.for.sarah'),
  (11, 'Mike Chen', 'mike.chen@henryscheinone.com', 'manager', '$2a$12$demo.hash.for.mike'),
  (12, 'Emily Davis', 'emily.davis@henryscheinone.com', 'manager', '$2a$12$demo.hash.for.emily')
ON CONFLICT (id) DO NOTHING;

-- Insert demo one-on-one meeting if demo user exists
DO $$
DECLARE
  demo_user_id INTEGER;
  sarah_manager_id INTEGER;
  demo_meeting_id INTEGER;
BEGIN
  -- Get demo user ID (assuming it exists from previous scripts)
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@henryscheinone.com' OR id = 1 LIMIT 1;
  
  -- Get Sarah's manager ID
  SELECT id INTO sarah_manager_id FROM users WHERE id = 10 LIMIT 1;
  
  -- Only insert if both users exist
  IF demo_user_id IS NOT NULL AND sarah_manager_id IS NOT NULL THEN
    -- Insert demo one-on-one meeting
    INSERT INTO one_on_ones (user_id, manager_id, meeting_date, notes) VALUES
      (demo_user_id, sarah_manager_id, '2024-01-15', 'Discussed Q1 goals and performance review process. Great progress on current projects and looking forward to new challenges.')
    ON CONFLICT DO NOTHING
    RETURNING id INTO demo_meeting_id;
    
    -- Get the meeting ID if it already exists
    IF demo_meeting_id IS NULL THEN
      SELECT id INTO demo_meeting_id FROM one_on_ones WHERE user_id = demo_user_id AND manager_id = sarah_manager_id LIMIT 1;
    END IF;
    
    -- Insert demo action items if meeting exists
    IF demo_meeting_id IS NOT NULL THEN
      INSERT INTO one_on_one_action_items (one_on_one_id, title, description, status, due_date) VALUES
        (demo_meeting_id, 'Complete React certification', 'Enroll in and complete the React certification course by end of Q1', 'in-progress', '2024-03-31'),
        (demo_meeting_id, 'Update portfolio', 'Add recent projects to professional portfolio', 'not-started', '2024-02-15'),
        (demo_meeting_id, 'Team mentoring', 'Start mentoring junior developers', 'completed', '2024-01-20')
      ON CONFLICT DO NOTHING;
      
      -- Insert demo discussions
      INSERT INTO one_on_one_discussions (one_on_one_id, user_id, content) VALUES
        (demo_meeting_id, demo_user_id, 'Looking forward to taking on more challenging projects this quarter and contributing to team growth.'),
        (demo_meeting_id, sarah_manager_id, 'Great progress on your current assignments! I think you are ready for more leadership responsibilities.')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

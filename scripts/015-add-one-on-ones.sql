-- Create one_on_ones table
CREATE TABLE IF NOT EXISTS one_on_ones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_name VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_one_on_ones_user_id ON one_on_ones(user_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_manager_id ON one_on_ones(manager_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_meeting_date ON one_on_ones(meeting_date);
CREATE INDEX IF NOT EXISTS idx_action_items_one_on_one_id ON action_items(one_on_one_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_discussions_one_on_one_id ON discussions(one_on_one_id);

-- Insert demo managers if they don't exist
INSERT INTO users (name, email, role, password_hash) VALUES
  ('Sarah Johnson', 'sarah.johnson@henryscheinone.com', 'admin', '$2a$12$demo.hash.for.sarah'),
  ('Mike Chen', 'mike.chen@henryscheinone.com', 'admin', '$2a$12$demo.hash.for.mike'),
  ('Emily Davis', 'emily.davis@henryscheinone.com', 'admin', '$2a$12$demo.hash.for.emily'),
  ('David Wilson', 'david.wilson@henryscheinone.com', 'admin', '$2a$12$demo.hash.for.david')
ON CONFLICT (email) DO NOTHING;

-- Insert demo one-on-one meeting
DO $$
DECLARE
  demo_user_id INTEGER;
  sarah_manager_id INTEGER;
BEGIN
  -- Get demo user ID
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@henryscheinone.com' LIMIT 1;
  
  -- Get Sarah's manager ID
  SELECT id INTO sarah_manager_id FROM users WHERE email = 'sarah.johnson@henryscheinone.com' LIMIT 1;
  
  -- Only insert if both users exist
  IF demo_user_id IS NOT NULL AND sarah_manager_id IS NOT NULL THEN
    INSERT INTO one_on_ones (user_id, manager_id, manager_name, meeting_date, notes) VALUES
      (demo_user_id, sarah_manager_id, 'Sarah Johnson', '2024-01-15', 'Discussed Q1 goals and performance review process. Great progress on current projects.')
    ON CONFLICT DO NOTHING;
    
    -- Get the one-on-one ID for demo data
    DECLARE
      demo_meeting_id INTEGER;
    BEGIN
      SELECT id INTO demo_meeting_id FROM one_on_ones WHERE user_id = demo_user_id AND manager_id = sarah_manager_id LIMIT 1;
      
      IF demo_meeting_id IS NOT NULL THEN
        -- Insert demo action items
        INSERT INTO action_items (one_on_one_id, description, status, due_date) VALUES
          (demo_meeting_id, 'Complete project documentation', 'in-progress', '2024-01-30'),
          (demo_meeting_id, 'Schedule team training session', 'not-started', '2024-02-15'),
          (demo_meeting_id, 'Review Q1 performance metrics', 'completed', '2024-01-20')
        ON CONFLICT DO NOTHING;
        
        -- Insert demo discussions
        INSERT INTO discussions (one_on_one_id, user_id, user_name, message) VALUES
          (demo_meeting_id, sarah_manager_id, 'Sarah Johnson', 'Great progress on the new feature implementation! The client feedback has been very positive.'),
          (demo_meeting_id, demo_user_id, 'Demo User', 'Thank you! I''m excited about the upcoming sprint and the new challenges ahead.'),
          (demo_meeting_id, sarah_manager_id, 'Sarah Johnson', 'Let''s discuss your career development goals in our next meeting.')
        ON CONFLICT DO NOTHING;
      END IF;
    END;
  END IF;
END $$;

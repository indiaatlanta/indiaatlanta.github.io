-- Create one-on-ones table
CREATE TABLE IF NOT EXISTS one_on_ones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create action items table
CREATE TABLE IF NOT EXISTS one_on_one_action_items (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL REFERENCES one_on_ones(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create discussions table
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
CREATE INDEX IF NOT EXISTS idx_action_items_one_on_one_id ON one_on_one_action_items(one_on_one_id);
CREATE INDEX IF NOT EXISTS idx_discussions_one_on_one_id ON one_on_one_discussions(one_on_one_id);

-- Insert some demo managers if they don't exist
INSERT INTO users (id, name, email, role, password_hash) VALUES 
  (10, 'Sarah Manager', 'sarah.manager@henryscheinone.com', 'manager', '$2a$10$demo.hash.for.development.only'),
  (11, 'Mike Director', 'mike.director@henryscheinone.com', 'manager', '$2a$10$demo.hash.for.development.only'),
  (12, 'Lisa VP', 'lisa.vp@henryscheinone.com', 'admin', '$2a$10$demo.hash.for.development.only')
ON CONFLICT (id) DO NOTHING;

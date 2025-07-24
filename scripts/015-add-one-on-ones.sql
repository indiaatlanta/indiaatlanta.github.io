-- Create one_on_ones table
CREATE TABLE IF NOT EXISTS one_on_ones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  manager_id INTEGER NOT NULL,
  meeting_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (one_on_one_id) REFERENCES one_on_ones(id) ON DELETE CASCADE
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id SERIAL PRIMARY KEY,
  one_on_one_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (one_on_one_id) REFERENCES one_on_ones(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_one_on_ones_user_id ON one_on_ones(user_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_manager_id ON one_on_ones(manager_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_meeting_date ON one_on_ones(meeting_date);
CREATE INDEX IF NOT EXISTS idx_action_items_one_on_one_id ON action_items(one_on_one_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_discussions_one_on_one_id ON discussions(one_on_one_id);

-- Insert demo managers
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES 
  (10, 'Sarah Johnson', 'sarah.johnson@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 'Mike Chen', 'mike.chen@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 'Lisa Rodriguez', 'lisa.rodriguez@henryscheinone.com', '$2b$10$dummy', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert demo one-on-one data
INSERT INTO one_on_ones (id, user_id, manager_id, meeting_date, notes, created_at, updated_at)
VALUES 
  (1, 1, 10, '2024-01-15', 'Discussed Q1 goals and career development opportunities. Great progress on current projects.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 10, '2024-01-01', 'Year-end review and planning for 2024. Set new learning objectives.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert demo action items
INSERT INTO action_items (id, one_on_one_id, title, description, status, due_date, created_at, updated_at)
VALUES 
  (1, 1, 'Complete React training', 'Finish the advanced React course by end of month', 'in-progress', '2024-01-31', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 'Update portfolio', 'Add recent projects to professional portfolio', 'not-started', '2024-02-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 2, 'Set up mentoring', 'Find a mentor for career guidance', 'completed', '2024-01-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert demo discussions
INSERT INTO discussions (id, one_on_one_id, user_id, content, created_at, updated_at)
VALUES 
  (1, 1, 1, 'Looking forward to taking on more challenging projects this quarter.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 10, 'I think you are ready for more responsibility. Let us discuss some leadership opportunities.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 2, 1, 'Thank you for the feedback on my performance this year.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

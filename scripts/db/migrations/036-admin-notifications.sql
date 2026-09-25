-- ==========================================================================
-- 036 - Admin Notifications System
-- Creates a notification system for admin users
-- ==========================================================================

-- PART 1: CREATE admin_notifications TABLE
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assignment', 'mention', 'reply', 'status_change', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

COMMENT ON COLUMN admin_notifications.user_id IS 'References auth.users.id (the admin user auth ID)';

-- PART 2: CREATE INDEXES
CREATE INDEX IF NOT EXISTS admin_notifications_user_idx
  ON admin_notifications (user_id);

CREATE INDEX IF NOT EXISTS admin_notifications_read_idx
  ON admin_notifications (user_id, is_read);

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx
  ON admin_notifications (created_at DESC);

-- PART 3: ENABLE ROW LEVEL SECURITY
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist to allow re-run
DROP POLICY IF EXISTS "Users can view their own notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON admin_notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON admin_notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- System can insert notifications (server-side)
CREATE POLICY "System can insert notifications" ON admin_notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON admin_notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- PART 4: HELPER FUNCTION TO CREATE NOTIFICATION
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO admin_notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 5: HELPER FUNCTION TO MARK AS READ
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: HELPER FUNCTION TO MARK ALL AS READ
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE admin_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid() AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 7: HELPER FUNCTION TO GET UNREAD COUNT
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM admin_notifications
  WHERE user_id = auth.uid() AND is_read = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================================
-- Installation complete. After running this script:
-- - Verify admin_notifications table exists
-- - Verify indexes are created
-- - Verify RLS policies are installed
-- - Test helper functions
-- ==========================================================================

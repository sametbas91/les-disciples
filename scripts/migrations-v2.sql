-- Execute this in Supabase SQL Editor

-- 1. Add "Berger" as valid status for members
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE members ADD CONSTRAINT members_status_check CHECK (status IN ('Disciple', 'Invité(e)', 'Berger'));

-- 2. Update Dylan's status to Berger
UPDATE members SET status = 'Berger' WHERE name ILIKE '%Dylan%';

-- 3. Add parent_id to comments for replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- 4. Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comment_likes" ON comment_likes FOR SELECT USING (true);

-- 5. Create avatars storage bucket (run in Supabase Dashboard > Storage > New Bucket)
-- Bucket name: avatars
-- Public: yes
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read and authenticated upload
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

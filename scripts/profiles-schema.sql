-- Execute this in Supabase SQL Editor

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  birth_date date,
  address text,
  city text,
  country text,
  latitude double precision,
  longitude double precision,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read for all authenticated (needed for map/ages)
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Create index on user_id for fast lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

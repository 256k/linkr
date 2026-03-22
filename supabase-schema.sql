-- Create URLs table
CREATE TABLE IF NOT EXISTS urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own URLs
CREATE POLICY "Users can view own URLs" ON urls
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own URLs
CREATE POLICY "Users can insert own URLs" ON urls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own URLs
CREATE POLICY "Users can update own URLs" ON urls
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own URLs
CREATE POLICY "Users can delete own URLs" ON urls
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

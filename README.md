# Linkr - Personal Link Manager

A sleek, minimalist link management dashboard where you can organize and quickly find URLs using tags.

## Features

- Save URLs with titles and tags
- Search/filter by tags
- Tag sidebar for quick filtering
- Dark/Light theme toggle
- Persistent cloud storage (Supabase)
- User authentication

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings > API**
3. Copy your **Project URL** and **anon/public** key

### 2. Run Database Schema

In Supabase dashboard, go to **SQL Editor** and run the schema:

```sql
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
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install & Run

```bash
npm install
npm run dev
```

### 5. Deploy

The app can be deployed to Vercel, Netlify, or any static hosting:

```bash
npm run build
```

Upload the `dist` folder to your hosting provider.

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Auth + PostgreSQL)
- Lucide Icons

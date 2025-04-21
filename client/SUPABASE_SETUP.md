# Setting up Supabase for Blips AI Platform

This guide walks you through setting up Supabase as the backend for the Blips AI Platform.

## 1. Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one.
2. Once logged in, click "New Project" to create a new project.
3. Fill in the project details:
   - Name: "Blips AI Platform" (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose a region closest to your users
   - Pricing Plan: Start with the free tier

4. Click "Create New Project" and wait for the project to be created (this may take a few minutes).

## 2. Set Up Database Tables

After your project is created, let's set up the necessary tables using the SQL editor:

1. Go to the "SQL Editor" in your Supabase dashboard.
2. Create a new query and paste the following SQL:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create content table
CREATE TABLE public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'film', 'short', 'image'
  category TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  creator_id UUID REFERENCES public.profiles(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies for content
CREATE POLICY "Content is viewable by everyone." 
  ON public.content FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own content." 
  ON public.content FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own content." 
  ON public.content FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own content." 
  ON public.content FOR DELETE 
  USING (auth.uid() = creator_id);

-- Create likes table
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content_id UUID REFERENCES public.content(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, content_id)
);

-- Enable Row Level Security
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Likes are viewable by everyone." 
  ON public.likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own likes." 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes." 
  ON public.likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content_id UUID REFERENCES public.content(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone." 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own comments." 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments." 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments." 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create saved items table
CREATE TABLE public.saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content_id UUID REFERENCES public.content(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, content_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create policies for saved items
CREATE POLICY "Saved items are viewable by the owner." 
  ON public.saved_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items." 
  ON public.saved_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items." 
  ON public.saved_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bug', 'feature', 'other'
  user_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'open' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY "Users can view their own feedback." 
  ON public.feedback FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert feedback." 
  ON public.feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

3. Run the query to create these tables and security policies.

## 3. Set Up Storage Buckets

Next, let's set up storage buckets for media uploads:

1. Navigate to "Storage" in your Supabase dashboard.
2. Create the following buckets:
   - `profile-images` - for user profile images
   - `content-thumbnails` - for content thumbnails
   - `videos` - for video uploads
   - `images` - for image uploads

3. For each bucket, set the permissions as needed. For example:
   - Public access for thumbnails and profile images
   - Authenticated-only access for full videos and images

## 4. Configure Authentication

1. Go to "Authentication" -> "Settings" in your Supabase dashboard.
2. Under "Email Auth", make sure "Enable Email Signup" is turned on.
3. Optionally, configure other auth providers like Google, Twitter, etc.

## 5. Get Your API Keys

1. Go to "Project Settings" -> "API" in your Supabase dashboard.
2. Copy the "Project URL" and "anon/public" key.
3. Create a `.env` file in your client project root and add these values:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Deploy Your Frontend

1. Build your frontend:
```bash
cd client
npm run build
```

2. Deploy to Vercel or your preferred hosting platform.

## 7. Testing

Test the following functionality to ensure everything is working properly:

- User registration and login
- Profile updates
- Content upload (videos and images)
- Likes, comments, and saves
- Feedback submission

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guides](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guides](https://supabase.com/docs/guides/storage)
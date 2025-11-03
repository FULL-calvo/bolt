/*
  # Complete Database Setup for Product Pit Stop

  1. New Tables
    - `product_likes` - Store user likes for products
    - `product_comments` - Store comments on products  
    - `messages` - Store conversations between users
    - `wishlist` - Store user wishlists
    - Update `profiles` table with wishlist column

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Storage
    - Create avatars bucket for profile pictures
    - Set up proper policies for file uploads
*/

-- Create product_likes table
CREATE TABLE IF NOT EXISTS product_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create product_comments table  
CREATE TABLE IF NOT EXISTS product_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table for conversations
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  message_type text DEFAULT 'direct' CHECK (message_type IN ('direct', 'product_inquiry')),
  created_at timestamptz DEFAULT now()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add wishlist column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'wishlist'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wishlist jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for product_likes
CREATE POLICY "Users can read all likes" ON product_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own likes" ON product_likes FOR ALL TO authenticated USING (user_id = auth.uid());

-- Policies for product_comments
CREATE POLICY "Users can read all comments" ON product_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON product_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own comments" ON product_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Policies for messages
CREATE POLICY "Users can read own messages" ON messages FOR SELECT TO authenticated 
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated 
  WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE TO authenticated 
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Policies for wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL TO authenticated 
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_likes_user ON product_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_product ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_product ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_created ON product_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
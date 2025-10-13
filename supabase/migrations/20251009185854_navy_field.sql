/*
  # Add wishlist column to profiles table

  1. Changes
    - Add `wishlist` column to `profiles` table
    - Set type as `jsonb` to store array of product IDs
    - Set default value as empty array `[]`
    - Allow null values for backward compatibility

  2. Security
    - No additional RLS policies needed as existing policies cover this column
*/

-- Add wishlist column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wishlist'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wishlist jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
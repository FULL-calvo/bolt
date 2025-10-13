import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  full_name: string;
  role: 'buyer' | 'seller';
  email: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: number;
  user_id: string;
  store_name: string;
  store_description?: string;
  store_address?: string;
  payment_info: any;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller?: Profile & { sellers?: Seller };
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: any;
  created_at: string;
  updated_at: string;
  product?: Product;
  buyer?: Profile;
  seller?: Profile;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  product_id?: string;
  message: string;
  is_read: boolean;
  message_type: 'direct' | 'product_inquiry';
  created_at: string;
  from_user?: Profile;
  to_user?: Profile;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}
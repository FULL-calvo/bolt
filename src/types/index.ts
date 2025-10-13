export interface User {
  id: string;
  role: 'buyer' | 'seller';
  name: string;
  email: string;
  profile_image?: string;
  bio?: string;
  phone?: string;
  address?: Address;
  preferences?: string[];
  store_name?: string;
  store_description?: string;
  wishlist?: string[];
  orders?: Order[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  video_url: string;
  thumbnail: string;
  likes: number;
  comments: number;
  posted_at: string;
  seller?: User;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  added_at: string;
}

export interface Order {
  order_id: string;
  product_id: string;
  quantity: number;
  price_paid: number;
  purchased_at: string;
  status: 'pendente' | 'processando' | 'enviado' | 'entregue' | 'cancelado';
  product?: Product;
}

export interface Order {
  order_id: string;
  product_id: string;
  quantity: number;
  price_paid: number;
  purchased_at: string;
  status: 'pendente' | 'processando' | 'enviado' | 'entregue' | 'cancelado';
  product?: Product;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id?: string;
  product_id?: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'direct' | 'product_comment';
}

export interface Comment {
  id: string;
  user_id: string;
  product_id: string;
  message: string;
  timestamp: string;
  user?: User;
}
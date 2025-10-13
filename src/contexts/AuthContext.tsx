import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types';
import { mockProducts } from '../data/mockData';

interface Profile {
  id: string;
  full_name: string;
  role: 'buyer' | 'seller';
  email: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  wishlist?: string[];
  created_at: string;
  updated_at: string;
}

interface SellerData {
  id: number;
  user_id: string;
  store_name: string;
  store_description?: string;
  store_address?: string;
  payment_info?: any;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
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
}

interface Order {
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
}

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  product_id?: string;
  message: string;
  is_read: boolean;
  message_type: 'direct' | 'product_inquiry';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  sellerData: SellerData | null;
  products: Product[];
  orders: Order[];
  messages: Message[];
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  addOrder: (orderData: { product_id: string; quantity: number; price_paid: number; status: 'pendente' | 'processando' | 'enviado' | 'entregue' | 'cancelado'; }) => Promise<void>;
  productLikes: Record<string, number>;
  updateProductLikes: (productId: string, liked: boolean) => void;
  productComments: Record<string, number>;
  updateProductComments: (productId: string, added: boolean) => void;
  toggleWishlist: (productId: string) => void;
  signup: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  becomeSeller: (storeName: string, storeDescription?: string) => Promise<void>;
  backToBuyer: () => Promise<void>;
  updateSellerData: (updates: Partial<SellerData>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  sendMessage: (recipientId: string, message: string, productId?: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [productComments, setProductComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setSellerData(null);
        setProducts([]);
        setOrders([]);
        setMessages([]);
        setCart([]);
        setProductLikes({});
        setProductComments({});
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // If seller, fetch seller data and products
      if (profileData.role === 'seller') {
        const { data: sellerInfo, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (sellerError && sellerError.code !== 'PGRST116') {
          throw sellerError;
        }
        
        if (sellerInfo) {
          setSellerData(sellerInfo);
          
          // Fetch products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;
          setProducts(productsData || []);
        }
      }

      // Fetch user likes
      const { data: likesData, error: likesError } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', userId);

      if (likesError) throw likesError;
      const likedProducts = new Set(likesData?.map(like => like.product_id) || []);
      setUserLikes(likedProducts);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

    } catch (error) {
      setUserLikes(new Set());
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear all states on logout
    setProfile(null);
    setSellerData(null);
    setProducts([]);
    setOrders([]);
    setMessages([]);
    setCart([]);
    setProductLikes({});
    setProductComments({});
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    // Handle profile image upload if it's a File
    let profileImageUrl = updates.profile_image;
    if (updates.profile_image && updates.profile_image instanceof File) {
      const file = updates.profile_image as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      profileImageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, profile_image: profileImageUrl })
      .eq('id', user.id);

    if (error) throw error;

    setProfile(prev => prev ? { ...prev, ...updates, profile_image: profileImageUrl } : null);
  };

  const becomeSeller = async (storeName: string, storeDescription?: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Update profile role first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create seller record
      const { data, error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          store_name: storeName,
          store_description: storeDescription
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local states
      setProfile(prev => prev ? { ...prev, role: 'seller' } : null);
      setSellerData(data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error becoming seller:', error);
      return { data: null, error };
    }
  };

  const backToBuyer = async () => {
    if (!user) throw new Error('No user logged in');

    // Update profile role
    await updateProfile({ role: 'buyer' });

    // Delete seller record
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    setSellerData(null);
    setProducts([]);
  };

  const updateSellerData = async (updates: Partial<SellerData>) => {
    if (!user || !sellerData) throw new Error('No seller data');

    const { error } = await supabase
      .from('sellers')
      .update(updates)
      .eq('user_id', user.id);

    if (error) throw error;

    setSellerData(prev => prev ? { ...prev, ...updates } : null);
  };

  const addProduct = async (product: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        seller_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    setProducts(prev => [data, ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sendMessage = async (recipientId: string, message: string, productId?: string) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id: recipientId,
        message,
        product_id: productId,
        message_type: productId ? 'product_inquiry' : 'direct'
      })
      .select()
      .single();

    if (error) throw error;

    setMessages(prev => [data, ...prev]);
    return data;
  };

  const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;

    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
  };

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product_id === productId);
      if (existingItem) {
        return prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { id: Date.now().toString(), user_id: user?.id || '', product_id: productId, quantity: 1, created_at: new Date().toISOString() }];
      }
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const addOrderFunc = async (orderData: { product_id: string; quantity: number; price_paid: number; status: 'pendente' | 'processando' | 'enviado' | 'entregue' | 'cancelado'; }) => {
    if (!user) throw new Error('No user logged in');

    const product = mockProducts.find(p => p.id === orderData.product_id);
    if (!product) throw new Error('Product not found');

    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: product.seller?.id || '',
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        unit_price: orderData.price_paid / orderData.quantity,
        total_price: orderData.price_paid,
        status: orderData.status
      })
      .select()
      .single();

    if (error) throw error;

    setOrders(prev => [data, ...prev]);
    setCart([]);
  };

  const updateProductComments = (productId: string, added: boolean) => {
    setProductComments(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + (added ? 1 : 0)
    }));
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !profile) return;

    const currentWishlist = profile.wishlist || [];
    const isInWishlist = currentWishlist.includes(productId);
    const newWishlist = isInWishlist
      ? currentWishlist.filter(id => id !== productId)
      : [...currentWishlist, productId];

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: newWishlist })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, wishlist: newWishlist } : null);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const toggleProductLike = async (productId: string) => {
    if (!user) return;
    
    const isLiked = userLikes.has(productId);
    
    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // Add like
        await supabase
          .from('product_likes')
          .insert({ user_id: user.id, product_id: productId });
        
        setUserLikes(prev => new Set([...prev, productId]));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addProductComment = async (productId: string, comment: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('product_comments')
        .insert({
          user_id: user.id,
          product_id: productId,
          comment
        })
        .select(`
          *,
          user:profiles(full_name, profile_image)
        `)
        .single();

      if (error) throw error;

      setProductComments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const getProductComments = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_comments')
        .select(`
          *,
          user:profiles(full_name, profile_image)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const getProductLikesCount = async (productId: string) => {
    try {
      const { count, error } = await supabase
        .from('product_likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching likes count:', error);
      return 0;
    }
  };

  // Load user likes on login
  const loadUserLikes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', userId);

      if (error) throw error;
      
      const likedProducts = new Set(data?.map(like => like.product_id) || []);
      setUserLikes(likedProducts);
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  };

  // Update the toggleWishlist function to use the new like system
  const toggleWishlist = async (productId: string) => {
    if (!user || !profile) return;

    const currentWishlist = profile.wishlist || [];
    const isInWishlist = currentWishlist.includes(productId);
    const newWishlist = isInWishlist
      ? currentWishlist.filter(id => id !== productId)
      : [...currentWishlist, productId];

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: newWishlist })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, wishlist: newWishlist } : null);

      // Also toggle the product like
      await toggleProductLike(productId);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Legacy functions for backward compatibility
  const updateProductLikes = (productId: string, liked: boolean) => {
    if (liked) {
      toggleProductLike(productId);
    }
  };

  const updateProductComments = (productId: string, added: boolean) => {
    // This is now handled by addProductComment
  };

  // Clean up old functions
  const persistLike = async (productId: string, liked: boolean) => {
    if (!user) return;
    
    try {
      if (liked) {
        await supabase
          .from('product_likes')
          .insert({ user_id: user.id, product_id: productId });
      } else {
        await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      }
    } catch (error) {
      console.error('Error persisting like:', error);
    }
  };

  const value = {
    user,
    profile,
    sellerData,
    products,
    orders,
    messages,
    cart,
    loading,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    addOrder: addOrderFunc,
    userLikes,
    toggleProductLike,
    updateProductLikes,
    productComments,
    updateProductComments,
    addProductComment,
    getProductComments,
    getProductLikesCount,
    toggleWishlist,
    signup,
    login,
    logout,
    updateProfile,
    becomeSeller,
    backToBuyer,
    updateSellerData,
    addProduct,
    updateProduct,
    deleteProduct,
    sendMessage,
    markMessageAsRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, Seller, Product, Order, Message, CartItem } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  seller: Seller | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  createSellerProfile: (storeData: Partial<Seller>) => Promise<{ error: any }>;
  updateSellerProfile: (updates: Partial<Seller>) => Promise<{ error: any }>;
  switchToNormalUser: () => Promise<{ error: any }>;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  fetchProducts: () => Promise<void>;
  // Cart
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<{ error: any }>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<{ error: any }>;
  removeFromCart: (productId: string) => Promise<{ error: any }>;
  clearCart: () => Promise<{ error: any }>;
  // Orders
  orders: Order[];
  createOrder: (items: { productId: string; quantity: number }[], shippingAddress?: any) => Promise<{ error: any }>;
  fetchOrders: () => Promise<void>;
  // Messages
  messages: Message[];
  sendMessage: (toUserId: string, message: string, productId?: string) => Promise<{ error: any }>;
  fetchMessages: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setSeller(null);
        setProducts([]);
        setCartItems([]);
        setOrders([]);
        setMessages([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // If seller, fetch seller data
      if (profileData.role === 'seller') {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        setSeller(sellerData);
        
        // Fetch seller's products
        await fetchProducts();
      } else {
        // Fetch cart for buyers
        await fetchCart();
      }

      // Fetch orders and messages for all users
      await fetchOrders();
      await fetchMessages();
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const createSellerProfile = async (storeData: Partial<Seller>) => {
    if (!user) return { error: new Error('No user logged in') };

    // Update role to seller
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'seller' })
      .eq('id', user.id);

    if (profileError) return { error: profileError };

    // Create seller profile
    const { data, error } = await supabase
      .from('sellers')
      .insert({
        user_id: user.id,
        ...storeData
      })
      .select()
      .single();

    if (!error) {
      setSeller(data);
      if (profile) {
        setProfile({ ...profile, role: 'seller' });
      }
    }

    return { error };
  };

  const updateSellerProfile = async (updates: Partial<Seller>) => {
    if (!user || !seller) return { error: new Error('No seller profile found') };

    const { error } = await supabase
      .from('sellers')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setSeller({ ...seller, ...updates });
    }

    return { error };
  };

  const switchToNormalUser = async () => {
    if (!user) return { error: new Error('No user logged in') };

    // Update role to buyer
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'buyer' })
      .eq('id', user.id);

    if (profileError) return { error: profileError };

    // Delete seller profile
    const { error: sellerError } = await supabase
      .from('sellers')
      .delete()
      .eq('user_id', user.id);

    if (!sellerError) {
      setSeller(null);
      setProducts([]);
      if (profile) {
        setProfile({ ...profile, role: 'buyer' });
      }
      await fetchCart();
    }

    return { error: sellerError };
  };

  // Product functions
  const addProduct = async (productData: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        seller_id: user.id
      })
      .select()
      .single();

    if (!error) {
      setProducts(prev => [data, ...prev]);
    }

    return { error };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }

    return { error };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }

    return { error };
  };

  const fetchProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles!products_seller_id_fkey(
          *,
          sellers(*)
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  // Cart functions
  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          seller:profiles!products_seller_id_fkey(*)
        )
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setCartItems(data);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return { error: new Error('No user logged in') };

    // Check if item already exists
    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      return await updateCartQuantity(productId, existingItem.quantity + quantity);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity
      })
      .select(`
        *,
        product:products(
          *,
          seller:profiles!products_seller_id_fkey(*)
        )
      `)
      .single();

    if (!error && data) {
      setCartItems(prev => [...prev, data]);
    }

    return { error };
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return { error: new Error('No user logged in') };

    if (quantity <= 0) {
      return await removeFromCart(productId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setCartItems(prev => prev.map(item => 
        item.product_id === productId ? { ...item, quantity } : item
      ));
    }

    return { error };
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    }

    return { error };
  };

  const clearCart = async () => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setCartItems([]);
    }

    return { error };
  };

  // Order functions
  const createOrder = async (items: { productId: string; quantity: number }[], shippingAddress?: any) => {
    if (!user) return { error: new Error('No user logged in') };

    const orders = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId) || 
                     cartItems.find(ci => ci.product_id === item.productId)?.product;
      
      if (!product) continue;

      orders.push({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity,
        shipping_address: shippingAddress
      });
    }

    const { error } = await supabase
      .from('orders')
      .insert(orders);

    if (!error) {
      await fetchOrders();
      await clearCart();
    }

    return { error };
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*),
        buyer:profiles!orders_buyer_id_fkey(*),
        seller:profiles!orders_seller_id_fkey(*)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  // Message functions
  const sendMessage = async (toUserId: string, message: string, productId?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        message,
        product_id: productId,
        message_type: productId ? 'product_inquiry' : 'direct'
      });

    if (!error) {
      await fetchMessages();
    }

    return { error };
  };

  const fetchMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_user:profiles!messages_from_user_id_fkey(*),
        to_user:profiles!messages_to_user_id_fkey(*),
        product:products(*)
      `)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (!error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    }

    return { error };
  };

  const value = {
    user,
    profile,
    seller,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createSellerProfile,
    updateSellerProfile,
    switchToNormalUser,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    orders,
    createOrder,
    fetchOrders,
    messages,
    sendMessage,
    fetchMessages,
    markMessageAsRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
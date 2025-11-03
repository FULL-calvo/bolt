import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Types
export interface Profile {
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

export interface SellerData {
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

export interface ProductLike {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ProductComment {
  id: string;
  user_id: string;
  product_id: string;
  comment: string;
  created_at: string;
  profiles?: Profile;
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
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  sellerData: SellerData | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  becomeSeller: (storeData: { store_name: string; store_description: string }) => Promise<{ error: any }>;
  backToBuyer: () => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>;
  // Cart
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  // Likes and Comments
  productLikes: ProductLike[];
  productComments: ProductComment[];
  toggleLike: (productId: string) => Promise<{ error: any }>;
  addComment: (productId: string, comment: string) => Promise<{ error: any }>;
  fetchProductLikes: () => Promise<void>;
  fetchProductComments: (productId: string) => Promise<ProductComment[]>;
  // Messages
  messages: Message[];
  sendMessage: (toUserId: string, message: string, productId?: string) => Promise<{ error: any }>;
  fetchMessages: () => Promise<void>;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<{ error: any }>;
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
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productLikes, setProductLikes] = useState<ProductLike[]>([]);
  const [productComments, setProductComments] = useState<ProductComment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

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
        setSellerData(null);
        setCart([]);
        setProductLikes([]);
        setProductComments([]);
        setMessages([]);
        setWishlist([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setWishlist(profileData.wishlist || []);

      // If seller, fetch seller data
      if (profileData.role === 'seller') {
        const { data: sellerInfo } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        setSellerData(sellerInfo);
      }

      // Fetch user data
      await fetchProductLikes();
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

  const logout = async () => {
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

  const becomeSeller = async (storeData: { store_name: string; store_description: string }) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Update role to seller
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create seller profile
      const { data, error } = await supabase
        .from('sellers')
        .insert({
          user_id: user.id,
          store_name: storeData.store_name,
          store_description: storeData.store_description
        })
        .select()
        .single();

      if (error) throw error;

      setSellerData(data);
      if (profile) {
        setProfile({ ...profile, role: 'seller' });
      }

      return { error: null };
    } catch (error) {
      console.error('Error becoming seller:', error);
      return { error };
    }
  };

  const backToBuyer = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Update role to buyer
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'buyer' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete seller profile
      const { error: sellerError } = await supabase
        .from('sellers')
        .delete()
        .eq('user_id', user.id);

      if (sellerError) throw sellerError;

      setSellerData(null);
      if (profile) {
        setProfile({ ...profile, role: 'buyer' });
      }

      return { error: null };
    } catch (error) {
      console.error('Error switching to buyer:', error);
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (profile) {
        setProfile({ ...profile, profile_image: publicUrl });
      }

      return { error: null, url: publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { error };
    }
  };

  // Cart functions
  const addToCart = (productId: string, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product_id === productId);
    
    if (existingItem) {
      updateCartQuantity(productId, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        user_id: user?.id || '',
        product_id: productId,
        quantity,
        created_at: new Date().toISOString()
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  // Likes functions
  const fetchProductLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_likes')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setProductLikes(data);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const toggleLike = async (productId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const existingLike = productLikes.find(like => like.product_id === productId);

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (!error) {
          setProductLikes(prev => prev.filter(like => like.product_id !== productId));
        }
        return { error };
      } else {
        // Add like
        const { data, error } = await supabase
          .from('product_likes')
          .insert({
            user_id: user.id,
            product_id: productId
          })
          .select()
          .single();

        if (!error && data) {
          setProductLikes(prev => [...prev, data]);
        }
        return { error };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { error };
    }
  };

  // Comments functions
  const fetchProductComments = async (productId: string): Promise<ProductComment[]> => {
    try {
      const { data, error } = await supabase
        .from('product_comments')
        .select(`
          *,
          profiles (
            id,
            full_name,
            profile_image
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (productId: string, comment: string) => {
    if (!user) return { error: new Error('No user logged in') };

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
          profiles (
            id,
            full_name,
            profile_image
          )
        `)
        .single();

      if (!error && data) {
        setProductComments(prev => [data, ...prev]);
      }

      return { error };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { error };
    }
  };

  // Messages functions
  const sendMessage = async (toUserId: string, message: string, productId?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          message,
          product_id: productId,
          message_type: productId ? 'product_inquiry' : 'direct'
        })
        .select(`
          *,
          from_user:profiles!messages_from_user_id_fkey(*),
          to_user:profiles!messages_to_user_id_fkey(*)
        `)
        .single();

      if (!error && data) {
        setMessages(prev => [data, ...prev]);
      }

      return { error };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_user:profiles!messages_from_user_id_fkey(*),
          to_user:profiles!messages_to_user_id_fkey(*)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const isInWishlist = wishlist.includes(productId);
      let newWishlist: string[];

      if (isInWishlist) {
        // Remove from wishlist
        newWishlist = wishlist.filter(id => id !== productId);
        
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        // Add to wishlist
        newWishlist = [...wishlist, productId];
        
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: productId
          });
      }

      // Update profile wishlist
      const { error } = await supabase
        .from('profiles')
        .update({ wishlist: newWishlist })
        .eq('id', user.id);

      if (!error) {
        setWishlist(newWishlist);
        if (profile) {
          setProfile({ ...profile, wishlist: newWishlist });
        }
      }

      return { error };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    sellerData,
    session,
    loading,
    signUp,
    signIn,
    logout,
    updateProfile,
    becomeSeller,
    backToBuyer,
    uploadAvatar,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    productLikes,
    productComments,
    toggleLike,
    addComment,
    fetchProductLikes,
    fetchProductComments,
    messages,
    sendMessage,
    fetchMessages,
    wishlist,
    toggleWishlist
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
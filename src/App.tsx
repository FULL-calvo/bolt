import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { BottomNavigation } from './components/BottomNavigation';
import { DiscoverFeed } from './components/DiscoverFeed';
import { MessagesPage } from './components/MessagesPage';
import { CartPage } from './components/CartPage';
import { ProfilePage } from './components/ProfilePage';
import { CheckoutPage } from './components/CheckoutPage';
import { SellerProfile } from './components/SellerProfile';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { Footer } from './components/Footer';
import { Product, User } from './types';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user, profile, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  // Listen for profile click from header
  React.useEffect(() => {
    const handleOpenProfile = () => {
      if (user) {
        setActiveTab('profile');
      }
    };

    const handleOpenSellerProfile = (event: CustomEvent) => {
      setSelectedSeller(event.detail);
    };

    const handleStartSellerConversation = (event: CustomEvent) => {
      const seller = event.detail;
      // Add initial message to start conversation with seller
      if (user) {
        // Use a custom event to add message through AuthContext
        window.dispatchEvent(new CustomEvent('addDirectMessage', {
          detail: {
            from_user_id: user.id,
            to_user_id: seller.id,
            message: `Olá ${seller.store_name}! Tenho interesse nos seus produtos.`,
            read: false,
            type: 'direct'
          }
        }));
      }
      setActiveTab('messages');
    };

    window.addEventListener('openProfile', handleOpenProfile);
    window.addEventListener('openSellerProfile', handleOpenSellerProfile as EventListener);
    window.addEventListener('startSellerConversation', handleStartSellerConversation as EventListener);
    
    return () => {
      window.removeEventListener('openProfile', handleOpenProfile);
      window.removeEventListener('openSellerProfile', handleOpenSellerProfile as EventListener);
      window.removeEventListener('startSellerConversation', handleStartSellerConversation as EventListener);
    };
  }, [user]);

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setShowBuyModal(true);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    setShowCheckout(false);
    setActiveTab('home');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'profile' && !profile) {
      setShowLoginModal(true);
    }
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Show checkout page
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-white">
        <CheckoutPage 
          onBack={() => setShowCheckout(false)}
          onOrderComplete={handleOrderComplete}
        />
      </div>
    );
  }

  // Show seller profile
  if (selectedSeller) {
    return (
      <div className="min-h-screen bg-white">
        <SellerProfile 
          seller={selectedSeller}
          onBack={() => setSelectedSeller(null)}
          onProductClick={(product) => {
            setSelectedSeller(null);
            handleBuyNow(product);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        onLoginClick={() => setShowLoginModal(true)}
        onCartClick={() => setActiveTab('cart')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <main className="pt-16 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomePage onBuyNow={handleBuyNow} />
            </motion.div>
          )}
          
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen"
            >
              <DiscoverFeed 
                onBuyNow={handleBuyNow}
                onBack={() => setActiveTab('home')}
              />
            </motion.div>
          )}
          
          {activeTab === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen"
            >
              <CartPage 
                onBack={() => setActiveTab('home')}
                onCheckout={handleCheckout}
              />
            </motion.div>
          )}
          
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen"
            >
              <MessagesPage onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
          
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen"
            >
              <ProfilePage onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={switchToLogin}
      />

      {/* Buy Now Modal */}
      <AnimatePresence>
        {showBuyModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="bg-white rounded-t-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedProduct.title}</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowBuyModal(false);
                    setShowCheckout(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  Comprar Agora
                </button>
                <button className="w-full border border-purple-500 text-purple-500 font-semibold py-4 rounded-lg">
                  Adicionar ao Carrinho
                </button>
                <button 
                  onClick={() => setShowBuyModal(false)}
                  className="w-full text-gray-500 py-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart } = useAuth();

  // Get cart items with product details
  const cartItems = cart.map(cartItem => {
    const product = mockProducts.find(p => p.id === cartItem.product_id);
    return product ? { ...cartItem, product } : null;
  }).filter(Boolean);

  const updateQuantity = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item!.product.price * item!.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200 bg-white">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Meu Carrinho</h2>
        </div>
        
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Adicione alguns produtos incríveis ao seu carrinho!
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Continuar Comprando
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Meu Carrinho</h2>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pt-6"
        >
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no seu carrinho
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item!.product.thumbnail}
                    alt={item!.product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {item!.product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Vendido por {item!.product.seller?.store_name}
                    </p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatPrice(item!.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item!.product_id, item!.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold">
                      {item!.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item!.product_id, item!.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item!.product_id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Resumo do Pedido
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="font-semibold text-green-600">Grátis</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-purple-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Finalizar Compra
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Compra 100% segura e protegida
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, FileText, MapPin, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderComplete: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderComplete }) => {
  const { cart, user, addOrder } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const cartItems = cart.map(cartItem => {
    const product = mockProducts.find(p => p.id === cartItem.product_id);
    return product ? { ...cartItem, product } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item!.product.price * item!.quantity);
  }, 0);

  const shipping = 15.90;
  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: Smartphone, description: 'Pagamento instantâneo' },
    { id: 'card', name: 'Cartão de Crédito', icon: CreditCard, description: 'Até 12x sem juros' },
    { id: 'boleto', name: 'Boleto', icon: FileText, description: 'Vencimento em 3 dias' }
  ];

  const handleFinishOrder = async () => {
    setIsProcessing(true);
    
    // Simular processamento do pagamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add orders to user profile
    cartItems.forEach(item => {
      if (item) {
        addOrder({
          product_id: item.product.id,
          quantity: item.quantity,
          price_paid: item.product.price * item.quantity,
          status: 'processando'
        });
      }
    });
    
    setIsProcessing(false);
    setOrderComplete(true);
    
    // Após 3 segundos, mostrar que está a caminho
    setTimeout(() => {
      onOrderComplete();
    }, 3000);
  };

  if (orderComplete) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800 mb-4"
            >
              Pedido Confirmado! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-6"
            >
              Seu pedido foi processado com sucesso e já está sendo preparado para envio.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-blue-50 p-4 rounded-lg mb-6"
            >
              <p className="text-blue-800 font-semibold">📦 Entrega a caminho!</p>
              <p className="text-blue-600 text-sm mt-1">
                Estimativa: 2-3 dias úteis
              </p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Continuar Comprando
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Finalizar Compra</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Endereço de Entrega */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Endereço de Entrega</h3>
          </div>
          <div className="text-gray-600">
            <p className="font-medium">{user?.name}</p>
            <p>Rua das Flores, 123 - Apt 45</p>
            <p>São Paulo, SP - 01234-567</p>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Resumo do Pedido</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item!.product.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                <img
                  src={item!.product.thumbnail}
                  alt={item!.product.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item!.product.title}</h4>
                  <p className="text-gray-600 text-sm">Qtd: {item!.quantity}</p>
                </div>
                <p className="font-semibold text-purple-600">
                  {formatPrice(item!.product.price * item!.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Método de Pagamento */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Método de Pagamento</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                    selectedPayment === method.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    selectedPayment === method.id ? 'text-purple-600' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      selectedPayment === method.id ? 'text-purple-800' : 'text-gray-800'
                    }`}>
                      {method.name}
                    </p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPayment === method.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPayment === method.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer com Total e Botão */}
      <div className="border-t border-gray-200 p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frete:</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span className="text-purple-600">{formatPrice(total)}</span>
          </div>
        </div>
        
        <button
          onClick={handleFinishOrder}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processando...</span>
            </>
          ) : (
            <span>Finalizar Pedido - {formatPrice(total)}</span>
          )}
        </button>
      </div>
    </div>
  );
};
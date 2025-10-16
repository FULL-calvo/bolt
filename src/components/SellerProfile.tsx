import React from 'react';
import { ArrowLeft, Star, MapPin, Clock, Package, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, Product } from '../types';
import { mockProducts } from '../data/mockData';
import { ChatModal } from './ChatModal';

interface SellerProfileProps {
  seller: User;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({ 
  seller, 
  onBack, 
  onProductClick 
}) => {
  const [showChatModal, setShowChatModal] = React.useState(false);
  const sellerProducts = mockProducts.filter(p => p.seller?.id === seller.id);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const stats = [
    { label: 'Produtos', value: sellerProducts.length, icon: Package },
    { label: 'Avaliação', value: '4.8', icon: Star },
    { label: 'Vendas', value: '150+', icon: Clock }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* Profile Info */}
        <div className="absolute -bottom-16 left-4 right-4">
          <div className="flex items-end space-x-4">
            <img
              src={seller.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=8b5cf6&color=fff&size=120`}
              alt={seller.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <div className="flex-1 pb-2">
              <h1 className="text-xl font-bold text-gray-800">{seller.store_name}</h1>
              <p className="text-gray-600">@{seller.name.toLowerCase().replace(' ', '')}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.8 (127 avaliações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 px-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <Icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* About */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Sobre a Loja</h3>
          <p className="text-gray-600 leading-relaxed">
            {seller.store_description || seller.bio}
          </p>
          
          <div className="flex items-center space-x-2 mt-3 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">São Paulo, SP</span>
          </div>
        </div>

        {/* Contact Button */}
        <button 
          onClick={() => setShowChatModal(true)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Conversar com Vendedor</span>
        </button>

        {/* Products */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Produtos ({sellerProducts.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {sellerProducts.map((product) => (
              <motion.button
                key={product.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onProductClick(product)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                    {product.title}
                  </h4>
                  <p className="text-purple-600 font-bold">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{product.likes} curtidas</span>
                    <span>{product.stock} em estoque</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        seller={seller}
      />
    </div>
  );
};
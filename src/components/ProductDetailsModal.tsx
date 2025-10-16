import React, { useState } from 'react';
import { X, Heart, ShoppingCart, Share2, Star, Truck, Shield, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ShareModal } from './ShareModal';
import { VideoFeed } from './VideoFeed';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onBuyNow
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart, user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatOriginalPrice = (price: number) => {
    const originalPrice = price * 1.3;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(originalPrice);
  };

  const getInstallmentPrice = (price: number) => {
    const installmentPrice = price / 12;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(installmentPrice);
  };

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleViewMore = () => {
    setShowVideoFeed(true);
  };

  if (showVideoFeed) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={() => setShowVideoFeed(false)}
          className="absolute top-4 left-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <VideoFeed onBuyNow={onBuyNow} />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Detalhes do Produto</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleLike}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                      />
                    </button>
                  </div>
                  
                  {/* View More Button */}
                  <button
                    onClick={handleViewMore}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
                  >
                    <ArrowDown className="w-5 h-5" />
                    <span>Ver mais produtos similares</span>
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(127 avaliações)</span>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 line-through">
                          {formatOriginalPrice(product.price)}
                        </span>
                        <span className="text-sm text-green-600 font-semibold">
                          23% OFF
                        </span>
                      </div>
                      
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>

                      <div className="text-green-600 font-medium">
                        12x {getInstallmentPrice(product.price)} sem juros
                      </div>
                    </div>

                    {/* Free Shipping */}
                    <div className="flex items-center space-x-2 text-green-600 mt-4">
                      <Truck className="w-5 h-5" />
                      <span className="font-medium">Frete grátis</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Seller Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Vendido por</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.seller?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller?.name || '')}&background=8b5cf6&color=fff`}
                        alt={product.seller?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            onClose();
                            window.dispatchEvent(new CustomEvent('openSellerProfile', { detail: product.seller }));
                          }}
                          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline text-left"
                        >
                          {product.seller?.store_name}
                        </button>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.8 (89 vendas)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Estoque disponível: {product.stock} unidades</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Adicionar ao Carrinho</span>
                </button>
                <button
                  onClick={() => onBuyNow(product)}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Comprar Agora
                </button>
              </div>
            </div>

            {/* Share Modal */}
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              product={product}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
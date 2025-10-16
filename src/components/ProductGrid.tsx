import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onProductClick, 
  onBuyNow 
}) => {
  const { addToCart, toggleWishlist, user } = useAuth();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getInstallmentPrice = (price: number) => {
    const installmentPrice = price / 12;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(installmentPrice);
  };

  const handleLike = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedProducts = new Set(likedProducts);
    if (likedProducts.has(productId)) {
      newLikedProducts.delete(productId);
    } else {
      newLikedProducts.add(productId);
    }
    setLikedProducts(newLikedProducts);
    toggleWishlist(productId);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {products.map((product, index) => {
        const isLiked = likedProducts.has(product.id);

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onProductClick(product)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Wishlist Button */}
              <button
                onClick={(e) => handleLike(product.id, e)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Heart 
                  className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-3 space-y-2">
              {/* Title */}
              <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
                {product.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">(127)</span>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>

                <div className="text-xs text-green-600">
                  12x {getInstallmentPrice(product.price)} sem juros
                </div>
              </div>


              {/* Seller Info */}
              <div className="text-xs text-gray-500">
                por <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('openSellerProfile', { detail: product.seller }));
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {product.seller?.store_name}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Carrinho</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyNow(product);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Comprar
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
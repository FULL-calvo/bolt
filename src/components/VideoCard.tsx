import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, ShoppingCart, Share2, Play, Pause } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface VideoCardProps {
  product: Product;
  isActive: boolean;
  onBuyNow: (product: Product) => void;
  onLike: (productId: string) => void;
  onComment: (productId: string) => void;
  onShare: (productId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  product,
  isActive,
  onBuyNow,
  onLike,
  onComment,
  onShare
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addToCart, productLikes, updateProductLikes, productComments } = useAuth();

  const currentLikes = product.likes + (productLikes[product.id] || 0);
  const currentComments = product.comments + (productComments[product.id] || 0);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        setIsPlaying(true);
        videoRef.current.play();
      } else {
        setIsPlaying(false);
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    setShowControls(true);
    
    if (videoRef.current) {
      if (newPlayingState) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    updateProductLikes(product.id, newLikedState);
    onLike(product.id);
  };

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlay();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Video */}
      <div className="relative w-full max-w-sm h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={product.thumbnail}
          loop
          muted
          playsInline
          onClick={handleVideoClick}
          style={{ aspectRatio: '9/16' }}
        >
          <source src={product.video_url} type="video/mp4" />
        </video>

        {/* Play/Pause Overlay */}
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={handleVideoClick}
          >
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-black bg-opacity-50 rounded-full p-4"
              >
                <Play className="w-12 h-12 text-white" fill="white" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-3">
              <div className="flex items-center mb-2">
                <img
                  src={product.seller?.profile_image}
                  alt={product.seller?.name}
                  className="w-8 h-8 rounded-full mr-2 border-2 border-white"
                />
                <div>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openSellerProfile', { detail: product.seller }))}
                    className="text-white font-semibold hover:text-purple-200 transition-colors text-left text-sm"
                  >
                    {product.seller?.store_name}
                  </button>
                  <p className="text-gray-300 text-xs">@{product.seller?.name.toLowerCase().replace(' ', '')}</p>
                </div>
              </div>
              
              <h3 className="text-white text-lg font-bold mb-1 line-clamp-2">{product.title}</h3>
              <p className="text-gray-200 text-xs mb-2 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <span className="text-xl font-bold text-purple-400">{formatPrice(product.price)}</span>
                  <span className="text-xs text-gray-300 ml-2">Estoque: {product.stock}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center space-y-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex flex-col items-center"
              >
                <div className={`p-2 rounded-full ${isLiked ? 'bg-red-500' : 'bg-black bg-opacity-50'}`}>
                  <Heart 
                    className={`w-5 h-5 ${isLiked ? 'text-white' : 'text-white'}`} 
                    fill={isLiked ? 'white' : 'none'}
                  />
                </div>
                <span className="text-white text-xs mt-1">{currentLikes}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onComment(product.id)}
                className="flex flex-col items-center"
              >
                <div className="p-2 rounded-full bg-black bg-opacity-50">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{currentComments}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
                onClick={() => onShare(product.id)}
              >
                <div className="p-2 rounded-full bg-black bg-opacity-50">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
              </motion.button>
            </div>
          </div>

          {/* Buy Now Buttons */}
          <div className="flex space-x-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product.id)}
              className="flex-1 border-2 border-white text-white font-bold py-2 px-3 rounded-full flex items-center justify-center space-x-1 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Carrinho</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onBuyNow(product)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 px-3 rounded-full flex items-center justify-center space-x-1 shadow-lg text-sm"
            >
              <span>Comprar</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
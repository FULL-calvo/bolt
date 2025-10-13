import React, { useState, useEffect, useRef } from 'react';
import { VideoCard } from './VideoCard';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { Product } from '../types';
import { mockProducts } from '../data/mockData';

interface VideoFeedProps {
  onBuyNow: (product: Product) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ onBuyNow }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts.slice(0, 20));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadedCount, setLoadedCount] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLike = (productId: string) => {
    // Like functionality is now handled in VideoCard component
    // This can be used for analytics or API calls
  };

  const handleComment = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowCommentsModal(true);
    }
  };

  const handleShare = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowShareModal(true);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);
      setCurrentIndex(newIndex);
      
      // Load more products when near the end
      if (newIndex >= products.length - 3 && loadedCount < mockProducts.length) {
        const nextBatch = mockProducts.slice(loadedCount, loadedCount + 10);
        setProducts(prev => [...prev, ...nextBatch]);
        setLoadedCount(prev => prev + 10);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [products.length, loadedCount]);

  return (
    <>
      <div 
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {products.map((product, index) => (
          <div key={product.id} className="snap-start h-screen flex items-center justify-center">
            <VideoCard
              product={product}
              isActive={index === currentIndex}
              onBuyNow={onBuyNow}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          </div>
        ))}
      </div>
      
      {/* Modals */}
      {selectedProduct && (
        <>
          <CommentsModal
            isOpen={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
            product={selectedProduct}
          />
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            product={selectedProduct}
          />
        </>
      )}
    </>
  );
};
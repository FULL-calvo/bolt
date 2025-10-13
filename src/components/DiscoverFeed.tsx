import React, { useState, useEffect, useRef } from 'react';
import { VideoCard } from './VideoCard';
import { VideoFeed } from './VideoFeed';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { Product } from '../types';
import { mockProducts } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

interface DiscoverFeedProps {
  onBuyNow: (product: Product) => void;
  onBack: () => void;
}

export const DiscoverFeed: React.FC<DiscoverFeedProps> = ({ onBuyNow, onBack }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts.slice(0, 20));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadedCount, setLoadedCount] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLike = (productId: string) => {
    // Like functionality is handled in VideoCard component
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
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Header with back button */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <button
          onClick={onBack}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Feed Container */}
      <VideoFeed onBuyNow={onBuyNow} />
      
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
    </div>
  );
};
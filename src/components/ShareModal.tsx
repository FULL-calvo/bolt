import React, { useState } from 'react';
import { X, Copy, Share2, MessageCircle, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [copied, setCopied] = useState(false);
  
  const productUrl = `${window.location.origin}/product/${product.id}`;
  const shareText = `Confira este produto incrível: ${product.title} por apenas ${formatPrice(product.price)}!`;

  function formatPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      action: handleWhatsAppShare
    },
    {
      id: 'copy',
      name: copied ? 'Copiado!' : 'Copiar Link',
      icon: copied ? Copy : Link,
      color: copied ? 'bg-green-500' : 'bg-gray-500',
      action: handleCopyLink
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white rounded-t-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Share2 className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Compartilhar</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Product Preview */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 line-clamp-2">{product.title}</h4>
                <p className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={option.action}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`p-3 rounded-full ${option.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{option.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* URL Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Link do produto:</p>
              <p className="text-sm text-gray-800 break-all">{productUrl}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
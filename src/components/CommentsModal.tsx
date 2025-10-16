import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [newComment, setNewComment] = useState('');
  const { user, comments, addComment, addMessage, productComments, updateProductComments } = useAuth();
  
  const filteredCommentsForProduct = comments.filter(c => c.product_id === product.id);
  const currentCommentCount = product.comments + (productComments[product.id] || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    // Adicionar comentário
    addComment({
      user_id: user.id,
      product_id: product.id,
      message: newComment.trim(),
      read: false
    });


    // Update comment count
    updateProductComments(product.id, true);

    setNewComment('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

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
            className="bg-white rounded-t-2xl w-full max-w-md h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Comentários</h3>
                  <p className="text-sm text-gray-500">{currentCommentCount} comentários</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredCommentsForProduct.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Seja o primeiro a comentar!</p>
                </div>
              ) : (
                filteredCommentsForProduct.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=8b5cf6&color=fff`}
                      alt={comment.user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <p className="font-medium text-sm text-gray-800">
                          {comment.user?.name || 'Usuário'}
                        </p>
                        <p className="text-gray-700">{comment.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-4">
                        {formatTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {user ? (
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      autoFocus
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-gray-500">Faça login para comentar</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
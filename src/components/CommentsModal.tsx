import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  comments?: any[];
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  productId,
  comments = []
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setNewComment('');
      onClose();
    }
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
            className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Coment�rios</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum coment�rio ainda</p>
                  <p className="text-sm text-gray-400 mt-2">Seja o primeiro a comentar!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <img
                        src={comment.user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}`}
                        alt={comment.user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{comment.user?.name}</p>
                        <p className="text-gray-700">{comment.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um coment�rio..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

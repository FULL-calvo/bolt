import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User, Message } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: User;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  seller
}) => {
  const [newMessage, setNewMessage] = useState('');
  const { user, messages, addMessage } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this conversation
  const conversationMessages = messages.filter(message => 
    message.type === 'direct' && (
      (message.from_user_id === user?.id && message.to_user_id === seller.id) ||
      (message.from_user_id === seller.id && message.to_user_id === user?.id)
    )
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    addMessage({
      from_user_id: user.id,
      to_user_id: seller.id,
      message: newMessage.trim(),
      read: false,
      type: 'direct'
    });

    setNewMessage('');
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={seller.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=8b5cf6&color=fff`}
                  alt={seller.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{seller.store_name}</h3>
                  <p className="text-sm text-gray-500">@{seller.name.toLowerCase().replace(' ', '')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Inicie uma conversa!</p>
                </div>
              ) : (
                conversationMessages.map((message) => {
                  const isFromMe = message.from_user_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isFromMe 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${isFromMe ? 'text-purple-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {user ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-gray-500">Faça login para conversar</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import { Message } from '../types';

interface MessagesPageProps {
  onBack: () => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ onBack }) => {
  const { user, messages, addMessage } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Listen for new conversation events
  useEffect(() => {
    const handleStartConversation = (event: CustomEvent) => {
      const { sellerId } = event.detail;
      
      // Add initial message to start conversation
      addMessage({
        from_user_id: user?.id || '',
        to_user_id: sellerId,
        message: 'Olá! Tenho interesse nos seus produtos.',
        read: false,
        type: 'direct'
      });
      
      // Select the conversation
      setSelectedConversation(sellerId);
    };

    window.addEventListener('startConversation', handleStartConversation as EventListener);
    return () => window.removeEventListener('startConversation', handleStartConversation as EventListener);
  }, [user, addMessage]);

  // Agrupar mensagens por conversa
  const conversations = messages.filter(message => message.type === 'direct').reduce((acc, message) => {
    const otherUserId = message.from_user_id === user?.id ? message.to_user_id : message.from_user_id;
    if (!otherUserId) return acc;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  // Filtrar conversas por termo de busca
  const filteredConversations = Object.entries(conversations).filter(([userId, msgs]) => {
    const lastMessage = msgs[msgs.length - 1];
    return lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    addMessage({
      from_user_id: user.id,
      to_user_id: selectedConversation,
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

  const getUserName = (userId: string) => {
    const seller = mockUsers.find(u => u.id === userId);
    return seller?.store_name || seller?.name || 'Usuário';
  };

  const getUserAvatar = (userId: string) => {
    const seller = mockUsers.find(u => u.id === userId);
    return seller?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName(userId))}&background=8b5cf6&color=fff`;
  };

  if (selectedConversation) {
    const conversationMessages = conversations[selectedConversation] || [];
    
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header da Conversa */}
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img
            src={getUserAvatar(selectedConversation)}
            alt={getUserName(selectedConversation)}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{getUserName(selectedConversation)}</h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationMessages.map((message) => {
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
          })}
        </div>

        {/* Input de Mensagem */}
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
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <MessageCircle className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Mensagens</h2>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma conversa ainda</h3>
            <p className="text-gray-500">Suas mensagens aparecerão aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map(([userId, msgs]) => {
              const lastMessage = msgs[msgs.length - 1];
              const unreadCount = msgs.filter(m => !m.read && m.from_user_id !== user?.id).length;
              
              return (
                <motion.button
                  key={userId}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedConversation(userId)}
                  className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="relative">
                    <img
                      src={getUserAvatar(userId)}
                      alt={getUserName(userId)}
                      className="w-12 h-12 rounded-full"
                    />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{getUserName(userId)}</h3>
                      <span className="text-xs text-gray-500">{formatTime(lastMessage.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{lastMessage.message}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
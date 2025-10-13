import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProducts, mockUsers } from '../data/mockData';
import { Product, User as UserType } from '../types';

interface SearchPageProps {
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onSellerClick: (seller: UserType) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ 
  onBack, 
  onProductClick, 
  onSellerClick 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'sellers'>('products');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return mockProducts;
    
    return mockProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller?.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Filter sellers based on search term
  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return mockUsers.filter(user => user.role === 'seller');
    
    return mockUsers.filter(user =>
      user.role === 'seller' && (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.store_description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos, lojas..."
            autoFocus
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Produtos ({filteredProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
            activeTab === 'sellers'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Lojas ({filteredSellers.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'products' ? (
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente usar outras palavras-chave' : 'Encontre produtos incríveis'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product, index) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onProductClick(product)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow text-left"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                        {product.title}
                      </h4>
                      <p className="text-purple-600 font-bold mb-2">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {product.seller?.store_name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{product.likes} curtidas</span>
                        <span>{product.stock} em estoque</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSellers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'Nenhuma loja encontrada' : 'Digite para buscar lojas'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente usar outras palavras-chave' : 'Encontre lojas incríveis'}
                </p>
              </div>
            ) : (
              filteredSellers.map((seller, index) => (
                <motion.button
                  key={seller.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSellerClick(seller)}
                  className="w-full flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <img
                    src={seller.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=8b5cf6&color=fff`}
                    alt={seller.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {seller.store_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      @{seller.name.toLowerCase().replace(' ', '')}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {seller.store_description || seller.bio}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">
                      {mockProducts.filter(p => p.seller?.id === seller.id).length} produtos
                    </p>
                    <p className="text-xs text-gray-500">4.8 ⭐</p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
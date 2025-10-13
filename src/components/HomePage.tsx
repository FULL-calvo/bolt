import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductGrid } from './ProductGrid';
import { ProductDetailsModal } from './ProductDetailsModal';
import { mockProducts } from '../data/mockData';
import { Product } from '../types';

interface HomePageProps {
  onBuyNow: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onBuyNow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Todas as categorias' },
    { id: 'eletrônicos', name: 'Eletrônicos' },
    { id: 'moda', name: 'Moda' },
    { id: 'casa', name: 'Casa e Decoração' },
    { id: 'esportes', name: 'Esportes' },
    { id: 'beleza', name: 'Beleza' }
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Mais relevantes' },
    { id: 'price_low', name: 'Menor preço' },
    { id: 'price_high', name: 'Maior preço' },
    { id: 'newest', name: 'Mais recentes' },
    { id: 'best_seller', name: 'Mais vendidos' }
  ];

  // Filter and sort products
  const filteredProducts = mockProducts
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
        case 'best_seller':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredProducts.length} produtos encontrados
            {selectedCategory !== 'all' && (
              <span> em {categories.find(c => c.id === selectedCategory)?.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto">
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou usar outros termos de busca
            </p>
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            onProductClick={handleProductClick}
            onBuyNow={onBuyNow}
          />
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <ProductDetailsModal
            isOpen={showProductModal}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onBuyNow={onBuyNow}
          />
        )}
      </div>
    </div>
  );
};
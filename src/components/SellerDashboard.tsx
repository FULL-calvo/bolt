import React, { useState } from 'react';
import { ArrowLeft, Package, ShoppingBag, TrendingUp, Users, Plus, CreditCard as Edit3, Trash2, Eye, MessageCircle, UserMinus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { EditStoreModal } from './EditStoreModal';
import { Product } from '../types';

interface SellerDashboardProps {
  onBack: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onBack }) => {
  const { user, profile, seller, products, switchToNormalUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'store'>('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showEditStore, setShowEditStore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshProducts, setRefreshProducts] = useState(0);

  const handleBackToNormalUser = () => {
    if (confirm('Tem certeza que deseja voltar para uma conta de usuário normal? Você perderá acesso ao painel de vendedor e todos os seus produtos serão removidos.')) {
      switchToNormalUser();
    }
  };
  
  // Check if this is a new seller (no products yet) or existing seller
  const isNewSeller = products.length === 0;
  
  // For new sellers, show zero stats. For existing sellers, show mock data
  const totalSales = isNewSeller ? 0 : 150;
  const totalRevenue = isNewSeller ? 0 : 15789.40;
  const pendingOrders = isNewSeller ? 0 : 8;
  const averageRating = isNewSeller ? 0 : 4.8;
  const totalReviews = isNewSeller ? 0 : 127;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const stats = [
    { label: 'Produtos', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Vendas', value: totalSales, icon: ShoppingBag, color: 'bg-green-500' },
    { label: 'Receita', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Pedidos Pendentes', value: pendingOrders, icon: Users, color: 'bg-orange-500' }
  ];

  // Show orders only for existing sellers
  const recentOrders = isNewSeller ? [] : [
    { id: 'o001', product: 'Fone Bluetooth XZ12', customer: 'Lucas Ferreira', status: 'pendente', value: 159.90, date: '2025-01-15' },
    { id: 'o002', product: 'Smartwatch MaxFit', customer: 'Ana Silva', status: 'enviado', value: 249.00, date: '2025-01-14' },
    { id: 'o003', product: 'Mouse Gamer RGB', customer: 'Pedro Santos', status: 'entregue', value: 119.90, date: '2025-01-13' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      // Implement delete logic here
      console.log('Deleting product:', productId);
    }
  };

  const handleProductAdded = () => {
    setRefreshProducts(prev => prev + 1);
  };
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'store', label: 'Loja', icon: Users }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{seller?.store_name}</h1>
              <p className="text-sm text-gray-600">Painel do Vendedor</p>
              {isNewSeller && (
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                  Conta Nova
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditStore(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Editar Loja"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={handleBackToNormalUser}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Voltar para Conta Normal"
            >
              <UserMinus className="w-5 h-5" />
            </button>
            <img
              src={profile?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || '')}&background=8b5cf6&color=fff`}
              alt={profile?.full_name}
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h3>
                  {!isNewSeller && (
                    <span className="text-sm text-gray-500">{recentOrders.length} pedidos</span>
                  )}
                </div>
              </div>
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-600 mb-2">Nenhum pedido ainda</h4>
                  <p className="text-sm text-gray-500">
                    {isNewSeller 
                      ? 'Adicione produtos para começar a receber pedidos!'
                      : 'Seus pedidos aparecerão aqui'
                    }
                  </p>
                  {isNewSeller && (
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      Adicionar Primeiro Produto
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{order.product}</h4>
                          <p className="text-sm text-gray-600">Cliente: {order.customer}</p>
                          <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatPrice(order.value)}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Chart for existing sellers */}
            {!isNewSeller && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance da Loja</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{totalSales}</p>
                    <p className="text-sm text-gray-600">Vendas Este Mês</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{formatPrice(totalRevenue)}</p>
                    <p className="text-sm text-gray-600">Receita Total</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Meus Produtos</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Produto</span>
              </button>
            </div>

            {mockProducts.filter(p => p.seller?.id === user?.id).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">Nenhum produto cadastrado</h4>
                <p className="text-gray-500 mb-6">
                  Comece adicionando seu primeiro produto para começar a vender!
                </p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  Adicionar Primeiro Produto
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {mockProducts.filter(p => p.seller?.id === user?.id).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{product.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</span>
                          <span className="text-sm text-gray-500">Estoque: {product.stock}</span>
                          <span className="text-sm text-gray-500">{product.likes} curtidas</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Pedidos Recebidos</h3>
            {recentOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">Nenhum pedido recebido</h4>
                <p className="text-gray-500">
                  {isNewSeller 
                    ? 'Adicione produtos para começar a receber pedidos!'
                    : 'Seus pedidos aparecerão aqui quando os clientes comprarem'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">Pedido #{order.id}</h4>
                          <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{order.product}</p>
                          <p className="text-sm text-gray-600">Cliente: {order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{formatPrice(order.value)}</p>
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Loja</h3>
              <div className="grid gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.store_name || '')}&background=8b5cf6&color=fff`}
                    alt={user?.store_name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{user?.store_name}</h4>
                    <p className="text-gray-600">{user?.store_description}</p>
                    {isNewSeller && (
                      <span className="inline-block mt-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        Loja Nova - Sem Avaliações
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium text-gray-800">{user?.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600">Ativa</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas da Loja</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <p className="text-2xl font-bold text-purple-600">
                      {isNewSeller ? '0.0' : averageRating}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isNewSeller ? 'Sem Avaliações' : 'Avaliação Média'}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {isNewSeller ? '0' : totalReviews}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isNewSeller ? 'Nenhuma Avaliação' : 'Total de Avaliações'}
                  </p>
                </div>
              </div>
              
              {isNewSeller && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Dica:</strong> Adicione produtos e faça suas primeiras vendas para começar a receber avaliações!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onProductAdded={handleProductAdded}
      />

      <EditStoreModal
        isOpen={showEditStore}
        onClose={() => setShowEditStore(false)}
      />

      {selectedProduct && (
        <EditProductModal
          isOpen={showEditProduct}
          onClose={() => {
            setShowEditProduct(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};
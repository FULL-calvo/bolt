import React, { useState } from 'react';
import { User, CreditCard as Edit3, Save, X, Camera, ArrowLeft, Heart, ShoppingBag, Package, Store, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';
import { BecomeSellerModal } from './BecomeSellerModal';
import { SellerDashboard } from './SellerDashboard';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, profile, updateProfile, uploadAvatar, wishlist } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'wishlist'>('profile');
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || ''
  });

  const wishlistProducts = mockProducts.filter(p => wishlist?.includes(p.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const { error } = await uploadAvatar(file);
    
    if (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    }
    
    setUploadingAvatar(false);
  };

  // If user is a seller, show seller dashboard
  if (profile?.role === 'seller') {
    return <SellerDashboard onBack={onBack} />;
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Faça login</h3>
          <p className="text-gray-500">Entre na sua conta para ver seu perfil</p>
        </div>
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
          <User className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Perfil</h2>
        </div>
        <button
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=8b5cf6&color=fff&size=120`}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full mx-auto"
              />
              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors cursor-pointer flex items-center justify-center"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
              )}
            </div>
            {!isEditing && (
              <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-800">{profile.full_name}</h3>
                <p className="text-gray-600">{profile.email}</p>
                {profile.role === 'seller' && (
                  <span className="inline-block mt-2 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    Vendedor
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{profile.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                  {profile.phone || 'Não informado'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 min-h-[80px]">
                  {profile.bio || 'Nenhuma bio adicionada'}
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Salvar Alterações</span>
            </motion.button>
          )}

          {/* Additional Info */}
          {!isEditing && (
            <div className="pt-6 border-t border-gray-200">
              {/* Become Seller Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBecomeSellerModal(true)}
                className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2"
              >
                <Store className="w-5 h-5" />
                <span>Mudar para Perfil Profissional</span>
              </motion.button>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <button
                  onClick={() => setActiveSection('orders')}
                  className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                >
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Compras</p>
                </button>
                <button
                  onClick={() => setActiveSection('wishlist')}
                  className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                >
                  <p className="text-2xl font-bold text-blue-600">{wishlistProducts.length}</p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </button>
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && !isEditing && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Minhas Compras</h3>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma compra realizada ainda</p>
              </div>
            </div>
          )}

          {/* Wishlist Section */}
          {activeSection === 'wishlist' && !isEditing && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Produtos Favoritos</h3>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum produto favoritado ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                          {product.title}
                        </h4>
                        <p className="text-purple-600 font-bold text-sm">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Become Seller Modal */}
      <BecomeSellerModal
        isOpen={showBecomeSellerModal}
        onClose={() => setShowBecomeSellerModal(false)}
      />
    </div>
  );
};
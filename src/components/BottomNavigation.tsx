import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const { user } = useAuth();

  // Only show profile tab on mobile
  const profileTab = { id: 'profile', icon: User, label: 'Perfil' };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === 'profile' 
              ? 'text-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-500'}`} />
          <span className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
            Perfil
          </span>
          {activeTab === 'profile' && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-1 w-1 h-1 bg-purple-600 rounded-full"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};
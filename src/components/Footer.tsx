import React from 'react';
import { ShoppingBag, Heart, Shield, Truck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Product Pit Stop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A plataforma de e-commerce com vídeos curtos que conecta compradores e vendedores de forma inovadora.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Feito com amor no Brasil</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Início</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Descobrir</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Categorias</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Vendedores</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Como Funciona</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Devolução</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-purple-500" />
                <span className="text-gray-400">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-purple-500" />
                <span className="text-gray-400">contato@productpitstop.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
                <span className="text-gray-400">São Paulo, SP<br />Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Compra Segura</h4>
                <p className="text-xs text-gray-400">Proteção total em todas as transações</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Frete Grátis</h4>
                <p className="text-xs text-gray-400">Em compras acima de R$ 99</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Suporte 24/7</h4>
                <p className="text-xs text-gray-400">Atendimento sempre disponível</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 Product Pit Stop. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Política de Cookies
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Acessibilidade
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Mapa do Site
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
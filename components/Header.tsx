"use client";

import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, Phone, Mail, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import CartDrawer from './CartDrawer';
import { AuthDrawer } from './AuthDrawer';
import { CheckoutDrawer } from './CheckoutDrawer';
import { useUI } from '@/contexts/UIContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, getTotalItems, getTotalPrice } = useCart();
  const { isCartOpen, openCart, closeCart, isAuthOpen, closeAuth, isCheckoutDrawerOpen, closeCheckoutDrawer } = useUI();
  const { user } = useAuth(); // Pega o usuário do contexto de autenticação

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Você saiu da sua conta.");
    } catch (error) {
      toast.error("Erro ao tentar sair da conta.");
      console.error("Erro no logout:", error);
    }
  };

  const menuItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Pulseiras', href: '#pulseiras' },
    { label: 'Combos', href: '#combos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Contato', href: '#contato' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* DIV DE CONTATO */}
        <div className="hidden md:block text-gray-300 text-sm py-3 px-10"> {/* Removido bg-black */}
          <div className="container mx-auto max-w-7xl flex justify-between items-center px-10">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 font-bold text-white">
                <Phone className="h-4 w-4" /> {/* Ícone de telefone */}
                <span>(99) 99999-9999</span>
              </span>
              <span className="flex items-center space-x-1 font-bold text-white">
                <Mail className="h-4 w-4" /> {/* Ícone de email */}
                <span>contato@happyjumpy.com</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 font-bold text-white">
              <MapPin className="h-4 w-4" /> {/* Ícone de localização */}
              <span>Rua Exemplo, 123 - São Paulo, SP</span> {/* Removido "Endereço:" para ficar mais limpo com o ícone */}
            </div>
          </div>
        </div>
        {/* DIV DO MENU PRINCIPAL */}
        <div className="px-4 py-2">
          <div className="container mx-auto max-w-7xl">
                        <div className={`bg-black/90 backdrop-blur-md border border-purple-500/30 px-8 py-5 ${isMenuOpen ? 'rounded-none shadow-none' : 'rounded-full shadow-2xl shadow-purple-500/20'} md:rounded-full md:shadow-2xl md:shadow-purple-500/20`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img src="/HappyJump-46.png" alt="Happy Jumpy Logo" className="h-12" />
                            </div>
            
                            <nav className="hidden md:flex items-center space-x-8">
                              {menuItems.map((item) => (
                                <button
                                  key={item.label}
                                  onClick={() => scrollToSection(item.href)}
                                  className="relative text-gray-300 hover:text-green-400 transition-colors duration-300 font-zain font-bold 
                                             after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-400
                                             after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                             hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                                >
                                  {item.label}
                                </button>
                              ))}
                            </nav>
            
                            <div className="flex items-center space-x-4">
                              <div
                                onClick={openCart}
                                className="relative flex items-center justify-center p-2 rounded-md cursor-pointer group"
                                aria-label="Abrir carrinho"
                              >
                                <ShoppingCart className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                                {getTotalItems() > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-4 border-black">
                                    {getTotalItems()}
                                  </span>
                                )}
                              </div>
                              
                              <div className="hidden md:block">
                                {user && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="relative bg-transparent hover:bg-transparent p-0">
                                        <User className="h-5 w-5 text-green-400 hover:text-green-300 transition-colors duration-200" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
                                        Sair
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
            
                              <Button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden bg-transparent hover:bg-transparent p-0"
                                size="icon"
                              >
                                {isMenuOpen ? <X className="w-5 h-5 text-green-400 hover:text-green-300 transition-colors duration-200" /> : <Menu className="w-5 h-5 text-green-400 hover:text-green-300 transition-colors duration-200" />}
                              </Button>
                            </div>
                          </div>
            
                          {isMenuOpen && (
                            <nav className="md:hidden mt-4 pt-4 border-t border-purple-500/30 flex flex-col space-y-3">
                              {menuItems.map((item) => (
                                <button
                                  key={item.label}
                                  onClick={() => scrollToSection(item.href)}
                                  className="relative text-gray-300 hover:text-green-400 transition-colors duration-300 font-zain font-bold text-left
                                             after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-400
                                             after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                             hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                                >
                                  {item.label}
                                </button>
                              ))}

                              <div className="border-t border-purple-500/30 mt-4 pt-4">
                                <span className="flex items-center space-x-2 text-gray-300 px-2 py-1">
                                  <Phone className="h-4 w-4" />
                                  <span>(99) 99999-9999</span>
                                </span>
                                <span className="flex items-center space-x-2 text-gray-300 px-2 py-1">
                                  <Mail className="h-4 w-4" />
                                  <span>contato@happyjumpy.com</span>
                                </span>
                                <span className="flex items-center space-x-2 text-gray-300 px-2 py-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>Rua Exemplo, 123 - São Paulo, SP</span>
                                </span>
                              </div>
            
                              {user && (
                                <>
                                  <div className="border-t border-purple-500/30 mt-4 pt-4">
                                    <span className="text-gray-300 font-bold text-left px-2 py-2 block">
                                      Minha Conta
                                    </span>
                                  </div>
                                  <span className="text-gray-300 font-light text-left px-2 py-2">
                                    {user.email}
                                  </span>
                                  <button
                                    onClick={() => {
                                      handleLogout();
                                      setIsMenuOpen(false); // Fecha o menu hambúrguer após o logout
                                    }}
                                    className="relative text-red-400 hover:text-red-300 transition-colors duration-300 font-zain font-bold text-left
                                             after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-400
                                             after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                             hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                                  >
                                    Sair
                                  </button>
                                </>
                              )}
            
                              {!user && (
                                <button
                                  onClick={() => {
                                    openAuth(); // Chama a função para abrir o AuthDrawer
                                    setIsMenuOpen(false); // Fecha o menu hambúrguer
                                  }}
                                  className="relative text-green-400 hover:text-green-300 transition-colors duration-300 font-zain font-bold text-left
                                             after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-400
                                             after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                             hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                                >
                                  Entrar
                                </button>
                              )}
                            </nav>
                          )}            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <AuthDrawer isOpen={isAuthOpen} onOpenChange={closeAuth} onLoginSuccess={closeAuth} />
      <CheckoutDrawer 
        isOpen={isCheckoutDrawerOpen} 
        onOpenChange={closeCheckoutDrawer}
        cart={cart}
        totalValue={getTotalPrice()}
      />
    </>
  );
};

export default Header;

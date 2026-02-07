"use client";

import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
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
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-black/90 backdrop-blur-md border border-purple-500/30 rounded-full shadow-2xl shadow-purple-500/20 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/HappyJump-46.png" alt="Happy Jumpy Logo" className="h-12" />
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={openCart}
                  variant="neonGreen"
                  size="icon"
                  className="relative"
                  aria-label="Abrir carrinho"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="neonGreen" size="icon" className="relative">
                        <User className="h-5 w-5" />
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

                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden bg-purple-600 hover:bg-purple-700"
                  size="icon"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {isMenuOpen && (
              <nav className="md:hidden mt-4 pt-4 border-t border-purple-500/30 flex flex-col space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
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

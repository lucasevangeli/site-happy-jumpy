"use client";

import React, { useState } from 'react';
import { ShoppingCart, Menu, X, User, Phone, Mail, MapPin, Ticket, ChevronDown } from 'lucide-react'; 
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import CartDrawer from './CartDrawer';
import { AuthDrawer } from './AuthDrawer';
import { CheckoutDrawer } from './CheckoutDrawer';
import { TicketDrawer } from './TicketDrawer'; // Adicionado
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


import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, getTotalItems, getTotalPrice } = useCart();
  const {
    isCartOpen, openCart, closeCart,
    isAuthOpen, closeAuth,
    isCheckoutDrawerOpen, closeCheckoutDrawer,
    openAuth,
    isTicketDrawerOpen, openTicketDrawer, closeTicketDrawer // Adicionado
  } = useUI();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

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
    { label: 'Início', href: '/', isAnchor: true, color: '#CB2185' },
    { 
      label: 'O Parque', 
      href: '/parque', 
      color: '#DC822F',
      children: [
        { label: 'Sobre Nós', href: '/sobre-nos' },
        { label: 'Atrações', href: '/atracoes' },
        { label: 'Regras', href: '/regras' },
        { label: 'Dúvidas', href: '/duvidas' },
      ]
    },
    { label: 'Tickets', href: '/tickets', isAnchor: false, color: '#C4D648' },
    { label: 'Combos', href: '#combos', isAnchor: true, color: '#E60A7E' },
    { label: 'Galeria', href: '#galeria', isAnchor: true, color: '#00D4FF' },
    { label: 'Contato', href: '#contato', isAnchor: true, color: '#FFFF00' },
  ];

  const navigateTo = (href: string, isAnchor?: boolean) => {
    if (isAnchor) {
      if (isHome) {
        if (href === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          scrollToSection(href);
        }
      } else {
        router.push('/' + (href === '/' ? '' : href));
      }
    } else {
      router.push(href);
      setIsMenuOpen(false);
    }
  };

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
        <div className="hidden md:block text-sm py-3 px-10"> {/* Removido text-gray-300 */}
          <div className="container mx-auto max-w-7xl flex justify-between items-center px-10">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 font-bold text-[#DC822F]">
                <Phone className="h-4 w-4" /> {/* Ícone de telefone */}
                <span>(99) 99999-9999</span>
              </span>
              <span className="flex items-center space-x-1 font-bold text-[#00D4FF]">
                <Mail className="h-4 w-4" /> {/* Ícone de email */}
                <span>contato@happyjumpy.com</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 font-bold text-[#C4D648]">
              <MapPin className="h-4 w-4" /> {/* Ícone de localização */}
              <span>Rua Exemplo, 123 - São Paulo, SP</span> {/* Removido "Endereço:" para ficar mais limpo com o ícone */}
            </div>
          </div>
        </div>
        {/* DIV DO MENU PRINCIPAL */}
        <div className="px-4 py-2">
          <div className="container mx-auto max-w-7xl">
            <div className={`bg-transparent backdrop-blur-md border-2 border-[#602BAF] px-8 py-5 ${isMenuOpen ? 'rounded-none shadow-none' : 'rounded-full shadow-2xl shadow-purple-500/20'} md:rounded-full md:shadow-2xl md:shadow-purple-500/20`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image 
                    src="/HappyJump-46.png" 
                    alt="Happy Jumpy Logo" 
                    width={180}
                    height={60}
                    priority
                    className="h-12 w-auto object-contain"
                  />
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                  {menuItems.map((item) => (
                    item.children ? (
                      <DropdownMenu key={item.label}>
                        <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-300 hover:text-[#DC822F] transition-colors duration-300 font-fredoka font-bold focus:outline-none group">
                          <span>{item.label}</span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-black/90 border-[#602BAF] backdrop-blur-md">
                          {item.children.map((child) => (
                            <DropdownMenuItem 
                              key={child.label}
                              onClick={() => navigateTo(child.href)}
                              className="text-gray-300 focus:text-[#DC822F] focus:bg-purple-500/10 cursor-pointer font-fredoka font-medium py-3 px-6"
                            >
                              {child.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => navigateTo(item.href, item.isAnchor)}
                        style={{ '--hover-color': item.color } as React.CSSProperties}
                        className="relative text-gray-300 hover:text-[var(--hover-color)] transition-colors duration-300 font-fredoka font-bold 
                                               after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-[var(--hover-color)]
                                               after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                               hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                      >
                        {item.label}
                      </button>
                    )
                  ))}
                </nav>

                <div className="flex items-center space-x-4">
                  <div
                    onClick={openCart}
                    className="relative flex items-center justify-center p-2 rounded-md cursor-pointer group hover:drop-shadow-[0_0_8px_#39FF14] transition-all duration-300"
                    aria-label="Abrir carrinho"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#39FF14] group-hover:brightness-125 transition-colors duration-200" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-4 border-black">
                        {getTotalItems()}
                      </span>
                    )}
                  </div>

                  {/* Ícone de Ingresso - Visível apenas se o usuário estiver logado */}
                  {user && (
                    <div
                      onClick={openTicketDrawer}
                      className="relative flex items-center justify-center p-2 rounded-md cursor-pointer group hover:drop-shadow-[0_0_8px_#FF6B00] transition-all duration-300"
                      aria-label="Meus Ingressos"
                    >
                      <Ticket className="w-5 h-5 text-[#FF6B00] group-hover:brightness-125 transition-colors duration-200" />
                    </div>
                  )}

                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative bg-transparent hover:bg-transparent p-0 group hover:drop-shadow-[0_0_8px_#8A2BE2] transition-all duration-300">
                          <User className="h-5 w-5 text-[#8A2BE2] group-hover:brightness-125 transition-colors duration-200" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {user ? (
                          <>
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
                              Sair
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={openAuth} className="cursor-pointer">
                            Entrar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden bg-transparent hover:bg-transparent p-0"
                    size="icon"
                  >
                    {isMenuOpen ? <X className="w-5 h-5 text-[#FF007F] hover:brightness-125 transition-colors duration-200" /> : <Menu className="w-5 h-5 text-[#FF007F] hover:brightness-125 transition-colors duration-200" />}
                  </Button>
                </div>
              </div>

              {isMenuOpen && (
                <nav className="md:hidden mt-4 pt-4 border-t border-purple-500/30 flex flex-col space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.label} className="flex flex-col space-y-2">
                      {item.children ? (
                        <>
                          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider px-2 pt-2">
                            {item.label}
                          </span>
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              onClick={() => navigateTo(child.href)}
                              className="relative text-gray-300 hover:text-green-400 transition-colors duration-300 font-fredoka font-bold text-left px-4 py-2"
                            >
                              {child.label}
                            </button>
                          ))}
                        </>
                      ) : (
                        <button
                          onClick={() => navigateTo(item.href, item.isAnchor)}
                          className="relative text-gray-300 hover:text-green-400 transition-colors duration-300 font-fredoka font-bold text-left
                                                 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-400
                                                 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                                                 hover:scale-[1.05] hover:-translate-y-1 transition-transform duration-200 ease-in-out"
                        >
                          {item.label}
                        </button>
                      )}
                    </div>
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
                        className="relative text-red-400 hover:text-red-300 transition-colors duration-300 font-fredoka font-normal text-left
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
                      className="relative text-green-400 hover:text-green-300 transition-colors duration-300 font-fredoka font-normal text-left
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
      <AuthDrawer isOpen={isAuthOpen} onOpenChange={closeAuth} />
      <CheckoutDrawer
        isOpen={isCheckoutDrawerOpen}
        onOpenChange={closeCheckoutDrawer}
        cart={cart}
        totalValue={getTotalPrice()}
      />
      <TicketDrawer isOpen={isTicketDrawerOpen} onOpenChange={closeTicketDrawer} />
    </>
  );
};

export default Header;

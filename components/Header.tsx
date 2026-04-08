"use client";

import React, { useState, useRef } from 'react';
import { 
  ShoppingCart, Menu, X, User, Phone, Mail, MapPin, Ticket, Clock, 
  ChevronDown, House, LayoutGrid, TicketSlash, Image as ImageIcon, MessageCircle 
} from 'lucide-react'; 
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CartDrawer from './CartDrawer';
import { AuthDrawer } from './AuthDrawer';
import { CheckoutDrawer } from './CheckoutDrawer';
import { TicketDrawer } from './TicketDrawer';
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

// Botão com Rastro que Percorre e Afina (Layered Comet Effect)
const GlowButton = ({ label, color, onClick, className }: { label: string, color: string, onClick: () => void, className?: string }) => {
  return (
    <motion.button
      initial="initial"
      whileHover="hover"
      onClick={onClick}
      className={`relative px-7 py-2.5 rounded-full border-2 border-white/10 font-fredoka font-black text-xs uppercase tracking-widest transition-all duration-300 group bg-transparent hover:scale-105 active:scale-95 ${className}`}
      style={{ color: color }}
    >
       {/* SVG para o Rastro que Percorre e Afina nas Pontas */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
         {/* 2 Rastro-Cometas em Pontos Diferentes */}
         {[0, 0.5].map((mainOffset, i) => (
           <React.Fragment key={i}>
             {/* Camada 3: Cauda (Mais Longa e Fina) */}
             <motion.rect
               x="0" y="0" width="100%" height="100%" rx="24"
               fill="transparent" stroke={color} strokeWidth="1" strokeLinecap="round"
               variants={{
                 initial: { pathLength: 0, opacity: 0, pathOffset: 0 },
                 hover: { 
                    pathLength: 0.18, opacity: 0.4, pathOffset: [0 + mainOffset, 1 + mainOffset],
                    transition: { pathOffset: { duration: 2, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.2 } }
                 }
               }}
             />
             {/* Camada 2: Meio (Média) */}
             <motion.rect
               x="0" y="0" width="100%" height="100%" rx="24"
               fill="transparent" stroke={color} strokeWidth="2" strokeLinecap="round"
               variants={{
                 initial: { pathLength: 0, opacity: 0, pathOffset: 0 },
                 hover: { 
                    pathLength: 0.1, opacity: 0.7, pathOffset: [0.03 + mainOffset, 1.03 + mainOffset],
                    transition: { pathOffset: { duration: 2, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.2 } }
                 }
               }}
             />
             {/* Camada 1: Cabeça (Curta e Grossa) */}
             <motion.rect
               x="0" y="0" width="100%" height="100%" rx="24"
               fill="transparent" stroke={color} strokeWidth="3" strokeLinecap="round"
               variants={{
                 initial: { pathLength: 0, opacity: 0, pathOffset: 0 },
                 hover: { 
                    pathLength: 0.05, opacity: 1, pathOffset: [0.06 + mainOffset, 1.06 + mainOffset],
                    transition: { pathOffset: { duration: 2, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.2 } }
                 }
               }}
             />
           </React.Fragment>
         ))}
       </svg>
       
       <span className="relative z-10">{label}</span>
    </motion.button>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  
  // Estado para múltiplos hovers (Rastro Visual Independente de 1s)
  const [activeHovers, setActiveHovers] = useState<number[]>([]);
  const timeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { cart, getTotalItems, getTotalPrice } = useCart();
  const {
    isCartOpen, openCart, closeCart,
    isAuthOpen, closeAuth,
    isCheckoutDrawerOpen, closeCheckoutDrawer,
    openAuth,
    isTicketDrawerOpen, openTicketDrawer, closeTicketDrawer
  } = useUI();
  const { user, profile, ticketCount } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };
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
    { label: 'Início', href: '/', isAnchor: true, color: '#CB2185', icon: <House size={18} /> },
    { 
      label: 'O Parque', 
      href: '/parque', 
      color: '#DC822F', 
      icon: <LayoutGrid size={18} />,
      children: [
        { label: 'Sobre Nós', href: '/sobre-nos' },
        { label: 'Atrações', href: '/atracoes' },
        { label: 'Regras', href: '/regras' },
        { label: 'Dúvidas', href: '/duvidas' },
      ]
    },
    { label: 'Tickets', href: '/tickets', isAnchor: false, color: '#C4D648', icon: <Ticket size={18} /> },
    { label: 'Contato', href: '#contato', isAnchor: true, color: '#FFFF00', icon: <MessageCircle size={18} /> },
  ];

  const handleMouseEnter = (index: number, hasChildren: boolean) => {
    if (timeoutsRef.current[index]) clearTimeout(timeoutsRef.current[index]);
    setActiveHovers(prev => prev.includes(index) ? prev : [...prev, index]);
    
    // Dropdown imediato ao entrar
    if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
    setOpenDropdownIndex(hasChildren ? index : null);
  };

  const handleMouseLeave = (index: number) => {
    // 1 SEGUNDO de persistência para o rastro "Ghosting"
    timeoutsRef.current[index] = setTimeout(() => {
      setActiveHovers(prev => prev.filter(i => i !== index));
    }, 1000);

    // Dropdown também espera 1 segundo para fechar
    dropTimeoutRef.current = setTimeout(() => {
      setOpenDropdownIndex(null);
    }, 1000); 
  };

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
        <div className="hidden md:block text-sm py-3 px-10">
          <div className="container mx-auto max-w-7xl flex justify-between items-center px-10">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1 font-bold text-[#DC822F]">
                <Phone className="h-4 w-4" />
                <span>(11) 99999-9999</span>
              </span>
              <span className="flex items-center space-x-1 font-bold text-[#00D4FF]">
                <Mail className="h-4 w-4" />
                <span>contato@happyjumpy.com</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 font-bold text-[#C4D648]">
              <MapPin className="h-4 w-4" />
              <span>Rua Exemplo, 123 - São Paulo, SP</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="container mx-auto max-w-7xl">
            <div className={`bg-black/60 backdrop-blur-xl border border-white/10 px-10 py-5 ${isMenuOpen ? 'rounded-none shadow-none' : 'rounded-full shadow-2xl shadow-black/20'} md:rounded-full md:shadow-2xl md:shadow-black/20 transition-all duration-500`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image 
                    src="/HappyJump-46.png" 
                    alt="Happy Jumpy Logo" 
                    width={180}
                    height={60}
                    priority
                    className="h-10 w-auto object-contain cursor-pointer"
                    onClick={() => router.push('/')}
                  />
                </div>

                <nav className="hidden md:flex items-center space-x-1 relative">
                  {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.isAnchor && pathname === '/' && activeIndex === index) || (item.children?.some(child => pathname === child.href));
                    const isHovered = activeHovers.includes(index);
                    const showLabel = isActive || isHovered;
                    
                    const buttonContent = (
                      <motion.div
                        onMouseEnter={() => handleMouseEnter(index, !!item.children)}
                        onMouseLeave={() => handleMouseLeave(index)}
                        initial={false}
                        animate={{
                          backgroundColor: isActive ? item.color : (isHovered ? `${item.color}33` : 'transparent'),
                          color: isActive ? '#fff' : (isHovered ? item.color : '#9ca3af')
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={`flex items-center gap-2.5 rounded-full transition-all duration-300 font-fredoka font-bold group cursor-pointer
                                   ${isActive ? 'px-6 py-2.5 shadow-lg' : (isHovered ? 'px-6 py-2.5' : 'p-3 hover:text-white')}`}
                      >
                         <span className={`transition-transform duration-300 ${isActive || isHovered ? 'scale-110' : 'group-hover:scale-110'}`}>
                           {item.icon}
                         </span>
                         
                         <AnimatePresence mode="popLayout" initial={false}>
                            {showLabel && (
                              <motion.span 
                                initial={{ width: 0, opacity: 0, x: -8 }}
                                animate={{ width: 'auto', opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: -12 }}
                                transition={{ 
                                  type: 'spring', 
                                  stiffness: 300, 
                                  damping: 25,
                                  exit: {
                                    type: 'tween',
                                    duration: item.children ? 0.1 : 0.5, 
                                    ease: "easeInOut"
                                  }
                                }}
                                className="overflow-hidden whitespace-nowrap text-sm tracking-wide flex items-center gap-1"
                              >
                                {item.label}
                                {item.children && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                              </motion.span>
                            )}
                         </AnimatePresence>
                      </motion.div>
                    );

                    if (item.children) {
                      return (
                        <DropdownMenu 
                          key={item.label} 
                          open={openDropdownIndex === index}
                          onOpenChange={(open) => !open && setOpenDropdownIndex(null)}
                        >
                          <DropdownMenuTrigger asChild>
                            {buttonContent}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="start" 
                            sideOffset={8}
                            className="bg-black/60 backdrop-blur-xl border-2 mt-2 p-2 rounded-2xl min-w-[200px] relative overflow-visible shadow-2xl"
                            style={{ borderColor: item.color }}
                            onMouseEnter={() => handleMouseEnter(index, true)}
                            onMouseLeave={() => handleMouseLeave(index)}
                          >
                             <div 
                                className="absolute -top-[7px] left-8 w-3.5 h-3.5 bg-black/60 border-l-2 border-t-2 rotate-45" 
                                style={{ borderColor: item.color }}
                             />
                             {item.children.map((child) => (
                               <DropdownMenuItem
                                 key={child.label}
                                 onClick={() => navigateTo(child.href)}
                                 className="text-gray-300 focus:text-white focus:bg-transparent cursor-pointer font-fredoka font-medium py-3 px-6 rounded-xl transition-all duration-300 group relative overflow-hidden"
                               >
                                 <div 
                                    className="absolute left-0 w-1 h-0 group-focus:h-1/2 bg-current top-1/2 -translate-y-1/2 transition-all duration-300 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                 />
                                 <span className="group-focus:translate-x-2 transition-transform duration-300">{child.label}</span>
                               </DropdownMenuItem>
                             ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setActiveIndex(index);
                          navigateTo(item.href, item.isAnchor);
                        }}
                        className="bg-transparent border-none p-0"
                      >
                        {buttonContent}
                      </button>
                    );
                  })}
                </nav>

                <div className="flex items-center space-x-4">
                   <div className="hidden lg:flex items-center space-x-4">
                     <GlowButton 
                        label="Comprar Ingresso" 
                        color="#39FF14" 
                        onClick={() => navigateTo('/tickets')}
                     />
                     <GlowButton 
                        label="Faça Sua Festa" 
                        color="#CB2185" 
                        onClick={() => navigateTo('#contato', true)}
                     />
                   </div>

                  <div className="md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative bg-transparent hover:bg-transparent p-0 group hover:drop-shadow-[0_0_10px_#8A2BE2] transition-all duration-300">
                          <div className="relative">
                            {user && profile?.fullName ? (
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#FF007F] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-200">
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                  {getInitials(profile.fullName)}
                                </span>
                              </div>
                            ) : (
                              <User className="h-6 w-6 text-[#8A2BE2] group-hover:brightness-125 transition-colors duration-200" />
                            )}
                            
                            {getTotalItems() > 0 && (
                              <span className="absolute -top-1 -right-1 bg-[#39FF14] text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-black z-20">
                                {getTotalItems()}
                              </span>
                            )}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        sideOffset={12}
                        className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl min-w-[220px] shadow-2xl relative overflow-visible"
                      >
                         <div className="absolute -top-[7px] right-3 w-3.5 h-3.5 bg-black/80 border-l border-t border-white/10 rotate-45" />

                         <DropdownMenuLabel className="p-3 font-fredoka text-[10px] uppercase tracking-[0.2em] text-purple-400/70 font-black">
                            Suas Atividades
                         </DropdownMenuLabel>
                         
                         <DropdownMenuItem 
                            onClick={openCart} 
                            className="flex items-center justify-between p-3 focus:bg-white/5 rounded-xl cursor-pointer transition-all duration-300 group mb-1"
                         >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#39FF14]/10 group-hover:bg-[#39FF14]/20 transition-colors">
                                <Clock className="w-4 h-4 text-[#39FF14]" />
                              </div>
                              <span className="font-fredoka font-bold text-gray-200">Pendentes</span>
                            </div>
                            {getTotalItems() > 0 && (
                              <span className="bg-[#39FF14] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-[#39FF14]/20">
                                {getTotalItems()}
                              </span>
                            )}
                         </DropdownMenuItem>

                         {user && (
                            <>
                             <DropdownMenuItem 
                               onClick={openTicketDrawer} 
                               className="flex items-center justify-between p-3 focus:bg-white/5 rounded-xl cursor-pointer transition-all duration-300 group mb-1"
                             >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-[#FF6B00]/10 group-hover:bg-[#FF6B00]/20 transition-colors">
                                    <Ticket className="w-4 h-4 text-[#FF6B00]" />
                                  </div>
                                  <span className="font-fredoka font-bold text-gray-200">Meus Ingressos</span>
                                </div>
                                {ticketCount > 0 && (
                                  <span className="bg-[#FF6B00] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-[#FF6B00]/20">
                                    {ticketCount}
                                  </span>
                                )}
                             </DropdownMenuItem>
                             
                             <DropdownMenuItem 
                               onClick={() => router.push('/perfil')} 
                               className="flex items-center gap-3 p-3 focus:bg-white/5 rounded-xl cursor-pointer transition-all duration-300 group mb-1"
                             >
                                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                  <User className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="font-fredoka font-bold text-gray-200">Dados Pessoais</span>
                             </DropdownMenuItem>
                            </>
                          )}

                         <DropdownMenuSeparator className="bg-white/5 my-2" />

                         <DropdownMenuLabel className="p-3 font-fredoka text-[10px] uppercase tracking-[0.2em] text-purple-400/70 font-black">
                            Conta
                         </DropdownMenuLabel>

                        {user ? (
                          <>
                            <DropdownMenuItem disabled className="px-3 py-1 text-xs text-gray-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                              {user.email}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={handleLogout} 
                              className="flex items-center gap-3 p-3 focus:bg-red-500/10 text-red-400 rounded-xl cursor-pointer transition-all duration-300 mt-1"
                            >
                               <span className="font-fredoka font-bold">Sair da Conta</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem 
                            onClick={openAuth} 
                            className="flex items-center gap-3 p-3 focus:bg-[#39FF14]/10 text-[#39FF14] rounded-xl cursor-pointer transition-all duration-300 mt-1"
                          >
                             <span className="font-fredoka font-bold">Entrar / Cadastrar</span>
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
                    {isMenuOpen ? <X className="w-6 h-6 text-[#FF007F]" /> : <Menu className="w-6 h-6 text-[#FF007F]" />}
                  </Button>
                </div>
              </div>

              {isMenuOpen && (
                <nav className="md:hidden mt-4 pt-4 border-t border-purple-500/30 flex flex-col space-y-3">
                  {menuItems.map((item, index) => (
                    <div key={item.label} className="flex flex-col space-y-1">
                       <button
                        onClick={() => {
                          setActiveIndex(index);
                          if (!item.children) {
                            navigateTo(item.href, item.isAnchor);
                          }
                        }}
                        className={`relative flex items-center gap-3 transition-colors duration-300 font-fredoka font-bold text-left px-4 py-3 rounded-xl
                                   ${pathname === item.href || item.children?.some(c => pathname === c.href) ? 'text-white' : 'text-gray-300'}`}
                        style={{ backgroundColor: (pathname === item.href || item.children?.some(c => pathname === c.href)) ? item.color : 'transparent' }}
                      >
                         <span className="text-current">{item.icon}</span>
                         <span>{item.label}</span>
                         {item.children && <ChevronDown className="ml-auto w-4 h-4" />}
                      </button>
                      {item.children && (
                        <div className="pl-12 flex flex-col space-y-2 mt-1 mb-2">
                           {item.children.map((child) => (
                             <button
                                key={child.label}
                                onClick={() => navigateTo(child.href)}
                                className={`text-left py-2 font-fredoka text-sm transition-colors
                                           ${pathname === child.href ? 'text-white font-bold' : 'text-gray-400'}`}
                             >
                               {child.label}
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              )}            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <AuthDrawer isOpen={isAuthOpen} onOpenChange={closeAuth} />
      <CheckoutDrawer isOpen={isCheckoutDrawerOpen} onOpenChange={closeCheckoutDrawer} cart={cart} totalValue={getTotalPrice()} />
      <TicketDrawer isOpen={isTicketDrawerOpen} onOpenChange={closeTicketDrawer} />
    </>
  );
};

export default Header;

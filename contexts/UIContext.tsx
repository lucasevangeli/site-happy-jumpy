"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isCartOpen: boolean;
  isAuthOpen: boolean;
  isCheckoutDrawerOpen: boolean;
  isTicketDrawerOpen: boolean; // Adicionado
  openCart: () => void;
  closeCart: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  openCheckoutDrawer: () => void;
  closeCheckoutDrawer: () => void;
  openTicketDrawer: () => void; // Adicionado
  closeTicketDrawer: () => void; // Adicionado
  toggleCart: () => void;
  toggleAuth: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState(false); // Adicionado

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);
  const toggleAuth = () => setIsAuthOpen(prev => !prev);
  
  const openCheckoutDrawer = () => setIsCheckoutDrawerOpen(true);
  const closeCheckoutDrawer = () => setIsCheckoutDrawerOpen(false);

  const openTicketDrawer = () => setIsTicketDrawerOpen(true); // Adicionado
  const closeTicketDrawer = () => setIsTicketDrawerOpen(false); // Adicionado

  return (
    <UIContext.Provider value={{ 
      isCartOpen, 
      isAuthOpen, 
      isCheckoutDrawerOpen,
      isTicketDrawerOpen, // Adicionado
      openCart, 
      closeCart, 
      openAuth, 
      closeAuth, 
      openCheckoutDrawer,
      closeCheckoutDrawer,
      openTicketDrawer, // Adicionado
      closeTicketDrawer, // Adicionado
      toggleCart, 
      toggleAuth 
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

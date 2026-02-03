"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isCartOpen: boolean;
  isAuthOpen: boolean;
  isCheckoutDrawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  openCheckoutDrawer: () => void;
  closeCheckoutDrawer: () => void;
  toggleCart: () => void;
  toggleAuth: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);
  const toggleAuth = () => setIsAuthOpen(prev => !prev);
  
  const openCheckoutDrawer = () => setIsCheckoutDrawerOpen(true);
  const closeCheckoutDrawer = () => setIsCheckoutDrawerOpen(false);

  return (
    <UIContext.Provider value={{ 
      isCartOpen, 
      isAuthOpen, 
      isCheckoutDrawerOpen,
      openCart, 
      closeCart, 
      openAuth, 
      closeAuth, 
      openCheckoutDrawer,
      closeCheckoutDrawer,
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

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isCartOpen: boolean;
  isAuthOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  toggleCart: () => void;
  toggleAuth: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);
  const toggleAuth = () => setIsAuthOpen(prev => !prev);

  return (
    <UIContext.Provider value={{ isCartOpen, isAuthOpen, openCart, closeCart, openAuth, closeAuth, toggleCart, toggleAuth }}>
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

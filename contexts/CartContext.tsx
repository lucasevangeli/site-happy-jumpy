"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
  startTime?: string;
  endTime?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, startTime?: string, endTime?: string) => void;
  removeFromCart: (productId: string, startTime?: string) => void;
  updateQuantity: (productId: string, quantity: number, startTime?: string) => void;
  updateItemSchedule: (productId: string, startTime: string, endTime: string, oldStartTime?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('happyJumpyCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('happyJumpyCart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, startTime?: string, endTime?: string) => {
    setCart(prevCart => {
      // Se tiver horário, tratamos como um item único para aquele horário
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        item.startTime === startTime && 
        item.endTime === endTime
      );

      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && item.startTime === startTime && item.endTime === endTime)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, startTime, endTime }];
    });
  };

  const removeFromCart = (productId: string, startTime?: string) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === productId && item.startTime === startTime)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, startTime?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, startTime);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.id === productId && item.startTime === startTime) ? { ...item, quantity } : item
      )
    );
  };

  const updateItemSchedule = (productId: string, startTime: string, endTime: string, oldStartTime?: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        (item.id === productId && item.startTime === oldStartTime) 
          ? { ...item, startTime, endTime } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemSchedule,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

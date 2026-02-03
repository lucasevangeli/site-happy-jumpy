"use client";

import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio', {
        description: 'Adicione produtos ao carrinho antes de finalizar.',
      });
      return;
    }

    toast.success('Redirecionando para o checkout...', {
      description: 'Você será redirecionado para finalizar sua compra.',
    });
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success('Item removido', {
      description: 'O item foi removido do carrinho.',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-black border-l border-purple-500/30">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Meu Carrinho
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-8">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Carrinho Vazio</h3>
                <p className="text-gray-400">
                  Adicione pulseiras ao seu carrinho para começar sua diversão!
                </p>
              </div>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white"
              >
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400">{item.duration}</p>
                      </div>
                      <Button
                        onClick={() => handleRemoveItem(item.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-green-500/30 hover:bg-green-500/20"
                        >
                          <Minus className="w-4 h-4 text-green-400" />
                        </Button>
                        <span className="w-12 text-center font-semibold text-white">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-green-500/30 hover:bg-green-500/20"
                        >
                          <Plus className="w-4 h-4 text-green-400" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-purple-500/30 pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxa de serviço</span>
                    <span className="text-green-400">Grátis</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-purple-500/30">
                    <span>Total</span>
                    <span className="text-green-400">R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                  >
                    Finalizar Compra
                  </Button>
                  <Button
                    onClick={() => {
                      clearCart();
                      toast.success('Carrinho limpo!');
                    }}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

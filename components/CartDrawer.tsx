import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Ticket, Clock as ClockIcon, Calendar, Edit2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Importar useAuth
import { useUI } from '@/contexts/UIContext'; // Importar useUI
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { SlotSelector } from './SlotSelector';
import { Slot } from '@/lib/availability';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart, updateItemSchedule } = useCart();
  const { user } = useAuth(); // Usar estado de autenticação
  const { openAuth, closeCart, openCheckoutDrawer } = useUI(); // Usar controles da UI

  const [view, setView] = useState<'items' | 'scheduling'>('items');
  const [schedulingItem, setSchedulingItem] = useState<any>(null);

  // Efeito para detectar se um novo item sem horário foi adicionado e abrir o agendamento
  useEffect(() => {
    if (isOpen && view === 'items') {
      const lastItem = cart[cart.length - 1];
      if (lastItem && !lastItem.startTime) {
        setSchedulingItem(lastItem);
        setView('scheduling');
      }
    }
  }, [cart.length, isOpen]);

  const formatSchedule = (isoDate: string) => {
    const date = new Date(isoDate);
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleEditSchedule = (item: any) => {
    setSchedulingItem(item);
    setView('scheduling');
  };

  const handleConfirmSchedule = (slot: Slot) => {
    if (schedulingItem) {
      updateItemSchedule(schedulingItem.id, slot.start.toISOString(), slot.end.toISOString(), schedulingItem.startTime);
      toast.success('Horário agendado com sucesso!');
    }
    setView('items');
    setSchedulingItem(null);
  };

  const handleCheckout = () => {
    const unscheduled = cart.filter(item => !item.startTime);
    if (unscheduled.length > 0) {
      toast.error('Agendamento pendente', {
        description: 'Por favor, agende todos os seus tickets antes de finalizar.',
      });
      return;
    }

    if (!user) {
      closeCart();
      openAuth();
      toast.info('Login necessário');
    } else {
      closeCart();
      openCheckoutDrawer();
    }
  };

  const handleRemoveItem = (id: string, startTime?: string) => {
    removeFromCart(id, startTime);
    toast.success('Item removido');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setView('items');
        setSchedulingItem(null);
      }
      onClose();
    }}>
      <SheetContent className="w-full sm:max-w-md bg-black border-l border-purple-500/30 p-0 flex flex-col rounded-l-[40px] overflow-hidden">
        {view === 'items' ? (
          <>
            <SheetHeader className="p-8 pb-0">
              <SheetTitle className="text-2xl font-titan uppercase">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Pendentes
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-8 px-8 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <ClockIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Vazio por enquanto...</h3>
                  <Button onClick={onClose} variant="ghost" className="text-purple-400">
                    Bora escolher uns tickets!
                  </Button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.startTime || idx}`}
                    className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-titan text-white tracking-tight uppercase">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 font-fredoka uppercase tracking-wider">{item.duration}</p>
                        
                        {item.startTime ? (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-xl border border-green-500/20">
                              <Calendar className="w-3 h-3 text-green-400" />
                              <span className="text-[9px] font-black text-green-400 uppercase">
                                {formatSchedule(item.startTime).date} às {formatSchedule(item.startTime).time}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleEditSchedule(item)}
                              className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleEditSchedule(item)}
                            className="mt-3 w-full bg-green-400 text-black text-[10px] font-black uppercase h-8 rounded-xl hover:bg-green-300"
                          >
                            Agendar Horário
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRemoveItem(item.id, item.startTime)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-red-400 hover:bg-red-500/5 -mt-2 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.startTime)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:border-green-400 hover:text-green-400"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-titan text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.startTime)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:border-green-400 hover:text-green-400"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-lg font-titan text-green-400">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-black/50 backdrop-blur-xl border-t border-white/5 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-fredoka uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-titan text-white">
                    <span>Total</span>
                    <span className="text-green-400">R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={cart.some(item => !item.startTime)}
                  className={cn(
                    "w-full h-14 text-lg font-titan uppercase tracking-wider transition-all duration-500 rounded-2xl",
                    cart.some(item => !item.startTime)
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-[#39FF14] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                  )}
                >
                  {cart.some(item => !item.startTime) ? 'Agende para finalizar' : 'Finalizar Compra'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 p-8 min-h-0">
            <SlotSelector 
              product={{
                id: schedulingItem?.id,
                name: schedulingItem?.name,
                duration: schedulingItem?.duration,
                duration_minutes: parseInt(schedulingItem?.duration?.replace(/\D/g, '') || '60')
              }}
              onSelect={handleConfirmSchedule}
              onBack={() => {
                setView('items');
                setSchedulingItem(null);
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

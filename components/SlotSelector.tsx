"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  Calendar as CalendarIcon,
  Loader2,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { generateAvailableSlots, Slot } from '@/lib/availability';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface SlotSelectorProps {
  product: any;
  onSelect: (slot: Slot) => void;
  onBack?: () => void;
}

type Step = 'date' | 'time';

export const SlotSelector: React.FC<SlotSelectorProps> = ({ 
  product, 
  onSelect,
  onBack
}) => {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gerar próximos 7 dias
  const dates = useMemo(() => {
    const d = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0); // Normalizar para comparar apenas a data
      date.setDate(date.getDate() + i);
      d.push(date);
    }
    return d;
  }, []);

  useEffect(() => {
    if (product && step === 'time') {
      loadSlots(selectedDate);
    }
  }, [product, selectedDate, step]);

  const loadSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      const availableSlots = await generateAvailableSlots(product, date);
      setSlots(availableSlots);
    } catch (error) {
      console.error("Erro ao carregar slots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateInfo = (date: Date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return {
      dayName: days[date.getDay()],
      dayNum: date.getDate(),
      month: months[date.getMonth()],
      full: date.toLocaleDateString('pt-BR')
    };
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const getStatusStyles = (slot: Slot, isPast: boolean) => {
    if (isPast) return 'opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-gray-500';
    const ratio = slot.occupancy / slot.capacity;
    if (ratio >= 1) return 'opacity-50 cursor-not-allowed border-red-500/20 bg-red-500/5 text-red-500/50';
    if (ratio >= 0.8) return 'border-orange-500 text-orange-500 bg-orange-500/5';
    return 'border-green-500/50 text-green-400 bg-green-500/5 hover:bg-green-500/10 hover:border-green-400';
  };

  const now = new Date();

  return (
    <div className="flex flex-col h-full min-h-0 bg-black text-white">
      <AnimatePresence mode="wait">
        {step === 'date' ? (
          <motion.div 
            key="date-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full min-h-0"
          >
            {/* Header Data */}
            <div className="flex items-center gap-4 mb-8">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <div>
                <h3 className="text-2xl font-titan uppercase tracking-tight">Vem quando?</h3>
                <p className="text-xs text-gray-500 font-fredoka">Selecione o dia da sua visita</p>
              </div>
            </div>

            {/* Grid de Datas */}
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-1 custom-scrollbar">
              {dates.map((date, i) => {
                const info = formatDateInfo(date);
                const isToday = i === 0;
                const active = isSameDay(date, selectedDate);
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                        setSelectedDate(date);
                        setStep('time');
                    }}
                    className={cn(
                      "group relative flex flex-col items-start p-5 rounded-3xl border transition-all duration-300",
                      active 
                      ? "bg-green-400/10 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]" 
                      : "bg-white/5 border-white/5 hover:border-green-400/30 hover:bg-white/[0.08]"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-black uppercase mb-1",
                      active ? "text-green-400" : "text-gray-500"
                    )}>
                      {isToday ? 'Hoje' : info.dayName}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-3xl font-titan leading-none",
                        active ? "text-white" : "text-gray-300"
                      )}>{info.dayNum}</span>
                      <span className={cn(
                        "text-xs font-titan uppercase tracking-tighter",
                        active ? "text-green-400" : "text-gray-600"
                      )}>{info.month}</span>
                    </div>

                    {active && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="time-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full min-h-0"
          >
            {/* Header Horários */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setStep('date')}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-green-400" />
              </button>
              <div>
                <h3 className="text-2xl font-titan uppercase tracking-tight">Que horas?</h3>
                <p className="text-xs text-gray-500 font-fredoka">
                    {formatDateInfo(selectedDate).dayName}, {formatDateInfo(selectedDate).dayNum} de {formatDateInfo(selectedDate).month}
                </p>
              </div>
            </div>

            {/* Grid de Horários */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-green-400 animate-spin mb-4" />
                  <p className="text-sm text-gray-500 font-fredoka">Consultando vagas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {slots.map((slot, index) => {
                    const isPast = slot.start < now;
                    const isFull = slot.occupancy >= slot.capacity;
                    const disabled = isPast || isFull;

                    return (
                      <button
                        key={index}
                        disabled={disabled}
                        onClick={() => onSelect(slot)}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-5 rounded-[2.5rem] border transition-all duration-300",
                          getStatusStyles(slot, isPast)
                        )}
                      >
                        <span className="text-xl font-titan group-hover:scale-110 transition-transform">
                          {formatTime(slot.start)}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter opacity-70 mt-1">
                          <Users className="w-3 h-3" />
                          {slot.occupancy} / {slot.capacity}
                        </div>

                        {disabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem]">
                            <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] -rotate-12">
                              {isFull ? 'Esgotado' : 'Encerrado'}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer Legenda */}
            <div className="mt-4 flex items-center justify-around text-[9px] font-black uppercase tracking-widest text-gray-500 border-t border-white/5 pt-6">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Livre
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Lotando
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    Cheio
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

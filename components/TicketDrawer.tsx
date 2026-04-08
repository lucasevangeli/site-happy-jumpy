// components/TicketDrawer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Ticket, Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import bwipjs from 'bwip-js';

// Componente para renderizar o código de barras PDF417
const PDF417Barcode = ({ text }: { text: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && text) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'pdf417',       // Barcode type
          text: text,           // Text to encode
          scale: 3,               // Scaling factor
          height: 12,             // Bar height, in millimeters
          includetext: false,    // Show human-readable text
          textxalign: 'center',  // Always good to set
          barcolor: 'ffffff',    // White bars (as in the design reference)
        });
      } catch (e) {
        console.error('Erro ao gerar PDF417:', e);
      }
    }
  }, [text]);

  return (
    <div className="w-full flex justify-center py-2 overflow-hidden bg-white/[0.03] rounded-lg">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
};

// Interface para a estrutura do ingresso
interface TicketData {
  id: string;
  code: string;
  eventId: string;
  itemName: string;
  itemDescription?: string;
  validated: boolean;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  expiresAt?: string;
}

// Props para o componente
interface TicketDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ isOpen, onOpenChange }) => {
  const { user, refreshTicketCount } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setTickets([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const ticketsCollection = collection(db, 'tickets');
        const userTicketsQuery = query(
          ticketsCollection,
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(userTicketsQuery);
        if (!snapshot.empty) {
          const loadedTickets: TicketData[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<TicketData, 'id'>
          })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTickets(loadedTickets);
        } else {
          setTickets([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar ingressos:", err);
        setError("Não foi possível carregar seus ingressos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) fetchTickets();
  }, [isOpen, user]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const getTicketStatus = (ticket: TicketData) => {
    if (ticket.validated) {
      return { text: 'Utilizado', color: 'text-red-500' };
    }
    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) {
      return { text: 'Expirado', color: 'text-gray-500' };
    }
    return { text: 'Ticket valido', color: 'text-gray-300' };
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return "??";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins}m`;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--/--/----";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isTomorrow = 
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    if (isToday) return "Hoje";
    if (isTomorrow) return "Amanhã";

    return date.toLocaleDateString('pt-BR');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-green-400" /></div>;
    }
    if (error) {
      return <p className="text-center text-red-400 py-8">{error}</p>;
    }
    if (tickets.length === 0) {
      return <p className="text-center text-gray-400 py-8">Você ainda não possui ingressos.</p>;
    }
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Container que alterna entre Vertical (Desktop) e Horizontal (Mobile) */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="py-4 flex-1 overflow-x-auto overflow-y-auto sm:overflow-x-hidden pr-2 flex flex-row sm:flex-col sm:space-y-8 snap-x snap-mandatory no-scrollbar"
        >
          {tickets.map((ticket, index) => {
            const status = getTicketStatus(ticket);
            const duration = calculateDuration(ticket.startTime, ticket.endTime);
            
            return (
              <div 
                key={ticket.id}
                className="min-w-full sm:min-w-0 flex items-center justify-center snap-center mb-0 sm:mb-0"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative w-full max-w-[380px] mx-auto group p-2"
                >
                  {/* Card Principal */}
                  <div className="bg-[#1a1a1a] rounded-[32px] border border-[#A3E635]/30 overflow-hidden shadow-2xl relative z-10">
                    
                    {/* Header do Ticket */}
                    <div className="p-5 pb-2">
                      <div className="flex items-center gap-2 mb-5">
                         <span className={`text-sm font-fredoka ${status.color}`}>{status.text}</span>
                      </div>

                      <div className="flex justify-between items-end mb-4">
                         <div className="text-center">
                            <span className="text-white font-fredoka font-bold text-lg">{formatTime(ticket.startTime)}</span>
                         </div>
                         <div className="text-[#A3E635] font-titan text-xl mb-1">{duration}</div>
                         <div className="text-center">
                            <span className="text-white font-fredoka font-bold text-lg">{formatTime(ticket.endTime)}</span>
                         </div>
                      </div>

                      {/* Timeline Progress Bar */}
                      <div className="relative h-[2px] w-full bg-gray-700/50 mb-6 flex items-center justify-between">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A3E635]/30 to-transparent"></div>
                         <div className="w-2 h-2 rounded-full bg-gray-400 relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]"></div>
                         <div className="absolute left-1/2 -translate-x-1/2 -top-4">
                            <motion.div
                               animate={{ x: [0, 5, 0] }}
                               transition={{ duration: 1, repeat: Infinity }}
                            >
                               <img src="/iconetiket.png" alt="Happy Jumpy Icon" className="w-6 h-6 object-contain" />
                            </motion.div>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-gray-400 relative z-10 shadow-[0_0_8px_rgba(255,255,255,0.2)]"></div>
                      </div>

                      {/* Código herói */}
                      <div className="text-center mb-5 relative">
                         <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 mb-2 font-fredoka">codigo de validacao</p>
                         <h2 className="text-3xl font-fredoka font-black text-white tracking-tighter">
                            {ticket.code}
                         </h2>
                         <p className="text-[9px] text-[#FF4D00] uppercase font-bold tracking-widest mt-2 font-fredoka">apresente o codigo na entrada</p>
                      </div>

                      {/* Data e Horário Grid */}
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 pb-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-titan text-white uppercase tracking-wider">Data</p>
                            {(() => {
                              const dateText = formatDate(ticket.startTime);
                              return (
                                <p className={`text-xs font-fredoka font-medium ${dateText === 'Hoje' ? 'text-[#FF4D00]' : 'text-gray-400'}`}>
                                  {dateText}
                                </p>
                              );
                            })()}
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[10px] font-titan text-white uppercase tracking-wider">Horário</p>
                            <p className="text-xs font-fredoka font-medium text-gray-400">
                               {ticket.startTime ? new Date(ticket.startTime).getHours().toString().padStart(2, '0') : '--'}:00
                            </p>
                         </div>
                      </div>
                    </div>

                    {/* Picote (Ticket Stub) */}
                    <div className="relative h-6 flex items-center justify-center">
                       <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-black border border-[#A3E635]/30"></div>
                       <div className="w-full border-t-2 border-dashed border-gray-700/50 mx-6"></div>
                       <div className="absolute right-0 translate-x-1/2 w-6 h-6 rounded-full bg-black border border-[#A3E635]/30"></div>
                    </div>

                    {/* Área Inferior (PDF417 Barcode) */}
                    <div className="p-5 bg-black/20 flex flex-col items-center">
                       <PDF417Barcode text={ticket.code} />
                       <p className="text-[8px] text-[#FF4D00] font-fredoka mt-3 uppercase tracking-widest text-center">
                          Chegar 30 minutos antes
                       </p>
                    </div>

                  </div>

                  {/* Status used overlay */}
                  {ticket.validated && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center">
                       <div className="bg-red-500/10 border border-red-500/50 px-6 py-2 rounded-full transform -rotate-12">
                          <span className="text-red-500 font-titan uppercase tracking-widest">Utilizado</span>
                       </div>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Indicadores (Dots) - Visível apenas no Mobile se houver mais de 1 ticket */}
        {tickets.length > 1 && (
          <div className="flex sm:hidden justify-center items-center gap-2 py-4">
            {tickets.map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  width: activeIndex === i ? 24 : 8,
                  backgroundColor: activeIndex === i ? "#A3E635" : "#333",
                  opacity: activeIndex === i ? 1 : 0.5
                }}
                className="h-2 rounded-full transition-colors duration-300"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-black border-l border-[#A3E635]/20 text-white flex flex-col p-0 sm:rounded-l-[40px] rounded-none">
        <SheetHeader className="p-6 sm:p-8 pb-2 sm:pb-4">
          <SheetTitle className="flex items-center gap-3 text-xl sm:text-2xl font-titan uppercase">
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-[#A3E635]" />
            <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Meus Ingressos
            </span>
          </SheetTitle>
          <SheetDescription className="text-gray-500 font-fredoka text-xs sm:text-sm">
            Apresente seus tickets ativos no check-in do parque.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-4 sm:px-8 overflow-hidden flex flex-col">
          {renderContent()}
        </div>

        <SheetFooter className="p-6 sm:p-8 border-t border-white/5">
          <SheetClose asChild>
            <Button variant="ghost" className="w-full h-11 sm:h-12 rounded-2xl border border-[#A3E635]/40 text-[#A3E635] hover:text-[#A3E635] hover:bg-[#A3E635]/5 hover:border-[#A3E635] uppercase font-titan tracking-widest text-xs transition-all duration-300">
              Fechar Meus Tickets
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

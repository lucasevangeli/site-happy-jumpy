// components/TicketDrawer.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
import { Ticket, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';

// Interface para a estrutura do ingresso
interface TicketData {
  id: string;
  code: string;
  eventId: string;
  itemName: string;
  itemDescription?: string;
  validated: boolean;
  createdAt: string;
  expiresAt?: string;
}

// Props para o componente
interface TicketDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ isOpen, onOpenChange }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setTickets([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const ticketsRef = ref(db, 'tickets');
        const userTicketsQuery = query(ticketsRef, orderByChild('userId'), equalTo(user.uid));
        const snapshot = await get(userTicketsQuery);
        if (snapshot.exists()) {
          const ticketsData = snapshot.val();
          const loadedTickets: TicketData[] = Object.keys(ticketsData).map(key => ({
            id: key,
            ...ticketsData[key]
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

  const getTicketStatus = (ticket: TicketData) => {
    if (ticket.validated) {
      return { text: 'UTILIZADO', pillClass: 'bg-red-900 text-red-300', borderClass: 'border-red-500/30' };
    }
    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) {
      return { text: 'EXPIRADO', pillClass: 'bg-yellow-900 text-yellow-300', borderClass: 'border-yellow-500/30' };
    }
    return { text: 'VÁLIDO', pillClass: 'bg-green-900 text-green-300', borderClass: 'border-green-500/30' };
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
      <div className="py-4 space-y-6 flex-1 overflow-y-auto pr-4">
        {tickets.map((ticket) => {
          const status = getTicketStatus(ticket);
          return (
            <div key={ticket.id} className={`bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border ${status.borderClass}`}>
              <div className="p-5">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.pillClass}`}>{status.text}</span>
                <h3 className="text-xl font-bold text-white mt-3">{ticket.itemName}</h3>
                {ticket.itemDescription && <p className="text-sm text-gray-400">{ticket.itemDescription}</p>}
              </div>
              <div className="relative px-5">
                <div className="absolute -left-1 -top-3.5 bg-black h-7 w-7 rounded-full"></div>
                <div className="border-t-2 border-dashed border-gray-600"></div>
                <div className="absolute -right-1 -top-3.5 bg-black h-7 w-7 rounded-full"></div>
              </div>
              <div className="p-5 text-center">
                <p className="text-sm text-gray-400">Código de Validação</p>
                <p className="text-2xl font-mono font-bold text-green-400 tracking-widest mt-1">{ticket.code}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-black border-l border-purple-500/30 text-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl font-bold text-green-400">
            <Ticket className="h-6 w-6" />
            Meus Ingressos
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Apresente o código na entrada do evento para validação.
          </SheetDescription>
        </SheetHeader>
        {renderContent()}
        <SheetFooter className="mt-auto pt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white">
              Fechar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

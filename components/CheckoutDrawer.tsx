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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import Image from 'next/image';
import { CheckCircle2, CreditCard as CreditCardIcon, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; // Import useCart

interface CheckoutDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cart: any[];
  totalValue: number;
}

type CheckoutStep = 'selection' | 'pix_generated' | 'card_result' | 'payment_confirmed';

export function CheckoutDrawer({ isOpen, onOpenChange, cart, totalValue }: CheckoutDrawerProps) {
  const { toast } = useToast();
  const { clearCart } = useCart(); // Get clearCart function
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('selection');

  // PIX State
  const [pixData, setPixData] = useState<{ qrCode: string; payload: string } | null>(null);
  const [internalPaymentId, setInternalPaymentId] = useState<string | null>(null);

  // Credit Card State
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | 'new'>('new');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCcv, setCardCcv] = useState('');
  const [cardPaymentResult, setCardPaymentResult] = useState<any>(null);

  // Effect to load saved cards
  useEffect(() => {
    const fetchSavedCards = async () => {
      const user = auth.currentUser;
      if (!user || !isOpen) return;

      try {
        const cardsCollectionRef = collection(db, `users/${user.uid}/cards`);
        const snapshot = await getDocs(cardsCollectionRef);
        const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedCards(cards);

        // If there are saved cards, default to the first one
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar cartões salvos:", error);
      }
    };

    fetchSavedCards();
  }, [isOpen]);

  // Effect to listen for payment status changes on Firebase Firestore
  useEffect(() => {
    if (!internalPaymentId) return;

    const paymentDocRef = doc(db, 'payments', internalPaymentId);

    const unsubscribe = onSnapshot(paymentDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.status === 'CONFIRMED') {
          setStep('payment_confirmed');
          clearCart();
          toast({
            title: 'Pagamento Confirmado!',
            description: 'Seu pagamento foi recebido com sucesso.',
            className: 'bg-green-600 text-white',
          });
        }
      }
    });

    return () => unsubscribe();
  }, [internalPaymentId, toast, clearCart]); // Add clearCart to dependency array


  const handlePixPayment = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({ title: 'Erro de Autenticação', description: 'Usuário não encontrado. Por favor, faça login novamente.', variant: 'destructive' });
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: 'PIX',
          totalValue,
          cart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar PIX.');
      }

      const data = await response.json();
      setPixData(data);
      setInternalPaymentId(data.internalPaymentId);
      setStep('pix_generated');

    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreditCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({ title: 'Erro de Autenticação', description: 'Usuário não encontrado. Por favor, faça login novamente.', variant: 'destructive' });
        return;
      }
      const token = await user.getIdToken();

      const [expiryMonth, expiryYear] = cardExpiry.split('/');
      if (!expiryMonth || !expiryYear) {
        throw new Error('Data de validade do cartão inválida. Use o formato MM/AA.');
      }

      const bodyPayload: any = {
        paymentMethod: 'CREDIT_CARD',
        totalValue,
        cart,
      };

      if (selectedCardId === 'new') {
        const [expiryMonth, expiryYear] = cardExpiry.split('/');
        if (!expiryMonth || !expiryYear) {
          throw new Error('Data de validade do cartão inválida. Use o formato MM/AA.');
        }
        bodyPayload.creditCard = {
          holderName: cardHolderName,
          number: cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear: `20${expiryYear}`,
          ccv: cardCcv,
        };
      } else {
        const selectedCard = savedCards.find(c => c.id === selectedCardId);
        if (!selectedCard) throw new Error('Cartão selecionado não encontrado.');
        bodyPayload.creditCardToken = selectedCard.creditCardToken;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.errors?.[0]?.description || errorData.error || 'Falha no pagamento com cartão.');
      }

      const data = await response.json();
      setCardPaymentResult(data);
      setStep('card_result');
      toast({ title: 'Pagamento Aprovado!', description: `Status: ${data.status}` });

    } catch (error: any) {
      toast({ title: 'Erro no Pagamento', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setStep('selection');
    setPixData(null);
    setInternalPaymentId(null);
    setCardHolderName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCcv('');
    setCardPaymentResult(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const renderSelection = () => (
    <Tabs defaultValue="pix" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-gray-800 p-1 rounded-xl h-auto">
        <TabsTrigger value="pix" className="py-2.5 rounded-lg data-[state=active]:bg-[#39ff14] data-[state=active]:text-black data-[state=active]:font-bold text-gray-400 hover:text-white transition-all">
          PIX
        </TabsTrigger>
        <TabsTrigger value="card" className="py-2.5 rounded-lg data-[state=active]:bg-[#39ff14] data-[state=active]:text-black data-[state=active]:font-bold text-gray-400 hover:text-white transition-all">
          Cartão de Crédito
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pix">
        <div className="py-4 text-center">
          <p className="text-sm text-neutral-400 mb-4">
            Clique no botão abaixo para gerar um QR Code PIX. O código será válido por 1 hora.
          </p>
          <Button onClick={handlePixPayment} disabled={isLoading} className="w-full bg-[#39ff14] text-black hover:bg-[#39ff14]/90 font-bold hover:drop-shadow-[0_0_8px_#39ff14] transition-all">
            {isLoading ? 'Gerando...' : 'Gerar PIX'}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="card">
        <div className="space-y-6 py-4">
          {savedCards.length > 0 && (
            <div className="space-y-3">
              <Label className="text-neutral-200">Seus Cartões Salvos</Label>
              <div className="grid gap-3">
                {savedCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCardId === card.id
                      ? 'border-neon-green bg-neon-green/10'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className={`w-5 h-5 ${selectedCardId === card.id ? 'text-neon-green' : 'text-neutral-500'}`} />
                      <div className="text-left">
                        <p className="text-sm font-bold text-white uppercase">{card.brand} **** {card.lastFourDigits}</p>
                        <p className="text-[10px] text-neutral-500">Salvo em {new Date(card.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {selectedCardId === card.id && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  </button>
                ))}

                <button
                  onClick={() => setSelectedCardId('new')}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedCardId === 'new'
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                    }`}
                >
                  <Plus className={`w-5 h-5 ${selectedCardId === 'new' ? 'text-neon-green' : 'text-neutral-500'}`} />
                  <span className="text-sm font-bold text-white">Usar outro cartão</span>
                </button>
              </div>
            </div>
          )}

          {(selectedCardId === 'new' || savedCards.length === 0) && (
            <form onSubmit={handleCreditCardPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderName" className="text-neutral-200">Nome no Cartão</Label>
                <Input id="cardHolderName" value={cardHolderName} onChange={e => setCardHolderName(e.target.value)} placeholder="Como está escrito no cartão" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-neutral-200">Número do Cartão</Label>
                <Input id="cardNumber" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry" className="text-neutral-200">Validade (MM/AA)</Label>
                  <Input id="cardExpiry" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCcv" className="text-neutral-200">CCV</Label>
                  <Input id="cardCcv" value={cardCcv} onChange={e => setCardCcv(e.target.value)} placeholder="123" required />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-[#39ff14] text-black hover:bg-[#39ff14]/90 font-bold mt-4 hover:drop-shadow-[0_0_8px_#39ff14] transition-all">
                {isLoading ? 'Processando...' : `Pagar R$ ${totalValue.toFixed(2)}`}
              </Button>
            </form>
          )}

          {selectedCardId !== 'new' && savedCards.length > 0 && (
            <Button
              onClick={(e: any) => handleCreditCardPayment(e)}
              disabled={isLoading}
              className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold"
            >
              {isLoading ? 'Processando...' : `Pagar com Cartão Salvo (R$ ${totalValue.toFixed(2)})`}
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderPixGenerated = () => (
    <div className="py-4 text-center">
      <SheetTitle className="text-white mb-2">Aguardando Pagamento...</SheetTitle>
      <p className="text-sm text-neutral-400 mb-4">
        Aponte a câmera do seu celular para o QR Code ou use o "Copia e Cola".
      </p>
      {pixData?.qrCode && (
        <div className="bg-white p-4 rounded-xl inline-block">
          <Image
            src={`data:image/png;base64,${pixData.qrCode}`}
            alt="PIX QR Code"
            width={256}
            height={256}
          />
        </div>
      )}
      <div className="mt-4">
        <Label className="text-neutral-200">PIX Copia e Cola</Label>
        <Input readOnly value={pixData?.payload || ''} className="mt-1 text-xs" />
        <Button variant="outline" size="sm" className="mt-2" onClick={() => {
          navigator.clipboard.writeText(pixData?.payload || '');
          toast({ title: 'Copiado!', description: 'O código PIX foi copiado para a área de transferência.' });
        }}>
          Copiar Código
        </Button>
      </div>
    </div>
  );

  const renderPaymentConfirmed = () => (
    <div className="py-4 text-center flex flex-col items-center justify-center h-full">
      <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
      <SheetTitle className="text-white mb-2">Pagamento Confirmado!</SheetTitle>
      <p className="text-sm text-neutral-400">
        Obrigado pela sua compra. Prepara-se para pular!
      </p>
    </div>
  );

  const renderCardResult = () => (
    <div className="py-4 text-center">
      <SheetTitle className="text-white mb-2">Resultado do Pagamento</SheetTitle>
      {cardPaymentResult && (
        <div>
          <p className="text-lg">Status: <span className={`font-bold ${cardPaymentResult.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>{cardPaymentResult.status}</span></p>
          <p className="text-sm text-neutral-400 mt-4">Obrigado pela sua compra!</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'selection':
        return renderSelection();
      case 'pix_generated':
        return renderPixGenerated();
      case 'payment_confirmed':
        return renderPaymentConfirmed();
      case 'card_result':
        return renderCardResult();
      default:
        return renderSelection();
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-black border-l border-purple-500/30 p-8 flex flex-col">
        <SheetHeader>
          <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Finalizar Pagamento</span></SheetTitle>
          <SheetDescription>Valor total: R$ {totalValue.toFixed(2)}</SheetDescription>
        </SheetHeader>
        <div className="flex-1">
          {renderStepContent()}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" onClick={resetState} className="w-full">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

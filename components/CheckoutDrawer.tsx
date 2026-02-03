"use client";

import React, { useState } from 'react';
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
import { auth } from '@/lib/firebase';
import Image from 'next/image';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cart: any[]; // Define a type for your cart items
  totalValue: number;
}

type CheckoutStep = 'selection' | 'pix_generated' | 'card_result';

export function CheckoutDrawer({ isOpen, onOpenChange, cart, totalValue }: CheckoutDrawerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('selection');
  
  // PIX State
  const [pixData, setPixData] = useState<{ qrCode: string; payload: string } | null>(null);

  // Credit Card State
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCcv, setCardCcv] = useState('');
  const [cardPaymentResult, setCardPaymentResult] = useState<any>(null);

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

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: 'CREDIT_CARD',
          totalValue,
          cart,
          creditCard: {
            holderName: cardHolderName,
            number: cardNumber.replace(/\s/g, ''),
            expiryMonth,
            expiryYear: `20${expiryYear}`,
            ccv: cardCcv,
          }
        }),
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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pix">PIX</TabsTrigger>
        <TabsTrigger value="card">Cartão de Crédito</TabsTrigger>
      </TabsList>
      <TabsContent value="pix">
        <div className="py-4 text-center">
          <p className="text-sm text-neutral-400 mb-4">
            Clique no botão abaixo para gerar um QR Code PIX. O código será válido por 1 hora.
          </p>
          <Button onClick={handlePixPayment} disabled={isLoading} className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold">
            {isLoading ? 'Gerando...' : 'Gerar PIX'}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="card">
        <form onSubmit={handleCreditCardPayment} className="space-y-4 py-4">
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
          <Button type="submit" disabled={isLoading} className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold">
            {isLoading ? 'Processando...' : `Pagar R$ ${totalValue.toFixed(2)}`}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
  
  const renderPixGenerated = () => (
    <div className="py-4 text-center">
      <SheetTitle className="text-white mb-2">Pague com PIX</SheetTitle>
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
    switch(step) {
      case 'selection':
        return renderSelection();
      case 'pix_generated':
        return renderPixGenerated();
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

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
import { CheckCircle2, CreditCard as CreditCardIcon, Plus, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cart: any[];
  totalValue: number;
}

type CheckoutStep = 'terms_consent' | 'selection' | 'pix_generated' | 'card_result' | 'payment_confirmed';

export function CheckoutDrawer({ isOpen, onOpenChange, cart, totalValue }: CheckoutDrawerProps) {
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { closeCheckoutDrawer, openTicketDrawer } = useUI();
  const { refreshTicketCount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('terms_consent');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

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

  // Efeito de redirecionamento pós-sucesso
  useEffect(() => {
    if (step === 'payment_confirmed' || (step === 'card_result' && cardPaymentResult?.status === 'CONFIRMED')) {
      // Limpa o carrinho imediatamente após o sucesso
      clearCart();
      refreshTicketCount();

      const timer = setTimeout(() => {
        closeCheckoutDrawer();
        openTicketDrawer();
        resetState();
      }, 5000); // 5 segundos de delay conforme solicitado

      return () => clearTimeout(timer);
    }
  }, [step, cardPaymentResult]);

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
    setStep('terms_consent');
    setHasAcceptedTerms(false);
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

  const [hasReadEverything, setHasReadEverything] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 5;
    if (isBottom && !hasReadEverything) {
      setHasReadEverything(true);
    }
  };

  const renderTermsConsent = () => (
    <div className="flex flex-col h-full space-y-6 relative">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-green-400/20 rounded-lg">
          <FileText className="w-5 h-5 text-green-400" />
        </div>
        <h3 className="text-xl font-titan uppercase text-white">Termo de Consentimento</h3>
      </div>

      <div className="relative flex-1 min-h-0">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full bg-white/5 border border-white/10 p-6 overflow-y-auto custom-scrollbar"
        >
          <div className="text-gray-400 font-fredoka text-sm space-y-4 leading-relaxed text-left">
            <p className="font-titan text-white uppercase text-xs tracking-widest text-green-400 mb-4">Termo de Ciência e Responsabilidade:</p>
            
            <p className="text-gray-300 font-bold">O HAPPY JUMP ESCLARECE E ALERTA TODOS OS SEUS USUÁRIOS/JUMPERS E/OU PAIS/RESPONSÁVEIS, CONFORME SEGUE:</p>

            <div className="space-y-4">
              <p><strong>1)</strong> HAPPY JUMP consiste em um moderno parque de trampolim coberto formado por um complexo de camas elásticas/trampolins. Criado para garantir a diversão a partir de 2 anos. Crianças abaixo de 6 anos e 11 meses deverão estar acompanhadas pelo pai ou responsável adulto.</p>
              
              <p><strong>2)</strong> O HAPPY JUMP conta com trampolins de última geração e as atividades são acompanhadas por profissionais capacitados para orientar a prática segura.</p>

              <p><strong>3)</strong> As atividades consistem em práticas esportivas de grande impacto físico que, quando não respeitadas as orientações, poderão causar entorses, ferimentos, fraturas, luxações e até mesmo morte.</p>

              <p><strong>4)</strong> Ainda que seguidas todas as recomendações, subsistem riscos decorrentes de movimentos inadequados ou interações com outros usuários.</p>

              <p><strong>5)</strong> O acompanhamento de crianças, adolescentes ou PCD é de responsabilidade integral dos pais e/ou tutores.</p>

              <p><strong>6)</strong> Pessoas com TEA deverão obrigatoriamente estar acompanhadas por pais/responsáveis durante toda a permanência.</p>

              <p><strong>7)</strong> Responsáveis por PCD com comportamentos específicos devem comunicar o fato à equipe.</p>

              <p><strong>8)</strong> O usuário declara não possuir doenças pré-existentes que impeçam a atividade.</p>

              <p><strong>9)</strong> O usuário declara ciência de todos os riscos e os assume voluntariamente.</p>

              <p><strong>10)</strong> Proibido o uso por grávidas. O usuário declara não estar grávida nem ter suspeita.</p>

              <p><strong>11)</strong> O usuário declara estar em perfeitas condições físicas e mentais e não ter consumido álcool ou entorpecentes.</p>

              <p><strong>12)</strong> Uso de meia antiderrapante é OBRIGATÓRIO para todos.</p>

              <p><strong>13)</strong> Autoriza o uso de imagem (fotos/vídeos) para fins de segurança e divulgação publicitária.</p>

              <p><strong>14)</strong> Ciente de que imagens podem ser solicitadas por autoridades (LGPD).</p>

              <p><strong>15)</strong> Saída de menores apenas autorizada com a presença dos responsáveis.</p>

              <p><strong>16)</strong> A equipe pode reprimir ou proibir a permanência em caso de comportamento inadequado.</p>

              <p><strong>17)</strong> Isenta o HAPPY JUMP de responsabilidade em caso de acidentes por descumprimento de regras.</p>

              <p><strong>18)</strong> Declara ciência das "Regras do Parque" disponíveis no site e local físico.</p>

              <p><strong>19)</strong> Concorda com o tratamento de dados pessoais conforme a LGPD (Lei nº 13.709).</p>

              <p><strong>20)</strong> Autoriza o recebimento de comunicações via E-mail, WhatsApp e SMS.</p>
            </div>

            <p className="pt-4 border-t border-white/10 italic text-gray-300">
              POR FIM, DECLARO QUE LI, COMPREENDI, PREENCHI, NÃO SOLICITEI ALTERAÇÕES E NEM INCLUI QUAISQUER INFORMAÇÕES ADICIONAIS APÓS A LEITURA DO PRESENTE TERMO.
            </p>
            
            <p className="font-bold text-white">
              DECLARO AINDA QUE ASSINEI VOLUNTARIAMENTE ESTE TERMO E CONCORDO EXPRESSAMENTE COM TODAS AS CONDIÇÕES, ASSUMINDO RESPONSABILIDADE CIVIL E CRIMINALMENTE PELA VERACIDADE DAS INFORMAÇÕES PRESTADAS.
            </p>
          </div>
        </div>

        {/* Indicador de Scroll */}
        <AnimatePresence>
          {!hasReadEverything && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-green-400/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
            >
              <span className="text-[10px] font-black uppercase text-green-400 tracking-wider">Role para habilitar</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown className="w-3 h-3 text-green-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 pt-4">
        <div className={cn(
          "flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300",
          !hasReadEverything 
          ? "bg-white/5 border-white/5 opacity-50 grayscale" 
          : "bg-green-400/5 border-green-400/20 hover:border-green-400/40"
        )}>
          <Checkbox 
            id="terms" 
            disabled={!hasReadEverything}
            checked={hasAcceptedTerms}
            onCheckedChange={(checked) => setHasAcceptedTerms(checked === true)}
            className="mt-1 border-gray-600 data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400"
          />
          <label
            htmlFor="terms"
            className={cn(
              "text-xs font-fredoka leading-tight cursor-pointer select-none",
              !hasReadEverything ? "text-gray-600" : "text-gray-400"
            )}
          >
            {hasReadEverything 
              ? "Li e aceito os termos de responsabilidade e regras de segurança." 
              : "Leia todo o termo acima para habilitar o aceite."}
          </label>
        </div>

        <Button
          onClick={() => setStep('selection')}
          disabled={!hasAcceptedTerms}
          className={cn(
            "w-full h-14 text-lg font-titan uppercase tracking-wider transition-all duration-500 rounded-2xl",
            !hasAcceptedTerms
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-[#39FF14] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          )}
        >
          <span>Continuar</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

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
          <Button 
            onClick={() => {
              const unscheduledItems = cart.filter(item => !item.startTime);
              if (unscheduledItems.length > 0) {
                toast({
                  title: "Itens sem agendamento",
                  description: "Por favor, defina o horário de todos os ingressos pendentes.",
                  variant: "destructive"
                });
                return;
              }
              handlePixPayment();
            }} 
            disabled={isLoading} 
            className="w-full bg-[#39ff14] text-black hover:bg-[#39ff14]/90 font-bold hover:drop-shadow-[0_0_8px_#39ff14] transition-all"
          >
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const unscheduledItems = cart.filter(item => !item.startTime);
              if (unscheduledItems.length > 0) {
                toast({
                  title: "Itens sem agendamento",
                  description: "Por favor, defina o horário de todos os ingressos pendentes.",
                  variant: "destructive"
                });
                return;
              }
              handleCreditCardPayment(e);
            }} className="space-y-4">
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
              onClick={(e: any) => {
                e.preventDefault();
                const unscheduledItems = cart.filter(item => !item.startTime);
                if (unscheduledItems.length > 0) {
                  toast({
                    title: "Itens sem agendamento",
                    description: "Por favor, defina o horário de todos os ingressos pendentes.",
                    variant: "destructive"
                  });
                  return;
                }
                handleCreditCardPayment(e);
              }}
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
      case 'terms_consent':
        return renderTermsConsent();
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
      <SheetContent className="w-full sm:max-w-md bg-black border-l border-purple-500/30 p-8 flex flex-col sm:rounded-l-[40px] rounded-none overflow-hidden">
        <SheetHeader>
          <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Finalizar Pagamento</span></SheetTitle>
          <SheetDescription>Valor total: R$ {totalValue.toFixed(2)}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
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

"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Clock, ShoppingCart, Ticket, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { useUI } from '@/contexts/UIContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TicketsPage() {
  const { addToCart } = useCart();
  const { openCart } = useUI(); // Adicionado para abrir a aba lateral
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const productsCollection = collection(db, 'wristbands');
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const productsArray: Product[] = snapshot.docs.map(doc => {
          const productData = doc.data();
          return {
            id: doc.id,
            name: productData.title,
            description: productData.description,
            price: productData.price,
            duration: productData.duration_minutes ? `${productData.duration_minutes} min` : 'N/A',
            imageUrl: productData.photo_url || '',
            duration_minutes: productData.duration_minutes,
            type: 'wristband'
          };
        });
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddToCartClick = (product: Product) => {
    // Adiciona ao carrinho sem horário (pendente agendamento)
    addToCart(product);
    
    // Abre a aba lateral automaticamente
    openCart();
    
    toast.success('Adicionado aos pendentes!', {
      description: `Agende o horário do seu ticket agora na aba lateral.`,
    });
  };

  return (
    <main className="bg-black min-h-screen pt-32 pb-20">
      <Header />
      
      <div className="container mx-auto px-4 max-w-7xl pt-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full text-[#39FF14] text-sm font-fredoka font-bold mb-6">
            <Ticket className="w-4 h-4" />
            <span>Venda Online Oficial</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-titan text-white mb-6 leading-tight">
            Garanta seu <span className="bg-gradient-to-r from-[#39FF14] to-[#00D4FF] bg-clip-text text-transparent">Ticket</span>
          </h1>
          <p className="text-xl text-gray-400 font-fredoka max-w-2xl mx-auto">
            Escolha o tempo ideal de diversão e venha desafiar a gravidade. Ingressos antecipados garantem sua vaga no parque!
          </p>
        </div>

        {/* Grid de Ingressos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <div 
                key={product.id}
                className="group relative bg-[#111] border border-gray-800 rounded-[40px] overflow-hidden hover:border-[#39FF14]/50 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Imagem do Ticket */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Ticket className="w-12 h-12 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 bg-[#39FF14] text-black px-4 py-1 rounded-full text-xs font-titan uppercase tracking-wider">
                    {product.duration}
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-titan text-white leading-tight">
                      {product.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 font-fredoka mb-8 line-clamp-3">
                    {product.description || 'Acesso completo a todas as atrações do parque. Diversão sem limites garantida para todas as idades!'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs font-fredoka uppercase tracking-wider">Valor</span>
                      <span className="text-3xl font-titan text-[#39FF14]">R$ {product.price.toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCartClick(product)}
                      className="px-8 py-3 bg-[#39FF14] text-black rounded-2xl font-titan uppercase text-sm hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Extra para SEO e Confiança */}
        <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <ShieldCheck className="w-10 h-10 text-[#00D4FF] mb-4" />
                <h4 className="text-white font-titan mb-2">Compra Segura</h4>
                <p className="text-gray-400 font-fredoka text-sm">Seus dados protegidos com criptografia de ponta a ponta.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <Clock className="w-10 h-10 text-[#C4D648] mb-4" />
                <h4 className="text-white font-titan mb-2">Sem Filas</h4>
                <p className="text-gray-400 font-fredoka text-sm">Compre online e apresente seu QR Code no balcão de check-in.</p>
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                <CheckCircle2 className="w-10 h-10 text-[#DC822F] mb-4" />
                <h4 className="text-white font-titan mb-2">Tudo Incluso</h4>
                <p className="text-gray-400 font-fredoka text-sm">Um único ticket dá acesso a todas as áreas do parque.</p>
            </div>
        </div>
      </div>
    </main>
  );
}

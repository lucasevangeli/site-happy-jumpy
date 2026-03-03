"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ShoppingCart, Check } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface ComboItem {
  quantity: number;
  title: string;
  type: 'wristband' | 'product';
}

interface Combo {
  id: string;
  title: string;
  description: string;
  price: number;
  items: Record<string, ComboItem>;
  photo_url?: string;
}

const CombosSection = () => {
  const { addToCart } = useCart();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const combosCollection = collection(db, 'combos');
    const unsubscribe = onSnapshot(combosCollection, (snapshot) => {
      if (!snapshot.empty) {
        const combosArray: Combo[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Combo, 'id'>,
        }));
        setCombos(combosArray);
      } else {
        setCombos([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddToCart = (combo: Combo) => {
    const product: Product = {
      id: combo.id,
      name: combo.title,
      description: combo.description,
      price: combo.price,
      duration: 'Combo Especial',
      imageUrl: combo.photo_url || '',
    };
    addToCart(product);
    toast.success('Combo adicionado ao carrinho!', {
      description: `${product.name} foi adicionado com sucesso.`,
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    if (itemWidth > 0) {
      const newIndex = Math.round(scrollLeft / itemWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const renderSkeletons = () => (
    Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-black/50 backdrop-blur-lg border-2 border-purple-500/30 p-4 min-w-full md:min-w-0">
        <CardHeader className="items-center">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-8 w-3/4 mt-4" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <Skeleton className="h-10 w-1/2 mx-auto" />
          </div>
          <Skeleton className="h-px w-full my-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-12 w-full" />
        </CardFooter>
      </Card>
    ))
  );

  return (
    <section id="combos" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm font-semibold">
              Ofertas Especiais
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Nossos Combos
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Aproveite nossos pacotes especiais e economize!
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {isLoading ? renderSkeletons() : combos.map((combo) => (
              <div
                key={combo.id}
                onClick={() => handleAddToCart(combo)}
                className="min-w-full md:min-w-0 snap-center px-1 md:px-0"
              >
                <div className="group bg-[#111] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#39FF14]/50 transition-all cursor-pointer flex flex-col shadow-xl h-full">
                  {/* Image Container - Top */}
                  <div className="relative aspect-square w-full bg-[#1a1a1a] overflow-hidden">
                    {combo.photo_url ? (
                      <img
                        src={combo.photo_url}
                        alt={combo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Gift className="w-12 h-12 text-gray-800" />
                      </div>
                    )}
                    {/* Category Badge - Neon Purple */}
                    <div className="absolute top-4 left-4 bg-[#8B00FF] px-3 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest z-10 shadow-lg">
                      Combo
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-white font-black text-xl leading-tight mb-2">
                      {combo.title}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {combo.description || 'A melhor combinação de diversão e sabor para sua experiência ser completa!'}
                    </p>

                    <div className="space-y-2 mb-6">
                      {Object.values(combo.items).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                          <span>{item.quantity}x {item.title}</span>
                        </div>
                      ))}
                      {Object.values(combo.items).length > 3 && (
                        <p className="text-[10px] text-gray-600 pl-3.5">+ outros itens especiais</p>
                      )}
                    </div>

                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">Valor do Combo</span>
                        <span className="text-[#39FF14] font-black text-3xl leading-none">
                          R$ {combo.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-12 w-12 bg-[#39FF14] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.4)] group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-6 h-6 text-black font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots - Mobile Only */}
          {!isLoading && combos.length > 0 && (
            <div className="flex md:hidden justify-center gap-2 mb-8">
              {combos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${activeIndex === idx ? 'bg-[#39FF14] w-4' : 'bg-gray-800'
                    }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CombosSection;

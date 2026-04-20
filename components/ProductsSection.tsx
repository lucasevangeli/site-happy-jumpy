"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Star, Zap, Check, Ticket } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const ProductsSection = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
            type: 'wristband',
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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success('Adicionado aos pendentes!', {
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
      <Card key={index} className="bg-black/50 backdrop-blur-lg border-2 border-green-500/30 p-4 min-w-full md:min-w-0">
        <CardHeader className="items-center">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-8 w-3/4 mt-4" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-1/3 mx-auto mt-2" />
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
    <section id="produtos" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-semibold">
              Nossos Planos
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-titan">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Garanta Seu Ticket
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-fredoka">
            Todos os planos incluem acesso completo às nossas atrações. Escolha o tempo perfeito para sua diversão!
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {isLoading ? renderSkeletons() : products.map((product, index) => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center px-2 md:px-0"
              >
                <div className="group bg-[#111] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#39FF14]/50 transition-all cursor-pointer flex flex-col shadow-xl h-full">
                  {/* Image Container - Top */}
                  <div className="relative aspect-square w-full bg-[#1a1a1a] overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      </div>
                    )}
                    {/* Category Badge - Neon Green */}
                    <div className="absolute top-4 left-4 bg-[#39FF14] px-3 py-1 rounded text-[10px] font-black text-black uppercase tracking-widest z-10 shadow-lg font-fredoka">
                      Ticket
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-white font-black text-lg leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 bg-gray-900/80 px-2 py-1 rounded-md border border-gray-800">
                        <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span className="text-gray-300 text-[11px] font-bold">{product.duration}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                      {product.description || 'Acesso completo a todas as atrações e diversão garantida para toda a família!'}
                    </p>

                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[9px] uppercase font-bold tracking-tight">Investimento</span>
                        <span className="text-[#39FF14] font-black text-2xl leading-none">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="px-4 py-2 bg-[#39FF14] text-black rounded-lg font-titan uppercase text-[10px] shadow-[0_0_15px_rgba(57,255,20,0.3)] group-hover:scale-110 transition-transform">
                        Comprar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots - Mobile Only */}
          {!isLoading && products.length > 0 && (
            <div className="flex md:hidden justify-center gap-2 mb-8">
              {products.map((_, idx) => (
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
          
          <div className="flex justify-center mt-12">
            <a 
              href="/tickets" 
              className="px-10 py-4 bg-white text-black font-fredoka font-black rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Ver Todos os Ingressos
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-purple-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Dúvidas sobre qual pulseira escolher?</h3>
          <p className="text-gray-400 mb-4">
            Nossa equipe está pronta para te ajudar a escolher o plano perfeito!
          </p>
          <Button className="bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white">
            Falar com Atendente
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

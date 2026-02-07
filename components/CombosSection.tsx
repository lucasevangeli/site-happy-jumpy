"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ShoppingCart, Check } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
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
}

const CombosSection = () => {
  const { addToCart } = useCart();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const combosRef = ref(db, 'combos');
    const unsubscribe = onValue(combosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const combosArray: Combo[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
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
    // Adapt the combo structure to the Product structure for the cart
    const product: Product = {
      id: combo.id,
      name: combo.title,
      description: combo.description,
      price: combo.price,
      duration: Object.values(combo.items).map(item => `${item.quantity}x ${item.title}`).join(' + '),
    };
    addToCart(product);
    toast.success('Combo adicionado ao carrinho!', {
      description: `${product.name} foi adicionado com sucesso.`,
    });
  };

  const renderSkeletons = () => (
    Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-black/50 backdrop-blur-lg border-2 border-purple-500/30 p-4">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? renderSkeletons() : combos.map((combo) => (
            <Card
              key={combo.id}
              className="bg-black/50 backdrop-blur-lg border-2 border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500"
            >
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-green-400 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center text-white">{combo.title}</CardTitle>
                <CardDescription className="text-center text-gray-400">
                  {combo.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">
                    R$ {combo.price.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-purple-500/30">
                  <p className="text-sm font-semibold text-white mb-2">Este combo inclui:</p>
                  {Object.values(combo.items).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{item.quantity}x {item.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleAddToCart(combo)}
                  className="w-full bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white font-semibold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CombosSection;

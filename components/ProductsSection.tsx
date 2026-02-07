"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Star, Zap, ShoppingCart, Check } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

const ProductsSection = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, 'wristbands');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsArray: Product[] = Object.keys(data).map(key => {
          const productData = data[key];
          return {
            id: key,
            name: productData.title,
            description: productData.description,
            price: productData.price,
            duration: `${productData.duration_minutes} minutos`,
            // color: productData.color, // Opcional, se for usar a cor
          };
        });
        setProducts(productsArray);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success('Produto adicionado ao carrinho!', {
      description: `${product.name} foi adicionado com sucesso.`,
    });
  };

  const features = [
    'Acesso a todas as atrações',
    'Meias antiderrapantes incluídas',
    'Armário para guardar pertences',
    'Wi-Fi gratuito',
  ];

  const renderSkeletons = () => (
    Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-black/50 backdrop-blur-lg border-2 border-green-500/30 p-4">
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
    <section id="pulseiras" className="py-24 bg-gradient-to-b from-black via-purple-950/20 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-semibold">
              Nossos Planos
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Escolha Sua Pulseira
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Todos os planos incluem acesso completo às nossas atrações. Escolha o tempo perfeito para sua diversão!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? renderSkeletons() : products.map((product, index) => (
            <Card
              key={product.id}
              className={`bg-black/50 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                // Aplica estilo especial ao último item como exemplo
                index === products.length - 1
                  ? 'border-purple-500 shadow-purple-500/20'
                  : 'border-green-500/30 hover:border-green-500'
              }`}
            >
              <CardHeader>
                {index === products.length - 1 && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-6 h-6 text-purple-400 fill-purple-400" />
                  </div>
                )}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
                  {index === products.length - 1 ? (
                    <Zap className="w-8 h-8 text-white" />
                  ) : (
                    <Clock className="w-8 h-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-2xl text-center text-white">{product.name}</CardTitle>
                <CardDescription className="text-center text-gray-400">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">
                    R$ {product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{product.duration}</div>
                </div>

                <div className="space-y-2 pt-4 border-t border-purple-500/30">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {index === products.length - 1 && (
                    <>
                      <div className="flex items-center space-x-2 text-sm text-purple-400">
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span>Fura-fila em todas atrações</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-purple-400">
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span>1 bebida grátis</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full ${
                    index === products.length - 1
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
                      : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                  } text-white font-semibold`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </CardFooter>
            </Card>
          ))}
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

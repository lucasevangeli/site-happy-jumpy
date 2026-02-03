"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Star, Zap, ShoppingCart, Check } from 'lucide-react';
import { useCart, Product } from '@/contexts/CartContext';
import { toast } from 'sonner';

const ProductsSection = () => {
  const { addToCart } = useCart();

  const products: Product[] = [
    {
      id: '1',
      name: 'Pulseira 1 Hora',
      description: 'Perfeito para conhecer todas as atrações',
      price: 49.90,
      duration: '60 minutos',
    },
    {
      id: '2',
      name: 'Pulseira 2 Horas',
      description: 'Diversão estendida para toda a família',
      price: 79.90,
      duration: '120 minutos',
    },
    {
      id: '3',
      name: 'Pulseira Day Pass',
      description: 'Dia inteiro de pura adrenalina',
      price: 129.90,
      duration: 'Dia inteiro',
    },
    {
      id: '4',
      name: 'Pulseira VIP',
      description: 'Acesso premium com vantagens exclusivas',
      price: 199.90,
      duration: 'Dia inteiro + extras',
    },
  ];

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
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`bg-black/50 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                index === 3
                  ? 'border-purple-500 shadow-purple-500/20'
                  : 'border-green-500/30 hover:border-green-500'
              }`}
            >
              <CardHeader>
                {index === 3 && (
                  <div className="absolute top-4 right-4">
                    <Star className="w-6 h-6 text-purple-400 fill-purple-400" />
                  </div>
                )}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
                  {index === 3 ? (
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
                  {index === 3 && (
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
                    index === 3
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

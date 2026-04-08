"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const FoamPit = dynamic(() => import('./FoamPit'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/20 animate-pulse" />
});

const FoamSection = () => {
  return (
    <section className="relative h-screen min-h-[700px] w-full bg-black overflow-hidden flex flex-col items-center justify-center py-20">
      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E60A7E] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#A3E635] rounded-full blur-[150px]" />
      </div>

      {/* Conteúdo de Texto - Elevado para z-30 para ficar acima dos blocos */}
      <div className="container mx-auto px-4 relative z-30 text-center mb-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="inline-block px-4 py-1.5 bg-[#A3E635]/10 border border-[#A3E635]/30 rounded-full text-[#A3E635] text-sm font-titan tracking-wider uppercase">
            Experiência Interativa
          </span>
          <h2 className="text-4xl md:text-6xl font-titan text-white uppercase leading-tight drop-shadow-2xl">
            Piscina de <span className="text-[#E60A7E]">Espuma</span> 3D
          </h2>
          <p className="text-gray-200 font-fredoka text-lg max-w-2xl mx-auto drop-shadow-lg">
            Gostou das atrações? Que tal experimentar nossa física realista agora? 
            <span className="text-[#A3E635] block mt-2 font-bold animate-pulse">
              Clique e arraste os blocos para brincar!
            </span>
          </p>
        </motion.div>
      </div>

      {/* Container da Piscina de Espuma - Ocupando a seção inteira */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        <FoamPit />
      </div>

      {/* Gradientes de Transição Superior e Inferior */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

      {/* Instrução visual para Mouse/Touch */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-4 text-gray-500 text-xs font-titan tracking-widest uppercase opacity-50">
          <div className="flex flex-col items-center gap-1">
             <div className="w-1 h-3 border border-current rounded-full relative">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-current rounded-full animate-bounce" />
             </div>
             <span>Scroll</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-800" />
          <span>Arraste os Cubos</span>
        </div>
      </div>
    </section>
  );
};

export default FoamSection;

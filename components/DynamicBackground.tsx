'use client';

import React from 'react';
import { motion } from 'framer-motion';

const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-[#0A0118] via-[#1A013D] to-[#0A0118] pointer-events-none">
      {/* Círculo Roxo Principal (Centro) */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [-100, 100, -100],
          y: [-50, 50, -50],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-600/60 rounded-full blur-[140px]"
      />

      {/* Círculo Rosa (Canto Superior Direito) */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [100, -150, 100],
          y: [-100, 100, -100],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E60A7E]/40 rounded-full blur-[120px]"
      />

      {/* Círculo Azul (Canto Inferior Esquerdo) */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [-80, 120, -80],
          y: [100, -100, 100],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-0 left-0 w-[650px] h-[650px] bg-[#00D4FF]/30 rounded-full blur-[130px]"
      />

      {/* Círculo Roxo Profundo (Variante para profundidade) */}
      <motion.div
        animate={{
          scale: [1.2, 1.6, 1.2],
          x: [200, -200, 200],
          y: [200, -200, 200],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-0 w-[900px] h-[900px] bg-indigo-700/40 rounded-full blur-[160px]"
      />

      {/* Overlay de Grão - Textura fumaçada mais nítida */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default DynamicBackground;

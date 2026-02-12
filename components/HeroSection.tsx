"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

const HeroSection = () => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToPulseiras = () => {
    const element = document.querySelector('#pulseiras');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="inicio" className="relative h-screen w-full overflow-hidden">
      {/* Video de fundo */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted // Inicia mudo, mas pode ser alterado
          playsInline
          className="w-full h-full object-cover"
          src="https://firebasestorage.googleapis.com/v0/b/happy-jumpy.firebasestorage.app/o/videoapresentacao%2FComercial%20Vila%20Trampolim.mp4?alt=media&token=a54e7b7e-4659-4f08-832c-e57415efc981"
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
        {/* Overlay escuro para melhorar a legibilidade do texto */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-7xl text-left">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-green-400/20 border border-green-400 rounded-full text-green-400 text-sm font-semibold">
                Trampolim Park #1 da Região
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="text-white">Bem-vindo à</span>
              <br />
              <span className="text-green-400 drop-shadow-md drop-shadow-green-400">
                Happy Jumpy
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Experimente a emoção de pular, voar e se divertir no maior parque de trampolins da cidade.
              Diversão garantida para todas as idades!
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                onClick={scrollToPulseiras}
                variant="neonGreen"
                className="rounded-full font-extrabold px-8 py-6 text-lg group"
              >
                Comprar Pulseiras
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={toggleSound}
                variant="outline"
                size="icon"
                className="rounded-full border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de rolagem */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-8 h-12 border-2 border-green-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-green-400 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

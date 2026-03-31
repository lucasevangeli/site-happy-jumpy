"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const HeroSection = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const videoRefStorage = ref(storage, 'videoapresentacao/HAPPY - VIDEO SITE HORIZONTAL.mp4');
        const url = await getDownloadURL(videoRefStorage);
        setVideoUrl(url);
      } catch (error) {
        console.error('Erro ao buscar vídeo do Firebase Storage:', error);
        // Fallback para o link anterior caso falhe
        setVideoUrl("https://firebasestorage.googleapis.com/v0/b/happy-jumpy.firebasestorage.app/o/videoapresentacao%2FComercial%20Vila%20Trampolim.mp4?alt=media&token=a54e7b7e-4659-4f08-832c-e57415efc981");
      }
    };

    fetchVideoUrl();
  }, []);

  // Forçar o play assim que o URL estiver pronto e o componente montado
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay bloqueado pelo navegador, aguardando interação ou garantindo mute:", error);
      });
    }
  }, [videoUrl]);

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
        {videoUrl && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover transition-opacity duration-1000"
            src={videoUrl}
            style={{ opacity: videoUrl ? 1 : 0 }}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        )}
        {/* Overlay escuro para melhorar a legibilidade do text e degradê inferior para integrar com a próxima seção */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
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
              <span className="text-white">Bem-vindo ao</span>
              <br />
              <span className="drop-shadow-md">
                <span className="text-[#CB2185]">H</span>
                <span className="text-[#DC822F]">a</span>
                <span className="text-[#C4D648]">p</span>
                <span className="text-[#E60A7E]">p</span>
                <span className="text-[#00D4FF]">y</span>
                <span className="text-white"> </span>
                <span className="text-[#FFFF00]">J</span>
                <span className="text-[#CB2185]">u</span>
                <span className="text-[#DC822F]">m</span>
                <span className="text-[#C4D648]">p</span>
                <span className="text-[#E60A7E]">y</span>
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Experimente a emoção de pular, voar e se divertir no maior parque de trampolins da cidade.
              Diversão garantida para todas as idades!
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                onClick={scrollToPulseiras}
                className="rounded-full font-extrabold px-8 py-6 text-lg group bg-transparent border-2 border-[#C8D40B] text-[#C8D40B] hover:bg-[#C8D40B] hover:text-black hover:drop-shadow-[0_0_15px_#C8D40B] transition-all duration-300"
              >
                Comprar Ingressos
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={toggleSound}
                variant="ghost"
                size="icon"
                className="rounded-full border-2 border-[#CB2185] text-[#CB2185] !bg-transparent hover:bg-[#CB2185] hover:text-white transition-all duration-300"
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

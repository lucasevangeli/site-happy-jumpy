"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import dynamic from 'next/dynamic';

const FoamPit = dynamic(() => import('./FoamPit'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
});
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const HeroSection = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mobileCheck = typeof window !== 'undefined' && window.innerWidth < 1024;
    setIsMobile(mobileCheck);
  }, []);

  const handleStartVideo = async () => {
    if (isVideoStarted || isFetching) return;
    
    setIsFetching(true);
    setIsVideoStarted(true);

    try {
      const mobileCheck = typeof window !== 'undefined' && window.innerWidth < 1024;
      const videoPath = mobileCheck 
        ? 'videoapresentacao/video menor resolucao .mp4' 
        : 'videoapresentacao/HAPPY - VIDEO SITE HORIZONTAL.mp4';
        
      const videoRefStorage = ref(storage, videoPath);
      const url = await getDownloadURL(videoRefStorage);
      setVideoUrl(url);
    } catch (error) {
      setVideoUrl("https://firebasestorage.googleapis.com/v0/b/happy-jumpy.firebasestorage.app/o/videoapresentacao%2FHAPPY%20-%20VIDEO%20SITE%20-%20HORIZONTAL%20(V1).mp4?alt=media");
    } finally {
      setIsFetching(false);
    }
  };

  // Forçar o play assim que o URL estiver pronto
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay bloqueado pelo navegador, aguardando interação:", error);
      });
      // Fail-safe: Se o vídeo não disparar onLoadedData, marcamos como carregado em 2s
      const timer = setTimeout(() => setIsVideoLoaded(true), 2000);
      return () => clearTimeout(timer);
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
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video de fundo */}
      <div className="absolute inset-0 z-0">
        {videoUrl && (
          <video
            key={videoUrl}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            poster="https://firebasestorage.googleapis.com/v0/b/happy-jumpy.firebasestorage.app/o/logo%2Flogo-happy-jumpy.png?alt=media"
            preload="auto"
            className="w-full h-full object-cover opacity-100 transition-opacity duration-1000"
            src={videoUrl}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        )}
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
      </div>

      {/* Conteúdo centralizado - Elevado para z-30 para ficar acima da FoamPit */}
      <div className="relative z-30 h-full flex flex-col justify-center">
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
              {!isVideoStarted ? (
                <Button
                  onClick={handleStartVideo}
                  disabled={isFetching}
                  className="rounded-full font-extrabold px-10 py-6 text-xl group bg-[#CB2185] border-2 border-[#CB2185] text-white hover:bg-transparent hover:text-[#CB2185] hover:drop-shadow-[0_0_20px_#CB2185] transition-all duration-500 scale-110"
                >
                  {isFetching ? (
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                       Carregando...
                     </div>
                  ) : (
                    <>
                      Ver Vídeo
                      <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={scrollToPulseiras}
                  className="rounded-full font-extrabold px-8 py-6 text-lg group bg-transparent border-2 border-[#C8D40B] text-[#C8D40B] hover:bg-[#C8D40B] hover:text-black hover:drop-shadow-[0_0_15px_#C8D40B] transition-all duration-300"
                >
                  Comprar Ingressos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              {isVideoStarted && (
                <Button
                  onClick={toggleSound}
                  variant="ghost"
                  size="icon"
                  className="rounded-full border-2 border-[#CB2185] text-[#CB2185] !bg-transparent hover:bg-[#CB2185] hover:text-white transition-all duration-300"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Piscina de Espuma Interativa - Reabilitada no Mobile para Teste */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <FoamPit />
      </div>

      {/* Indicador de rolagem - Elevado para z-40 */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-40 animate-bounce cursor-pointer" onClick={scrollToPulseiras}>
        <div className="w-8 h-12 border-2 border-green-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-green-400 rounded-full" />
        </div>
      </div>
    </section>
  );
};


export default HeroSection;

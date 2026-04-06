"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Triangle, Star, Zap, Target, Circle, Shield, Swords, Ghost, Flame, Sparkles } from 'lucide-react';

const attractions = [
    {
        id: 'piscina-de-espuma',
        title: 'Piscina de Espuma',
        description: 'Mergulhe sem medo em um mar de cubos de espuma macios e seguros! Ideal para treinar saltos novos.',
        icon: <Star className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#E60A7E' // Rosa
    },
    {
        id: 'free-jumpy',
        title: 'Free Jumpy',
        description: 'Área livre para saltar, treinar mortais e sentir a liberdade total no ar. O coração do parque!',
        icon: <Zap className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#00D4FF' // Azul
    },
    {
        id: 'duelo-de-luzes',
        title: 'Duelo de Luzes',
        description: 'Teste sua agilidade e reflexos neste desafio de luzes interativo e frenético. Quem é o mais rápido?',
        icon: <Target className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#C4D648' // Verde/Amarelo
    },
    {
        id: 'basquete',
        title: 'Basquete',
        description: 'Enterradas épicas e saltos altos em nossas cestas de basquete com trampolim. Sinta-se um profissional!',
        icon: <Circle className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#E60A7E'
    },
    {
        id: 'swing-ball',
        title: 'Swing Ball',
        description: 'Se equilibre para não cair e curta se balançar nesta bola gigante suspensa. Diversão garantida!',
        icon: <Flame className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#00D4FF'
    },
    {
        id: 'desafio-ninja',
        title: 'Desafio Ninja',
        description: 'Um percurso de obstáculos que vai testar sua força, equilíbrio e coordenação ninja.',
        icon: <Shield className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#C4D648'
    },
    {
        id: 'half-piper',
        title: 'Half Piper',
        description: 'Sinta a adrenalina das pistas de skate em uma estrutura de trampolim em formato de U gigante.',
        icon: <Triangle className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#E60A7E'
    },
    {
        id: 'parkour',
        title: 'Parkour',
        description: 'Supere obstáculos e explore novos movimentos em nossa área dedicada à arte do movimento.',
        icon: <Ghost className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#00D4FF'
    },
    {
        id: 'batalha-de-cotonetes',
        title: 'Batalha de Cotonetes',
        description: 'Um duelo clássico de equilíbrio e força em cima de uma ponte suspensa. Derrube seu oponente!',
        icon: <Swords className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#C4D648'
    },
    {
        id: 'dodgeball',
        title: 'Dodgeball',
        description: 'O clássico "queimada" elevado a outro nível em uma arena de trampolins com paredes elásticas.',
        icon: <Circle className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#E60A7E'
    },
    {
        id: 'giro-radical',
        title: 'Giro Radical',
        description: 'Desvie das barras giratórias e mostre que você é o último a ficar de pé neste desafio de tempo!',
        icon: <Sparkles className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#00D4FF'
    },
    {
        id: 'parede-escalada',
        title: 'Parede de Escalada',
        description: 'Suba o mais alto que puder e teste seus limites em nossa parede vertical com queda na espuma.',
        icon: <Triangle className="w-8 h-8 md:w-12 md:h-12" />,
        color: '#C4D648'
    }
];

const AttractionsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const nextItem = () => {
        setActiveIndex((prev) => (prev + 1) % attractions.length);
    };

    const prevItem = () => {
        setActiveIndex((prev) => (prev - 1 + attractions.length) % attractions.length);
    };

    return (
        <section className="py-24 relative overflow-hidden" id="atracoes">
            {/* Background Text Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] select-none flex items-center justify-center overflow-hidden">
                <span className="text-[30vw] font-titan leading-none whitespace-nowrap text-white">
                    {attractions[activeIndex].title.toUpperCase()}
                </span>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.span 
                        animate={{ color: attractions[activeIndex].color }}
                        className="font-fredoka font-bold tracking-widest uppercase text-sm"
                    >
                        Diversão Elevada
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-titan text-white"
                    >
                        Nossas Atrações
                    </motion.h2>
                </div>

                {/* 3D Slider Area */}
                <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
                    <div className="flex items-center justify-center w-full relative">
                        <AnimatePresence mode="popLayout">
                            {attractions.map((item, index) => {
                                // Logic for 3D visibility and positioning
                                const isCenter = index === activeIndex;
                                const isNext = index === (activeIndex + 1) % attractions.length;
                                const isPrev = index === (activeIndex - 1 + attractions.length) % attractions.length;
                                
                                if (!isCenter && !isNext && !isPrev) return null;

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ 
                                            opacity: 0, 
                                            scale: 0.8,
                                            x: isNext ? 300 : isPrev ? -300 : 0,
                                            rotateY: isNext ? -30 : isPrev ? 30 : 0
                                        }}
                                        animate={{ 
                                            opacity: isCenter ? 1 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.4 : 0.6),
                                            scale: isCenter ? 1.1 : 0.8,
                                            x: isNext ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 350) : isPrev ? (typeof window !== 'undefined' && window.innerWidth < 768 ? -100 : -350) : 0,
                                            rotateY: isNext ? -45 : isPrev ? 45 : 0,
                                            zIndex: isCenter ? 30 : 10,
                                            filter: isCenter ? 'blur(0px)' : (typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : 'blur(4px)'),
                                            transform: 'translateZ(0)' // Forçar GPU
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ 
                                            type: 'spring', 
                                            stiffness: 350, 
                                            damping: 35,
                                            filter: { type: 'tween', duration: 0.1 } 
                                        }}
                                        className="absolute cursor-pointer perspective-1000 will-change-transform"
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <div 
                                            className="w-64 h-64 md:w-80 md:h-80 rounded-[40px] flex flex-col items-center justify-center p-8 transition-transform duration-500 shadow-2xl relative overflow-hidden"
                                            style={{ backgroundColor: item.color }}
                                        >
                                            {/* Decorativo de fundo do card */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            
                                            <div className="text-white mb-6 relative z-10 transition-transform group-hover:scale-110">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-white text-2xl md:text-3xl font-titan text-center relative z-10">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons com preenchimento dinâmico e ícone branco */}
                    <motion.button 
                        onClick={prevItem}
                        animate={{ backgroundColor: attractions[activeIndex].color }}
                        className="absolute left-0 md:left-10 z-40 p-4 rounded-full text-white transition-all backdrop-blur-md active:scale-95 shadow-lg"
                    >
                        <ChevronLeft size={32} className="text-white" />
                    </motion.button>
                    <motion.button 
                        onClick={nextItem}
                        animate={{ backgroundColor: attractions[activeIndex].color }}
                        className="absolute right-0 md:right-10 z-40 p-4 rounded-full text-white transition-all backdrop-blur-md active:scale-95 shadow-lg"
                    >
                        <ChevronRight size={32} className="text-white" />
                    </motion.button>
                </div>

                {/* Info Display Area */}
                <div className="max-w-2xl mx-auto text-center mt-12 md:mt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <p className="text-white/70 font-fredoka text-xl md:text-2xl leading-relaxed">
                                {attractions[activeIndex].description}
                            </p>
                            <div className="flex justify-center gap-2">
                                {attractions.map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ 
                                            width: i === activeIndex ? 48 : 8,
                                            backgroundColor: i === activeIndex ? attractions[activeIndex].color : 'rgba(255,255,255,0.2)'
                                        }}
                                        className="h-2 rounded-full transition-all duration-300"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-20 flex justify-center">
                    <motion.a 
                        href="#contato"
                        animate={{ backgroundColor: attractions[activeIndex].color }}
                        className="px-12 py-5 text-white font-fredoka font-black text-xl rounded-full transition-all hover:scale-110 active:scale-95 shadow-2xl flex items-center gap-3"
                    >
                        Conferir Unidades
                        <ChevronRight size={20} className="text-white" />
                    </motion.a>
                </div>
            </div>
        </section>
    );
};

export default AttractionsSection;

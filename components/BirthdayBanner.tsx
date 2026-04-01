"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, PartyPopper, Star } from 'lucide-react';
import Image from 'next/image';

const MotionImage = motion.create(Image);

interface Particle {
    id: number;
    x: number;
    y: number;
    rotate: number;
    scale: number;
}

interface InteractiveBalloonProps {
    src: string;
    alt: string;
    className: string;
    color: string;
}

const InteractiveBalloon: React.FC<InteractiveBalloonProps> = ({ src, alt, className, color }) => {
    const [isPopped, setIsPopped] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const pop = () => {
        if (isPopped) return;
        setIsPopped(true);
        
        // Criar partículas de confete
        const newParticles = [...Array(16)].map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 250,
            y: (Math.random() - 0.5) * 250,
            rotate: Math.random() * 360,
            scale: Math.random() * 1.5 + 0.5
        }));
        setParticles(newParticles);

        // Respawn após 3 segundos
        setTimeout(() => {
            setIsPopped(false);
            setParticles([]);
        }, 3000);
    };

    return (
        <div className={`${className} flex items-center justify-center`}>
            <AnimatePresence mode="wait">
                {!isPopped ? (
                    <MotionImage
                        key="balloon"
                        src={src} 
                        alt={alt}
                        width={200}
                        height={200}
                        quality={90}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                            opacity: 0.9, 
                            scale: 1,
                            y: [-15, 15, -15],
                            x: [-5, 5, -5],
                            rotate: [-5, 5, -5]
                        }}
                        exit={{ 
                            scale: 2, 
                            opacity: 0,
                            transition: { duration: 0.1 } 
                        }}
                        transition={{ 
                            duration: 5 + Math.random() * 2, 
                            repeat: Infinity, 
                            ease: "easeInOut"
                        }}
                        onClick={pop}
                        className="w-full h-auto object-contain cursor-pointer transition-transform hover:brightness-110 active:scale-95"
                    />
                ) : (
                    <div key="particles" className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                                animate={{ 
                                    x: p.x, 
                                    y: p.y, 
                                    opacity: 0, 
                                    scale: p.scale,
                                    rotate: p.rotate 
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute w-2.5 h-2.5 rounded-sm"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BirthdayBanner = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="py-16 relative overflow-hidden" id="aniversarios">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative bg-gradient-to-br from-[#FF6B00] to-[#FF9100] rounded-[30px] md:rounded-[50px] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 shadow-[0_0_80px_rgba(255,107,0,0.2)]"
                >
                    {mounted && [...Array(8)].map((_, i) => (
                        <motion.div
                            key={`star-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ 
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ 
                                duration: 3 + Math.random() * 2, 
                                repeat: Infinity,
                                delay: Math.random() * 5 
                            }}
                            className="absolute text-yellow-300/20 pointer-events-none hidden md:block"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                        >
                            <Star size={Math.random() * 20 + 10} fill="currentColor" />
                        </motion.div>
                    ))}

                    {mounted && [...Array(12)].map((_, i) => (
                        <motion.div
                            key={`circle-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ 
                                y: [0, -100, 0],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{ 
                                duration: 5 + Math.random() * 5, 
                                repeat: Infinity,
                                delay: Math.random() * 5 
                            }}
                            className="absolute rounded-full pointer-events-none hidden md:block"
                            style={{
                                width: Math.random() * 10 + 5,
                                height: Math.random() * 10 + 5,
                                background: i % 2 === 0 ? '#CB2185' : '#00D4FF',
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}

                    {/* LADO ESQUERDO: IMAGEM DO ANIVERSÁRIO (NIVERC) + BALÕES "SAINDO" DO CARD */}
                    <div className="w-full md:w-[45%] flex justify-center items-end relative h-full self-end -mb-6 md:-mb-10 min-h-[250px] md:min-h-0">
                        {/* Balão Roxo Oficial - Interativo */}
                        <InteractiveBalloon 
                            src="/balon-roxo.png"
                            alt="Balão Roxo"
                            className="absolute -left-10 md:-left-16 bottom-24 md:bottom-40 w-20 md:w-32 z-20"
                            color="#A855F7"
                        />

                        {/* Balão Azul Oficial - Interativo */}
                        <InteractiveBalloon 
                            src="/balon-azul.png"
                            alt="Balão Azul"
                            className="absolute -right-2 md:right-4 bottom-40 md:bottom-56 w-16 md:w-28 z-20"
                            color="#3B82F6"
                        />

                        <div className="relative z-10 overflow-hidden rounded-b-[30px] md:rounded-b-[50px]">
                            <Image 
                                src="/niverc.png" 
                                alt="Aniversário Happy Jumpy"
                                width={600}
                                height={600}
                                quality={85}
                                className="w-[85%] md:w-full h-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* LADO DIREITO: CONTEÚDO TEXTUAL (MAIS COMPACTO) */}
                    <div className="w-full md:w-[55%] text-center md:text-left space-y-6 relative z-10">
                        <div className="space-y-3">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-fredoka font-bold text-xs uppercase tracking-wider"
                            >
                                <PartyPopper size={14} />
                                O Momento Especial
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl font-titan text-white leading-tight">
                                COMEMORE O SEU <br />
                                <span className="text-[#FFD700]">ANIVERSÁRIO</span> <br />
                                CONOSCO!
                            </h2>
                            <p className="text-white/90 font-fredoka text-sm md:text-lg leading-relaxed max-w-[450px]">
                                A Happy Jumpy oferece uma infraestrutura moderna e divertida com pacotes sob medida para sua comemoração. Torne seu dia inesquecível com a gente!
                            </p>
                        </div>

                        <motion.a 
                            href="#contato"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 bg-white text-[#FF6B00] px-8 py-3.5 md:py-4.5 rounded-full font-fredoka font-black text-lg md:text-xl shadow-xl transition-all group overflow-hidden"
                        >
                            <span>SAIBA MAIS</span>
                            <div className="bg-[#FF6B00] text-white rounded-full p-1.5 group-hover:translate-x-1.5 transition-transform">
                                <ChevronRight size={20} />
                            </div>
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BirthdayBanner;

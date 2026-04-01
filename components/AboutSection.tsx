import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const AboutSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Animações de Scroll para Mobile (Stacking Reveal)
    // Card 1 (Rosa): Quase estático
    const y1 = useTransform(scrollYProgress, [0.1, 0.3], [0, 0]);
    // Card 2 (Azul): Começa mais sobreposto e desce
    const y2 = useTransform(scrollYProgress, [0.1, 0.4], [-180, 0]);
    const rotate2 = useTransform(scrollYProgress, [0.1, 0.4], [-3, 0]);
    // Card 3 (Verde): Começa bem mais sobreposto e desce mais
    const y3 = useTransform(scrollYProgress, [0.2, 0.5], [-360, 0]);
    const rotate3 = useTransform(scrollYProgress, [0.2, 0.5], [3, 0]);

    return (
        <section ref={sectionRef} id="sobre" className="py-24 relative">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8 lg:h-[800px]">
                    
                    {/* LADO ESQUERDO: DOIS CARDS STACKED */}
                    <div className="lg:col-span-7 flex flex-col gap-2 md:gap-8 h-full">
                        
                        {/* CARD ROSA - CONHEÇA O PARQUE */}
                        <motion.div 
                            style={{ y: typeof window !== 'undefined' && window.innerWidth < 1024 ? y1 : 0 }}
                            className="flex-1 relative lg:mt-12 group cursor-pointer min-h-[320px] md:min-h-0 z-30"
                        >
                            {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div className="absolute inset-0 bg-[#E60A7E] rounded-[40px] md:rounded-[45px] overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(230,10,126,0.3)]">
                                <Image
                                    src="/elementocard1.png" 
                                    alt="Background Element" 
                                    width={400}
                                    height={400}
                                    className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-full w-auto opacity-5 select-none pointer-events-none object-contain"
                                />
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between p-7 md:p-10 max-w-[55%] md:max-w-[60%]">
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-titan text-white leading-tight">
                                        Conheça o<br />parque
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-sm md:text-lg">
                                        Venha descobrir o maior e mais divertido parque de trampolins da região!
                                    </p>
                                </div>
                                <a 
                                    href="/sobre-nos"
                                    className="w-fit inline-flex items-center px-6 md:px-10 py-3 md:py-4 bg-white text-[#E60A7E] font-fredoka font-black rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-xl text-sm md:text-base"
                                >
                                    Conheça
                                </a>
                            </div>
 
                            {/* Mascote Principal - VAZANDO APENAS PARA CIMA (Ancorado no Bottom) */}
                            <Image
                                src="/imagemdocardprincipal1.png" 
                                alt="Mascote Menina" 
                                width={500}
                                height={600}
                                className="absolute -right-6 md:-right-5 bottom-0 h-[105%] md:h-[135%] w-auto object-contain object-bottom origin-bottom transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none z-20"
                            />
                        </motion.div>

                        {/* CARD AZUL - INGRESSOS (BOTTOM LEFT) */}
                        <motion.div 
                            style={{ 
                                y: typeof window !== 'undefined' && window.innerWidth < 1024 ? y2 : 0,
                                rotate: typeof window !== 'undefined' && window.innerWidth < 1024 ? rotate2 : 0
                            }}
                            className="flex-1 relative lg:mt-6 group cursor-pointer min-h-[320px] md:min-h-0 z-20"
                        >
                            {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div className="absolute inset-0 bg-[#00D4FF] rounded-[40px] md:rounded-[45px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,212,255,0.3)]">
                                <Image
                                    src="/elementocard2.png" 
                                    alt="Background Element" 
                                    width={400}
                                    height={400}
                                    className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-full w-auto opacity-5 select-none pointer-events-none object-contain"
                                />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between p-7 md:p-10 max-w-[55%] md:max-w-[60%]">
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-titan text-white leading-tight">
                                        Ingressos
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-sm md:text-lg">
                                        Garanta sua vaga agora mesmo e venha desafiar a gravidade!
                                    </p>
                                </div>
                                <a 
                                    href="/tickets"
                                    className="w-fit inline-flex items-center px-6 md:px-10 py-3 md:py-4 bg-white text-[#00D4FF] font-fredoka font-black rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-xl text-sm md:text-base"
                                >
                                    Ingressos
                                </a>
                            </div>

                            {/* Mascote Oficial dos Ingressos */}
                            <Image
                                src="/imagemdocardsecundarioprincipal3.png" 
                                alt="Mascote Ingressos" 
                                width={450}
                                height={550}
                                className="absolute -right-6 md:-right-5 bottom-0 h-[105%] md:h-[125%] w-auto object-contain object-bottom origin-bottom transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none z-20"
                            />
                        </motion.div>
                    </div>

                    {/* LADO DIREITO: CARD TALL VERDE (FESTA) */}
                    <div className="lg:col-span-5 h-full pt-2 lg:pt-0">
                        <motion.div 
                            style={{ 
                                y: typeof window !== 'undefined' && window.innerWidth < 1024 ? y3 : 0,
                                rotate: typeof window !== 'undefined' && window.innerWidth < 1024 ? rotate3 : 0
                            }}
                            className="h-full relative group cursor-pointer min-h-[450px] md:min-h-0 z-10"
                        >
                             {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div className="absolute inset-0 bg-[#C4D648] rounded-[40px] md:rounded-[50px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(196,214,72,0.3)]">
                                <Image
                                    src="/elementocard3.png" 
                                    alt="Background Element" 
                                    width={800}
                                    height={800}
                                    className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full opacity-5 select-none pointer-events-none object-contain"
                                />
                            </div>

                            <div className="relative z-30 flex flex-col h-full text-center items-center p-8 md:p-12">
                                <div className="space-y-6">
                                    <h2 className="text-3xl md:text-6xl font-titan text-white leading-tight">
                                        Quer fazer<br />sua festa?
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-base md:text-xl max-w-[300px] mx-auto">
                                        Sabia que você pode fazer sua festa de aniversário com a gente?
                                    </p>
                                </div>
                                <div className="mt-8 md:mt-12">
                                    <a 
                                        href="https://wa.me/5599999999999" 
                                        target="_blank"
                                        className="w-fit inline-flex items-center px-8 md:px-12 py-3 md:py-5 bg-white text-[#C4D648] font-fredoka font-black text-sm md:text-xl rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-2xl"
                                    >
                                        Faça sua festa
                                    </a>
                                </div>
                            </div>

                            {/* Mascote Invertido: Tickets vai para a Festa */}
                            <div className="absolute bottom-0 left-0 w-full flex justify-center z-20 pointer-events-none origin-bottom transition-transform duration-500 group-hover:scale-110">
                                 <Image
                                    src="/imagemdocardsecundarioprincipal2.png" 
                                    alt="Festa Mascote" 
                                    width={500}
                                    height={500}
                                    className="w-[50%] md:w-[70%] h-auto object-contain object-bottom"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

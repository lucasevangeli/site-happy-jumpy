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
        <section ref={sectionRef} id="sobre" className="py-24 relative overflow-hidden">
            {/* Fundo com Degradê Radial Roxo Refinado (Glows Estratégicos) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Glow central grande - Movido para o topo */}
                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-900/30 blur-[180px] rounded-full opacity-60" />
                
                {/* Glow secundário lateral direita */}
                <div className="absolute top-[20%] -right-[15%] w-[700px] h-[700px] bg-indigo-600/20 blur-[160px] rounded-full" />
                
                {/* Glow secundário lateral esquerda - Mais em baixo */}
                <div className="absolute top-[75%] -left-[15%] w-[800px] h-[800px] bg-purple-600/20 blur-[180px] rounded-full opacity-60" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8 lg:h-[800px]">
                    
                    {/* LADO ESQUERDO: DOIS CARDS STACKED */}
                    <div className="lg:col-span-7 flex flex-col gap-2 md:gap-8 h-full">
                        
                        {/* CARD ROSA - CONHEÇA O PARQUE */}
                        <motion.div 
                            style={{ 
                                y: 0, // Estático no Desktop
                                transform: 'translateZ(0)'
                            }}
                            initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 0, y: 50 } : undefined}
                            whileInView={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 1, y: 0 } : undefined}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-1 relative lg:mt-12 group cursor-pointer min-h-[320px] md:min-h-0 z-30 will-change-transform"
                        >
                            {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div 
                                className="absolute inset-0 bg-[#E60A7E] rounded-[40px] md:rounded-[45px] overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(230,10,126,0.3)]"
                                style={{ 
                                    WebkitMaskImage: 'radial-gradient(circle at 100% 60px, transparent 25px, black 26px), radial-gradient(circle at 97% 95px, transparent 32px, black 33px), radial-gradient(circle at 100% 130px, transparent 25px, black 26px)', 
                                    maskImage: 'radial-gradient(circle at 100% 60px, transparent 25px, black 26px), radial-gradient(circle at 97% 95px, transparent 32px, black 33px), radial-gradient(circle at 100% 130px, transparent 25px, black 26px)',
                                    WebkitMaskComposite: 'source-in',
                                    maskComposite: 'intersect'
                                }}
                            >
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
                                    <h2 className="text-2xl md:text-5xl font-titan text-white leading-tight">
                                        Conheça o<br />parque
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-xs md:text-lg">
                                        Venha descobrir o maior e mais divertido parque de trampolins da região!
                                    </p>
                                </div>
                                <a 
                                    href="/sobre-nos"
                                    className="w-fit inline-flex items-center px-5 md:px-10 py-2.5 md:py-4 bg-white text-[#E60A7E] font-fredoka font-black rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-xl text-xs md:text-base"
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
                                y: 0, // Estático no Desktop
                                rotate: 0, // Estático no Desktop
                                transform: 'translateZ(0)'
                            }}
                            initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 0, y: 50 } : undefined}
                            whileInView={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 1, y: 0 } : undefined}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-1 relative lg:mt-6 group cursor-pointer min-h-[320px] md:min-h-0 z-20 will-change-transform"
                        >
                            {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div 
                                className="absolute inset-0 bg-[#00D4FF] rounded-[40px] md:rounded-[45px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,212,255,0.3)]"
                                style={{ 
                                    WebkitMaskImage: 'radial-gradient(circle at 100% 60px, transparent 25px, black 26px), radial-gradient(circle at 97% 95px, transparent 32px, black 33px), radial-gradient(circle at 100% 130px, transparent 25px, black 26px)', 
                                    maskImage: 'radial-gradient(circle at 100% 60px, transparent 25px, black 26px), radial-gradient(circle at 97% 95px, transparent 32px, black 33px), radial-gradient(circle at 100% 130px, transparent 25px, black 26px)',
                                    WebkitMaskComposite: 'source-in',
                                    maskComposite: 'intersect'
                                }}
                            >
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
                                    <h2 className="text-2xl md:text-5xl font-titan text-white leading-tight">
                                        Ingressos
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-xs md:text-lg">
                                        Garanta sua vaga agora mesmo e venha desafiar a gravidade!
                                    </p>
                                </div>
                                <a 
                                    href="/tickets"
                                    className="w-fit inline-flex items-center px-5 md:px-10 py-2.5 md:py-4 bg-white text-[#00D4FF] font-fredoka font-black rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-xl text-xs md:text-base"
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
                                y: 0, // Estático no Desktop
                                rotate: 0, // Estático no Desktop
                                transform: 'translateZ(0)'
                            }}
                            initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 0, y: 50 } : undefined}
                            whileInView={typeof window !== 'undefined' && window.innerWidth < 1024 ? { opacity: 1, y: 0 } : undefined}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full relative group cursor-pointer min-h-[450px] md:min-h-0 z-10 will-change-transform"
                        >
                             {/* Card Color Background com Clipping para o elemento de fundo */}
                            <div 
                                className="absolute inset-0 bg-[#C4D648] rounded-[40px] md:rounded-[50px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(196,214,72,0.3)]"
                                style={{ 
                                    WebkitMaskImage: 'radial-gradient(circle at 100% 80px, transparent 35px, black 36px), radial-gradient(circle at 96% 120px, transparent 45px, black 46px), radial-gradient(circle at 100% 160px, transparent 35px, black 36px)', 
                                    maskImage: 'radial-gradient(circle at 100% 80px, transparent 35px, black 36px), radial-gradient(circle at 96% 120px, transparent 45px, black 46px), radial-gradient(circle at 100% 160px, transparent 35px, black 36px)',
                                    WebkitMaskComposite: 'source-in',
                                    maskComposite: 'intersect'
                                }}
                            >
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
                                    <h2 className="text-2xl md:text-6xl font-titan text-white leading-tight">
                                        Quer fazer<br />sua festa?
                                    </h2>
                                    <p className="text-white/80 font-fredoka text-sm md:text-xl max-w-[250px] mx-auto">
                                        Sabia que você pode fazer sua festa de aniversário com a gente?
                                    </p>
                                </div>
                                <div className="mt-8 md:mt-12">
                                    <a 
                                        href="https://wa.me/5599999999999" 
                                        target="_blank"
                                        className="w-fit inline-flex items-center px-6 md:px-12 py-3 md:py-5 bg-white text-[#C4D648] font-fredoka font-black text-xs md:text-xl rounded-full transition-all group-hover:scale-110 active:scale-95 shadow-2xl"
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

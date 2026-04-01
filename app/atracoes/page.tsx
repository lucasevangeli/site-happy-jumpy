import React from 'react';
import Header from '@/components/Header';
import { Metadata } from 'next';
import { Zap, Target, Flame, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atrações | Explore o Parque Happy Jumpy',
  description: 'Descubra todas as atrações do nosso parque de trampolins: Free Jump, Piscina de Espuma, Ninja Course e muito mais. Diversão garantida!',
};

const attractions = [
  {
    title: 'Free Jump',
    description: 'Nossa área principal com trampolins conectados para você pular, dar piruetas e voar livremente em um ambiente totalmente seguro.',
    icon: <Zap className="w-8 h-8 text-[#CB2185]" />,
    color: 'from-[#CB2185] to-[#602BAF]'
  },
  {
    title: 'Piscina de Espuma',
    description: 'Aperte o play na adrenalina! Salte de trampolins diretamente em uma piscina gigante com milhares de cubos de espuma macia.',
    icon: <Star className="w-8 h-8 text-[#00D4FF]" />,
    color: 'from-[#00D4FF] to-[#602BAF]'
  },
  {
    title: 'Ninja Course',
    description: 'Um desafio para os mais corajosos. Teste sua agilidade, força e equilíbrio em um circuito de obstáculos de alto nível.',
    icon: <Flame className="w-8 h-8 text-[#DC822F]" />,
    color: 'from-[#DC822F] to-[#CB2185]'
  },
  {
    title: 'Dodgeball Player',
    description: 'O clássico "Queimada" elevado a outro nível. Use os trampolins para desviar das bolas e atacar os adversários com saltos incríveis.',
    icon: <Target className="w-8 h-8 text-[#C4D648]" />,
    color: 'from-[#C4D648] to-[#602BAF]'
  }
];

export default function AtracoesPage() {
  return (
    <main className="bg-black min-h-screen pt-32">
      <Header />
      <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
        <h1 className="text-5xl md:text-8xl font-titan text-white mb-6">
          Nossas <span className="bg-gradient-to-r from-[#CB2185] to-[#00D4FF] bg-clip-text text-transparent">Atrações</span>
        </h1>
        <p className="text-xl text-gray-400 font-fredoka max-w-2xl mx-auto mb-20">
          Prepare-se para desafiar a gravidade. No Happy Jumpy, cada canto é uma nova aventura esperando por você.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {attractions.map((attr, idx) => (
            <div 
              key={idx}
              className="group relative bg-white/5 border border-white/10 p-8 rounded-[40px] hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${attr.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[40px]`} />
              
              <div className="mb-6 inline-flex p-4 bg-black/40 rounded-2xl border border-white/5 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {attr.icon}
              </div>

              <h3 className="text-2xl font-titan text-white mb-4">
                {attr.title}
              </h3>
              
              <p className="text-gray-400 font-fredoka leading-relaxed">
                {attr.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 p-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-[50px] border-2 border-purple-500/20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
          <h2 className="text-4xl font-titan text-white mb-6 relative">
            E muito mais aventuras esperando por você!
          </h2>
          <button className="px-8 py-4 bg-white text-black font-fredoka font-bold rounded-full hover:scale-105 transition-transform">
            Reserve seu Horário
          </button>
        </div>
      </div>
    </main>
  );
}

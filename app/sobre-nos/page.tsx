import React from 'react';
import Header from '@/components/Header';
import { Metadata } from 'next';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Sobre Nós | Happy Jumpy Trampolim Park',
  description: 'Conheça a história da Happy Jumpy, o maior e mais moderno parque de trampolins da região. Nossa missão é levar diversão e saúde para toda a família.',
};

export default function SobreNosPage() {
  return (
    <main className="bg-black min-h-screen pt-32">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-20">
        <div className="inline-block mb-6">
          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-fredoka font-bold">
            Institucional
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-titan text-white mb-10 leading-tight">
          Nossa <span className="bg-gradient-to-r from-[#CB2185] to-[#602BAF] bg-clip-text text-transparent">História</span>
        </h1>

        <div className="prose prose-invert prose-lg max-w-none space-y-8 font-fredoka text-gray-300">
          <p className="text-xl leading-relaxed">
            A Happy Jumpy nasceu de um sonho: criar um espaço onde a gravidade não fosse um limite, mas sim um convite para a liberdade. 
            Inaugurado com o objetivo de ser o maior e mais moderno parque de trampolins da região, hoje somos referência em entretenimento familiar.
          </p>

          <div className="relative rounded-3xl overflow-hidden border-2 border-[#602BAF]/30 my-12 h-[400px]">
            <Image 
              src="/sobre-img.jpg" 
              alt="Ambiente Happy Jumpy" 
              fill
              priority
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-titan text-white mb-4">Nossa Missão</h3>
              <p>Proporcionar momentos inesquecíveis através da prática de atividades físicas divertidas, promovendo saúde, bem-estar e muita alegria para todas as idades.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-titan text-white mb-4">Nossa Visão</h3>
              <p>Ser o principal destino de lazer e celebração da região, reconhecido pela inovação constante e pelo rigoroso padrão de segurança de nossas atrações.</p>
            </div>
          </div>

          <p className="border-l-4 border-[#CB2185] pl-6 italic text-2xl text-white font-medium">
            "Na Happy Jumpy, cada pulo é uma nova história de felicidade."
          </p>

          <p>
            Com mais de 2.000m² de área, contamos com monitores treinados e uma infraestrutura completa para receber festas, eventos corporativos ou apenas aquela tarde de diversão com os amigos. 
            Venha nos visitar e descubra por que somos o lugar onde a alegria não tem fim!
          </p>
        </div>
      </div>
    </main>
  );
}

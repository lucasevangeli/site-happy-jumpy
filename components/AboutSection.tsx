"use client";

import React from 'react';
import { Shield, Users, Trophy, Heart } from 'lucide-react';

const AboutSection = () => {
  const stats = [
    { icon: Users, value: '50K+', label: 'Clientes Felizes' },
    { icon: Trophy, value: '15+', label: 'Atrações' },
    { icon: Shield, value: '100%', label: 'Segurança' },
    { icon: Heart, value: '4.9', label: 'Avaliação' },
  ];

  return (
    <section id="sobre" className="py-24 bg-gradient-to-b from-black to-purple-950/20 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-600 rounded-3xl blur-3xl opacity-20" />
            <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-purple-500/30">
              <img
                src="https://images.pexels.com/photos/6224386/pexels-photo-6224386.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Happy Jumpy Trampolim Park"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 bg-green-400/20 border border-green-400 rounded-full text-green-400 text-sm font-semibold">
                Sobre Nós
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="text-white">A Melhor Experiência em</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
                Trampolim Park
              </span>
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              A Happy Jumpy é o maior e mais moderno parque de trampolins da região. Com mais de 2.000m² de pura diversão,
              oferecemos uma experiência única e segura para todas as idades.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed">
              Nossa missão é proporcionar momentos inesquecíveis através da prática de atividades físicas divertidas,
              promovendo saúde, bem-estar e muita alegria para toda a família.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 text-center space-y-2"
                >
                  <stat.icon className="w-8 h-8 text-green-400 mx-auto" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

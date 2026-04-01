import React from 'react';
import Header from '@/components/Header';
import { Metadata } from 'next';
import { ShieldCheck, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Regras e Segurança | Happy Jumpy',
  description: 'Confira as regras essenciais para garantir sua diversão com segurança na Happy Jumpy. Saiba mais sobre vestimentas, conduta e termos de uso.',
};

const rules = [
  {
    category: 'Segurança Essencial',
    items: [
      'Uso obrigatório de meias antiderrapantes Happy Jumpy.',
      'Esvazie os bolsos completamente antes de entrar nos trampolins.',
      'Não é permitido saltar sob efeito de álcool ou substâncias ilícitas.',
      'Atenção às orientações dos monitores em tempo integral.'
    ],
    icon: <ShieldCheck className="w-6 h-6 text-green-400" />
  },
  {
    category: 'Conduta no Trampolim',
    items: [
      'Apenas uma pessoa por trampolim em cada salto.',
      'Não tente manobras arriscadas sem o treinamento adequado.',
      'Mantenha distância segura de outros saltadores.',
      'Não salte ou pouse nos protetores de mola azuis.'
    ],
    icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />
  },
  {
    category: 'Informações Gerais',
    items: [
      'Crianças menores de 5 anos devem estar acompanhadas por um adulto.',
      'Respeite o tempo limite da sua sessão de salto.',
      'Não é permitida a entrada com alimentos ou bebidas na área de salto.',
      'Guarde seus pertences nos armários disponíveis.'
    ],
    icon: <Info className="w-6 h-6 text-blue-400" />
  }
];

export default function RegrasPage() {
  return (
    <main className="bg-black min-h-screen pt-32">
      <Header />
      <div className="container mx-auto px-4 max-w-4xl py-20">
        <h1 className="text-5xl md:text-7xl font-titan text-white mb-10 text-center leading-tight">
          Nossas <span className="text-[#C8D40B]">Regras</span>
        </h1>
        
        <p className="text-xl text-gray-400 font-fredoka text-center mb-16">
          Sua diversão é nossa prioridade, mas sua segurança é nosso compromisso inegociável.
        </p>

        <div className="space-y-12">
          {rules.map((section, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-[35px] p-8 md:p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(section.icon as React.ReactElement, { className: "w-24 h-24" })}
              </div>
              
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-white/10 rounded-xl">
                  {section.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-titan text-white">
                  {section.category}
                </h2>
              </div>

              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-gray-300 font-fredoka text-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#CB2185]/20 border border-[#CB2185] rounded-3xl p-8 text-center">
            <h3 className="text-xl font-titan text-white mb-2">Termos de Responsabilidade</h3>
            <p className="text-gray-300 font-fredoka">
                Ao entrar no parque, você concorda com nossos termos de uso e segurança. 
                Lembre-se: saltar é uma atividade física intensa, respeite seus limites!
            </p>
        </div>
      </div>
    </main>
  );
}

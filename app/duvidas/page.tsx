import React from 'react';
import Header from '@/components/Header';
import { Metadata } from 'next';
import { HelpCircle, ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Dúvidas Frequentes (FAQ) | Happy Jumpy',
  description: 'Tire todas as suas dúvidas sobre o parque Happy Jumpy. Informações sobre ingressos, horários, roupas permitidas, festas de aniversário e muito mais.',
};

const faqs = [
  {
    question: "Preciso fazer reserva antes de ir?",
    answer: "Recomendamos fortemente a compra antecipada em nosso site para garantir sua vaga, especialmente aos finais de semana e feriados. No entanto, também vendemos ingressos no balcão, sujeitos à disponibilidade."
  },
  {
    question: "Existe idade mínima para pular?",
    answer: "O Happy Jumpy é para todas as idades! No entanto, crianças menores de 5 anos devem estar acompanhadas por um adulto pagante na área de trampolins para garantir total segurança."
  },
  {
    question: "Qual roupa devo usar?",
    answer: "Recomendamos roupas esportivas confortáveis (leggings, bermudas leves e camisetas). É proibido o uso de jeans com botões ou rebites metálicos, cintos e joias que possam danificar os trampolins ou causar ferimentos."
  },
  {
    question: "As meias antiderrapantes são obrigatórias?",
    answer: "Sim! Por questões de segurança e higiene, o uso de meias antiderrapantes Happy Jumpy é obrigatório. Elas podem ser adquiridas em nosso site ou diretamente no balcão do parque e são reutilizáveis."
  },
  {
    question: "Como funcionam as festas de aniversário?",
    answer: "Temos pacotes exclusivos para festas que incluem área reservada, ingressos de salto, alimentação e decoração. Para orçamentos, entre em contato conosco pelo WhatsApp ou pela nossa página de contato."
  },
  {
    question: "O parque abre em dias de chuva?",
    answer: "Sim! Somos um parque totalmente coberto e climatizado. A diversão aqui não para nunca, faça chuva ou faça sol."
  }
];

export default function FAQPage() {
  return (
    <main className="bg-black min-h-screen pt-32">
      <Header />
      <div className="container mx-auto px-4 max-w-3xl py-20">
        <div className="text-center mb-16">
            <div className="inline-flex p-4 bg-[#602BAF]/20 rounded-2xl border border-[#602BAF]/30 mb-6 font-fredoka">
                <HelpCircle className="w-8 h-8 text-[#00D4FF]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-titan text-white mb-6 leading-tight">
                Dúvidas <span className="text-[#00D4FF]">Frequentes</span>
            </h1>
            <p className="text-xl text-gray-400 font-fredoka">
                Encontre aqui tudo o que você precisa saber para sua próxima aventura.
            </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-purple-500/10">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-white/10 last:border-0 pb-2">
                <AccordionTrigger className="text-left py-6 hover:no-underline font-titan text-xl text-white hover:text-[#00D4FF] transition-colors group">
                  <div className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-[#602BAF] transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 font-fredoka text-lg leading-relaxed pl-8 pt-2 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-20 text-center">
            <p className="text-gray-400 font-fredoka mb-4">Ainda tem dúvidas? Fale conosco!</p>
            <div className="flex justify-center space-x-6">
                <a href="#contato" className="text-white hover:text-[#00D4FF] font-titan transition-colors">WhatsApp</a>
                <span className="text-gray-600">|</span>
                <a href="mailto:contato@happyjumpy.com" className="text-white hover:text-[#00D4FF] font-titan transition-colors">E-mail</a>
            </div>
        </div>
      </div>
    </main>
  );
}

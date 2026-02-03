"use client";

import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'Av. Diversão, 1000 - Centro, São Paulo - SP',
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: '(11) 9 9999-9999',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contato@happyjumpy.com.br',
    },
    {
      icon: Clock,
      title: 'Horário',
      content: 'Seg-Dom: 09:00 - 22:00',
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <section id="contato" className="py-24 bg-gradient-to-b from-purple-950/20 to-black relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-green-400/20 border border-green-400 rounded-full text-green-400 text-sm font-semibold">
              Entre em Contato
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Fale Conosco
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tem dúvidas? Estamos aqui para ajudar! Entre em contato conosco
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{info.title}</h3>
                  <p className="text-gray-400 text-sm">{info.content}</p>
                </div>
              ))}
            </div>

            <div className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Siga-nos nas Redes Sociais</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-purple-500/30 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0977631494243!2d-46.65382668502213!3d-23.561414984687654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1sen!2sbr!4v1234567890123!5m2!1sen!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Envie uma Mensagem</h3>
            <form className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Seu Nome"
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Seu Email"
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Seu Telefone"
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Sua Mensagem"
                  rows={5}
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-green-400 to-purple-600 hover:from-green-500 hover:to-purple-700 text-white font-semibold py-6 text-lg">
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 max-w-7xl mt-16 pt-8 border-t border-purple-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">
            © 2024 Happy Jumpy. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-green-400 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default ContactSection;

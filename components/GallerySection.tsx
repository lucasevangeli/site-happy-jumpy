"use client";

import React from 'react';

const GallerySection = () => {
  const images = [
    {
      url: 'https://images.pexels.com/photos/6224386/pexels-photo-6224386.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Área de Trampolins',
    },
    {
      url: 'https://images.pexels.com/photos/3671083/pexels-photo-3671083.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Piscina de Espuma',
    },
    {
      url: 'https://images.pexels.com/photos/8612977/pexels-photo-8612977.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Área Kids',
    },
    {
      url: 'https://images.pexels.com/photos/6224384/pexels-photo-6224384.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Dodgeball Arena',
    },
    {
      url: 'https://images.pexels.com/photos/3671086/pexels-photo-3671086.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Freestyle Zone',
    },
    {
      url: 'https://images.pexels.com/photos/8612979/pexels-photo-8612979.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Basketball Jump',
    },
  ];

  return (
    <section id="galeria" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-semibold">
              Nossa Galeria
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">
              Veja Nossas Atrações
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Descubra todas as áreas e atividades que preparamos para você se divertir
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-white font-bold text-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {image.title}
                </h3>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-400 rounded-2xl transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;

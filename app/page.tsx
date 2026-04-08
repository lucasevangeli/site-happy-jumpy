"use client";

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ProductsSection from '@/components/ProductsSection';
import CombosSection from '@/components/CombosSection';
import GallerySection from '@/components/GallerySection';
import ContactSection from '@/components/ContactSection';
import AttractionsSection from '@/components/AttractionsSection';
import FoamSection from '@/components/FoamSection';
import BirthdayBanner from '@/components/BirthdayBanner';

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <AttractionsSection />
      <FoamSection />
      <BirthdayBanner />
      <ProductsSection />
      <CombosSection />
      <GallerySection />
      <ContactSection />
    </main>
  );
}

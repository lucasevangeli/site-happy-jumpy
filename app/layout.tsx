import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Happy Jumpy - Trampolim Park | Diversão para Toda Família',
  description: 'O maior parque de trampolins da região! Diversão garantida para todas as idades com mais de 15 atrações. Venha pular, voar e se divertir na Happy Jumpy!',
  keywords: 'trampolim park, happy jumpy, parque de trampolins, diversão, atividades físicas, família, pular, trampolim, são paulo',
  authors: [{ name: 'Happy Jumpy' }],
  openGraph: {
    title: 'Happy Jumpy - Trampolim Park',
    description: 'O maior parque de trampolins da região! Diversão garantida para todas as idades.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Happy Jumpy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Jumpy - Trampolim Park',
    description: 'O maior parque de trampolins da região! Diversão garantida para todas as idades.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </CartProvider>
      </body>
    </html>
  );
}

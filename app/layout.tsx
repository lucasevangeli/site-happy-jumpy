import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UIProvider } from '@/contexts/UIContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
//... (metadata content remains the same)
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
        <UIProvider> {/* Envolver com UIProvider */}
          <CartProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" theme="dark" />
            </AuthProvider>
          </CartProvider>
        </UIProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { UIProvider } from '@/contexts/UIContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Zain:wght@200;300;400;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
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

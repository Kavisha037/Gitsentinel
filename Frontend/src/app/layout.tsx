import type { Metadata } from 'next';
import './globals.css';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { AuthModalManagerProvider } from '@/components/auth/AuthModalManager';

export const metadata: Metadata = {
  title: 'GitSentinel | AI Behavioral Risk Assessment',
  description: 'GitSentinel provides autonomous behavioral risk assessment for software ecosystems, identifying supply chain anomalies before they compromise your stack.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen relative overflow-x-hidden bg-[#050608]">
        <FirebaseClientProvider>
          <AuthModalManagerProvider>
            <InteractiveBackground />
            <Navbar />
            <main className="pt-24 min-h-screen relative z-10">
              {children}
            </main>
            <Toaster />
          </AuthModalManagerProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

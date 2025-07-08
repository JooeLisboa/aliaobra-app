import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { MainSidebar } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/footer';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'AliaObra',
  description: 'AliaObra: Encontre os melhores prestadores de serviço para sua obra.',
};

const ContentHeader = () => {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <div className="md:hidden">
                <SidebarTrigger />
             </div>
        </header>
    );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
            <MainSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <ContentHeader />
                <main className="flex-grow p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
                <Footer />
            </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

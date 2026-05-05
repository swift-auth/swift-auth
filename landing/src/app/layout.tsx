import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const dmSans = DM_Sans({
   subsets: ['latin'],
   variable: '--font-sans',
   display: 'swap',
});

const geistMono = Geist_Mono({
   subsets: ['latin'],
   variable: '--font-mono',
});

export const metadata: Metadata = {
   title: 'swift-auth',
   description: 'A lightweight, type-safe authentication library',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html
         lang="en"
         className={`${dmSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
         <body className="min-h-full bg-background text-foreground font-sans">
            <Navbar />
            {children}
         </body>
      </html>
   );
}

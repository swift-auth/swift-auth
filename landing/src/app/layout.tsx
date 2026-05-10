import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';

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
   title: {
      default: 'Authio',
      template: '%s | Authio',
   },
   description:
      'Type-safe authentication built for developers who want simplicity, flexibility, and control without hidden abstractions or framework lock-in.',
   keywords: [
      'authentication',
      'auth',
      'typescript',
      'node.js',
      'express',
      'react',
      'drizzle',
      'prisma',
      'jwt',
      'oauth',
      'sessions',
   ],
   authors: [{ name: 'Dipan Chakraborty' }],
   creator: 'Dipan Chakraborty',
   metadataBase: new URL('https://authio.dev'),
   openGraph: {
      title: 'Authio',
      description:
         'Type-safe authentication built for developers who want simplicity, flexibility, and control without hidden abstractions or framework lock-in.',
      url: 'https://authio.dev',
      siteName: 'Authio',
      type: 'website',
   },
   robots: {
      index: true,
      follow: true,
   },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html
         lang="en"
         className={`${dmSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
         <body className="min-h-full bg-background text-foreground  font-sans">{children}</body>
      </html>
   );
}

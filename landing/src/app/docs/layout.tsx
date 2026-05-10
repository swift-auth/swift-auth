import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DocsSidebar } from '@/components/docs/Sidebar';

export const metadata: Metadata = {
   title: {
      default: 'Docs',
      template: '%s | Authio Docs',
   },
   description: 'Authio documentation — installation, configuration, and API reference.',
};

interface DocsLayoutProps {
   children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
   return (
      <SidebarProvider>
         <DocsSidebar />
         <SidebarInset>
            <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur">
               <SidebarTrigger />
            </header>
            <main className="mx-auto w-full max-w-4xl px-6 py-10">{children}</main>
         </SidebarInset>
      </SidebarProvider>
   );
}

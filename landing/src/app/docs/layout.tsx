import type { ReactNode } from 'react';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { DocsSidebar } from '@/components/docs/Sidebar';

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

            <main className="mx-auto w-full max-w-4xl px-2 py-10">
               <main className="mx-auto w-full max-w-4xl px-0 py-10">{children}</main>
            </main>
         </SidebarInset>
      </SidebarProvider>
   );
}

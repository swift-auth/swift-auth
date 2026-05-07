'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const gettingStarted = [
   { title: 'Installation', href: '/docs/installation' },
   { title: 'Quick Start', href: '/docs/quick-start' },
   { title: 'Providers', href: '/docs/providers' },
];
const authentication = [
   { title: 'Email & Password', href: '/docs/authentication/email-password' },
   { title: 'Google', href: '/docs/authentication/google' },
   { title: 'GitHub', href: '/docs/authentication/github' },
];
const reference = [{ title: 'Configuration', href: '/docs/configuration' }];

export function DocsSidebar() {
   const pathname = usePathname();
   return (
      <Sidebar>
         <SidebarHeader className="border-b border-border px-6 py-4">
            <Link href="/">
               <Image src="/logo.svg" alt="Swift Auth" width={124} height={124} />
            </Link>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {gettingStarted.map((item) => (
                        <SidebarMenuItem key={item.href}>
                           <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>{item.title}</Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel>Authentication</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {authentication.map((item) => (
                        <SidebarMenuItem key={item.href}>
                           <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>{item.title}</Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel>Reference</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {reference.map((item) => (
                        <SidebarMenuItem key={item.href}>
                           <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>{item.title}</Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarFooter className="border-t border-border p-4">
            <Button className="w-full" asChild>
               <a
                  href="https://github.com/your-org/swift-auth"
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  <Image src="/github.svg" alt="GitHub" width={16} height={16} />
                  View on GitHub
               </a>
            </Button>
         </SidebarFooter>
      </Sidebar>
   );
}

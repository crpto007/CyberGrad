
'use client';

import {
  Home,
  LayoutDashboard,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  ShieldCheck
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b p-3">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <ShieldCheck className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-headline tracking-tighter text-primary group-data-[collapsible=icon]:hidden">
              CyberGrad
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/')}
                tooltip={{ children: 'Home', side: 'right', align: 'center' }}
              >
                <Link href="/" prefetch={false}>
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard')}
                tooltip={{
                  children: 'Dashboard',
                  side: 'right',
                  align: 'center',
                }}
              >
                <Link href="/dashboard" prefetch={false}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/chatbot')}
                tooltip={{
                  children: 'Chatbot',
                  side: 'right',
                  align: 'center',
                }}
              >
                <Link href="/chatbot" prefetch={false}>
                  <MessageCircle />
                  <span>Chatbot</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

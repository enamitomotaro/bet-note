"use client";

import { AppHeader } from '@/components/AppHeader';
import { DashboardSidebarNav } from '@/components/DashboardSidebarNav';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarContent className="p-2">
          <DashboardSidebarNav />
        </SidebarContent>
        {/* You can add a footer to the sidebar if needed */}
        {/* <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </SidebarFooter> */}
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

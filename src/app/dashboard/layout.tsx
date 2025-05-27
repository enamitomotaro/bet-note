"use client";

import { AppHeader } from '@/components/AppHeader';
import { DashboardSidebarNav, navItems } from '@/components/DashboardSidebarNav'; // navItems をインポート
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation'; // usePathname をインポート

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentNavItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentNavItem ? currentNavItem.label : "競馬エース"; // デフォルトタイトルを設定

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarContent className="p-2">
          <DashboardSidebarNav />
        </SidebarContent>
        {/* <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </SidebarFooter> */}
      </Sidebar>
      <SidebarInset>
        <AppHeader pageTitle={pageTitle} /> {/* pageTitle を AppHeader に渡す */}
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
          {children}
        </main>
        <footer className="border-t py-4">
          <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} 競馬エース. All rights reserved.
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

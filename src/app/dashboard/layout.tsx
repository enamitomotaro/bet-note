"use client";

import { AppHeader } from '@/components/AppHeader';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Home, ListPlus, Brain } from 'lucide-react';

// navItemsをここに移動
export const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/dashboard/entries', label: '収支記録', icon: ListPlus },
  { href: '/dashboard/ai-predictor', label: 'AI予想', icon: Brain },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentNavItem = navItems.find(item => item.href === pathname);
  const pageTitle = currentNavItem ? currentNavItem.label : "競馬エース";

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader pageTitle={pageTitle} navItems={navItems} />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
        {children}
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 競馬エース. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

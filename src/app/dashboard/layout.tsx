
"use client";

import { AppHeader } from '@/components/AppHeader';
// Removed usePathname and useRouter as they are now primarily used within AppHeader
import type { LucideIcon } from 'lucide-react';
import { Home, ListPlus, Brain } from 'lucide-react';
// Removed Tabs, TabsList, TabsTrigger imports

export const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/dashboard/entries', label: '収支記録', icon: ListPlus },
  { href: '/dashboard/ai-predictor', label: 'AI予想', icon: Brain },
];

const APP_NAME = "BetNote";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname(); // No longer needed here
  // pageTitle calculation is no longer needed here as AppHeader will not display it
  // const currentNavItem = navItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
  // const pageTitle = currentNavItem ? currentNavItem.label : APP_NAME;

  // handleTabChange is no longer needed

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pass navItems to AppHeader; pageTitle is no longer passed */}
      <AppHeader appName={APP_NAME} navItems={navItems} />
      <div className="container mx-auto px-4 md:px-8 py-6">
        {/* Tabs navigation removed from here */}
        <main className="flex-grow space-y-8">
          {children}
        </main>
      </div>
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

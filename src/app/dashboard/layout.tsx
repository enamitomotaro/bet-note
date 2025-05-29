
"use client";

import { AppHeader } from '@/components/AppHeader';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Home, ListPlus, Brain } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const router = useRouter();

  const currentNavItem = navItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
  const pageTitle = currentNavItem ? currentNavItem.label : "GallopTrack"; // Updated app name

  const handleTabChange = (value: string) => {
    router.push(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader pageTitle={pageTitle} appName="GallopTrack" />
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex justify-center mb-6 md:mb-8">
          <Tabs value={currentNavItem?.href || '/dashboard'} onValueChange={handleTabChange} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 gap-2 md:inline-flex md:w-auto">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.href}
                  value={item.href}
                  className="w-full md:w-auto px-2 py-2 text-xs md:text-sm md:px-4 md:py-2"
                >
                  <item.icon className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline min-w-32">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <main className="flex-grow space-y-8">
          {children}
        </main>
      </div>
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GallopTrack. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

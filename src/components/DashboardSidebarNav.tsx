"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListPlus, Brain, Trophy } from 'lucide-react'; // PanelLeft は不要なので削除
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

export const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/dashboard/entries', label: '収支記録', icon: ListPlus },
  { href: '/dashboard/ai-predictor', label: 'AI予想', icon: Brain },
];

export function DashboardSidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar(); // toggleSidebar はここで直接使わないので削除

  return (
    <>
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 flex-grow">
          <Trophy className="h-7 w-7 text-primary" />
          {state === 'expanded' && <span className="text-xl font-semibold text-primary">競馬エース</span>}
        </Link>
        {state === 'expanded' && <SidebarTrigger className="hidden md:flex" />}
      </SidebarHeader>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={state === 'collapsed' ? item.label : undefined}
                className={cn(
                  state === 'collapsed' && "justify-center"
                )}
              >
                <a>
                  <item.icon className="h-5 w-5" />
                  {state === 'expanded' && <span>{item.label}</span>}
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}

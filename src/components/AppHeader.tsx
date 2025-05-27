"use client";
import { Trophy } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppHeader() {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        {isMobile && <SidebarTrigger />}
        <Trophy className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-primary">競馬エース</h1>
      </div>
    </header>
  );
}


"use client";
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppHeaderProps {
  pageTitle: string;
}

export function AppHeader({ pageTitle }: AppHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-10">
        {/* Left section: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0">
          <Trophy className="h-7 w-7" />
          <span className="text-xl font-semibold hidden sm:inline">競馬エース</span>
        </Link>

        {/* Mobile: Page title, centered. Right placeholder to help centering. */}
        {isMobile && (
          <>
            <h1 className="text-lg font-medium text-foreground text-center flex-grow mx-2 truncate">
              {pageTitle}
            </h1>
            {/* Placeholder to balance logo for centering title, matches Trophy icon size */}
            <div className="w-7 h-7 shrink-0"></div> 
          </>
        )}
        {/* Desktop: No title in header, and nothing on the right by default. 
            Future user actions (e.g., profile icon) could be added here.
        */}
      </div>
    </header>
  );
}

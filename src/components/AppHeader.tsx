"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppHeaderProps {
  pageTitle: string;
  navItems: NavItem[];
}

export function AppHeader({ pageTitle, navItems }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-10"> {/* Added h-10 for consistent height */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0">
          <Trophy className="h-7 w-7" />
          <span className="text-xl font-semibold hidden sm:inline">競馬エース</span>
        </Link>

        {isMobile ? (
          <>
            <h1 className="text-lg font-medium text-foreground text-center flex-grow mx-2 truncate">{pageTitle}</h1>
            <SidebarTrigger />
          </>
        ) : (
          <nav className="flex items-center gap-1 mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        {/* Ensures the logo and mobile trigger don't get squished if nav items are too many on desktop, by making nav take available space but not push others */}
        {!isMobile && <div className="w-auto shrink-0"></div>}

      </div>
    </header>
  );
}

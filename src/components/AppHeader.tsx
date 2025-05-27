"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy } from 'lucide-react';
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
      <div className="container mx-auto flex items-center justify-between h-10">
        {/* Left section: Logo and (on desktop) navigation */}
        <div className="flex items-center gap-x-4 md:gap-x-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0">
            <Trophy className="h-7 w-7" />
            <span className="text-xl font-semibold hidden sm:inline">競馬エース</span>
          </Link>

          {!isMobile && ( // Desktop navigation
            <nav className="flex items-center gap-1"> {/* Nav items appear after logo, no mx-auto */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground" // Active state
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground" // Inactive state
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile: Page title, centered using flex-grow */}
        {isMobile && (
          <h1 className="text-lg font-medium text-foreground text-center flex-grow mx-2 truncate">
            {pageTitle}
          </h1>
        )}

        {/* Right section: Placeholder for future desktop items (e.g., user profile) */}
        {/* {!isMobile && <div className="flex items-center"> User Actions </div>} */}
      </div>
    </header>
  );
}

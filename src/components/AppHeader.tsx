
"use client";
import Link from 'next/link';
import { Ticket, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppHeaderProps {
  appName: string;
  navItems: NavItem[];
}

export function AppHeader({ appName, navItems }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    // For '/dashboard', match exactly. For others, match by startsWith.
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Left: Logo and App Name */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0">
          <Ticket className="h-7 w-7" />
          <span className="text-xl font-semibold">{appName}</span>
        </Link>

        {/* Desktop Navigation (Centered) */}
        {!isMobile && (
          <nav className="flex items-center space-x-1 mx-auto"> {/* mx-auto for centering */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors px-3 py-2 rounded-md",
                  isActive(item.href)
                    ? "bg-muted text-primary" // Active style
                    : "text-muted-foreground hover:bg-muted/50 hover:text-primary" // Inactive style
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile Menu Button (Right) or Desktop Right Placeholder */}
        {isMobile ? (
          <div className="md:hidden"> {/* This div ensures button is on the right on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">ナビゲーションを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "cursor-pointer",
                      isActive(item.href) ? "bg-muted font-medium" : ""
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Desktop Right placeholder (to balance the logo if nav is truly centered by mx-auto on nav)
          <div className="flex w-auto items-center justify-end shrink-0">
             {/* This div acts as a spacer on desktop to help center the nav. */}
             {/* Adjust width or content if you add user icons etc. */}
             <div className="w-7 h-7"></div> {/* Placeholder to roughly balance the logo width */}
          </div>
        )}
      </div>
    </header>
  );
}

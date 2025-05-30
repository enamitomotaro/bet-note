
"use client";
import Link from 'next/link';
import { Ticket, Menu, PlusCircle } from 'lucide-react';
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppHeaderProps {
  appName: string;
  navItems: NavItem[];
  onOpenAddEntryDialog: () => void;
}

export function AppHeader({ appName, navItems, onOpenAddEntryDialog }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Left: Logo and App Name */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0">
          <Ticket className="h-7 w-7" />
          <span className="text-xl font-semibold">{appName}</span>
        </Link>

        {/* Desktop Navigation (Center) */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1 mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors px-3 py-2 rounded-md",
                  isActive(item.href)
                    ? "bg-muted text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        
        {/* Right: Action Buttons / Mobile Menu */}
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenAddEntryDialog}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              新規記録
            </Button>
          )}

          {isMobile ? (
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenAddEntryDialog} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>新規記録</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Placeholder for desktop right if no other actions exist to balance layout.
            // If the "新規記録" button is the only item, this div might not be strictly necessary,
            // as the nav is centered by mx-auto.
            // <div className="w-7 h-7 md:w-auto"></div> 
            null 
          )}
        </div>
      </div>
    </header>
  );
}

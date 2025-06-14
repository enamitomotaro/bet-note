"use client";
import Link from "next/link";
import { Ticket, Menu, PlusCircle, Settings, Moon, Sun } from "lucide-react"; // Settings を追加
import { useIsMobile } from "@/hooks/use-mobile";
import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDashboardDialog } from "@/contexts/DashboardDialogContext"; // ダイアログ用コンテキストを追加
import { useSupabase } from "@/contexts/SupabaseProvider";
import useTheme from "@/hooks/useTheme";
import ThemeToggleButton from "./ThemeToggleButton";

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

export function AppHeader({
  appName,
  navItems,
  onOpenAddEntryDialog,
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSettingsDialogOpen } = useDashboardDialog(); // 追加したコンテキスト
  const { supabase, session } = useSupabase();
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleOpenSettingsDialog = () => {
    if (pathname === "/dashboard") {
      // ダッシュボードページのときだけ開く
      setIsSettingsDialogOpen(true);
    } else {
      router.push("/dashboard", { scroll: false });
      // 画面遷移後に開く処理も考えられるが、ここでは単純に遷移のみ行う
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* 左側: ロゴとアプリ名 */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          <Ticket className="h-7 w-7" />
          <span className="text-xl font-semibold">{appName}</span>
        </Link>

        {/* 中央: PC 用ナビゲーション */}
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

        {/* 右側: アクションボタン／モバイルメニュー */}
        <div className="flex items-center gap-2">
          {!isMobile && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAddEntryDialog}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                data-ai-hint="add item plus"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                新規記録
              </Button>
              {pathname === "/dashboard" && ( // 設定ボタンはダッシュボードでのみ表示
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenSettingsDialog}
                  data-ai-hint="layout settings gears"
                  aria-label="レイアウト・フィルター設定"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
              <ThemeToggleButton />
              {session ? (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  ログアウト
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
              )}
            </>
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
                <DropdownMenuItem
                  onClick={onOpenAddEntryDialog}
                  className="cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>新規記録</span>
                </DropdownMenuItem>
                {/* モバイルメニューではダッシュボード時のみ設定を表示 */}
                {pathname === "/dashboard" && (
                  <DropdownMenuItem
                    onClick={handleOpenSettingsDialog}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>設定</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="cursor-pointer"
                >
                  {isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>テーマ切替</span>
                </DropdownMenuItem>
                {session ? (
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/login")}
                    className="cursor-pointer"
                  >
                    <span>ログイン</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            pathname !== "/dashboard" && (
              <div className="w-[40px] h-[40px]"></div>
            ) // 設定ボタンが無い場合のレイアウト調整用
          )}
        </div>
      </div>
    </header>
  );
}

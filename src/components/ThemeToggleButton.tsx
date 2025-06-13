"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import useTheme from "@/hooks/useTheme";

export default function ThemeToggleButton() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="テーマ切替"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center px-4">
      <h1 className="text-3xl font-bold">BetNoteへようこそ</h1>
      <p className="text-muted-foreground">馬券収支を簡単に管理・分析できるサービスです。</p>
      <Button asChild>
        <Link href="/login">無料で始める</Link>
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Ticket, BarChart3, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthDialog from "@/components/AuthDialog";

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center justify-center flex-grow space-y-6 text-center px-4 bg-gradient-to-br from-primary to-accent py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-background drop-shadow">BetNoteへようこそ</h1>
        <p className="text-background/90 text-lg">馬券収支を簡単に管理・分析できるサービスです。</p>
        <Button size="lg" onClick={() => setOpen(true)} className="text-lg">
          無料で始める
        </Button>
      </div>

      <div className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <Card className="text-center">
          <CardHeader>
            <Ticket className="mx-auto h-8 w-8 text-primary" />
            <CardTitle>簡単入力</CardTitle>
            <CardDescription>購入履歴を素早く記録</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <BarChart3 className="mx-auto h-8 w-8 text-primary" />
            <CardTitle>収支分析</CardTitle>
            <CardDescription>グラフで傾向を把握</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <PenLine className="mx-auto h-8 w-8 text-primary" />
            <CardTitle>メモ機能</CardTitle>
            <CardDescription>レースの振り返りも簡単</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <AuthDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

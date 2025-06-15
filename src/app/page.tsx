"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/contexts/SupabaseProvider";
import LandingPage from "@/components/LandingPage";

export default function HomePage() {
  const { session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-xl text-muted-foreground">ダッシュボードへリダイレクト中...</p>
      </div>
    );
  }

  return <LandingPage />;
}

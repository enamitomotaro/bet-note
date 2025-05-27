"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <p className="text-xl text-muted-foreground">ダッシュボードへリダイレクト中...</p>
    </div>
  );
}

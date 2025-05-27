"use client";

import { DashboardCards } from '@/components/DashboardCards';
import { ProfitChart } from '@/components/ProfitChart';
import { RoiChart } from '@/components/RoiChart';
import { useBetEntries } from '@/hooks/useBetEntries';
import { calculateStats } from '@/lib/calculations';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const { entries, isLoaded } = useBetEntries();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(calculateStats([]));

  useEffect(() => {
    if (isLoaded) {
      setDashboardStats(calculateStats(entries));
    }
  }, [entries, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardCards stats={dashboardStats} />
      <Separator className="my-8" />
      <div className="grid lg:grid-cols-2 gap-8">
        <ProfitChart entries={entries} />
        <RoiChart entries={entries} />
      </div>
    </>
  );
}

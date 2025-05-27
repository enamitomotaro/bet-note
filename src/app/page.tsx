"use client";

import { AppHeader } from '@/components/AppHeader';
import { DashboardCards } from '@/components/DashboardCards';
import { EntryForm } from '@/components/EntryForm';
import { EntriesTable } from '@/components/EntriesTable';
import { ProfitChart } from '@/components/ProfitChart';
import { RoiChart } from '@/components/RoiChart';
import { AiPredictor } from '@/components/AiPredictor';
import { useBetEntries } from '@/hooks/useBetEntries';
import { calculateStats } from '@/lib/calculations';
import { Toaster } from "@/components/ui/toaster";
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { entries, addEntry, deleteEntry, isLoaded } = useBetEntries();
  const [dashboardStats, setDashboardStats] = useState(calculateStats([]));

  useEffect(() => {
    if (isLoaded) {
      setDashboardStats(calculateStats(entries));
    }
  }, [entries, isLoaded]);
  
  // Prevents rendering main content until client-side hydration is complete and entries are loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-muted-foreground">データを読み込み中...</p>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8 space-y-8">
        <DashboardCards stats={dashboardStats} />
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <EntryForm onAddEntry={addEntry} />
            <EntriesTable entries={entries} onDeleteEntry={deleteEntry} />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <AiPredictor />
          </div>
        </div>
        
        <Separator className="my-8" />

        <div className="grid lg:grid-cols-2 gap-8">
          <ProfitChart entries={entries} />
          <RoiChart entries={entries} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

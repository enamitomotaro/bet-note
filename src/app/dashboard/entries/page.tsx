
"use client";

import { EntriesTable } from '@/components/EntriesTable';
import { useBetEntries } from '@/hooks/useBetEntries';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react'; // Added Loader2

export default function EntriesPage() {
  const { entries, addEntry, updateEntry, deleteEntry, isLoaded } = useBetEntries();
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2" data-ai-hint="loading spinner">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-lg text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* EntryForm component removed from here as it's now in a global dialog */}
      <EntriesTable entries={entries} onDeleteEntry={deleteEntry} onUpdateEntry={updateEntry} />
    </div>
  );
}

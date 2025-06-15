
"use client";

import { EntriesTable } from '@/components/EntriesTable';
import { useBetEntries } from '@/hooks/useBetEntries';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function EntriesPageClient() {
  const { entries, addEntry, updateEntry, deleteEntry, isLoaded } = useBetEntries();
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2" data-ai-hint="loading spinner">
        <Spinner key="entries-spinner" className="h-8 w-8 text-accent" />
        <p className="text-lg text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* EntryForm はグローバルダイアログに移動したためここでは表示しない */}
      <EntriesTable entries={entries} onDeleteEntry={deleteEntry} onUpdateEntry={updateEntry} />
    </div>
  );
}

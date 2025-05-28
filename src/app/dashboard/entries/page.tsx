
"use client";

import { EntryForm } from '@/components/EntryForm';
import { EntriesTable } from '@/components/EntriesTable';
import { useBetEntries } from '@/hooks/useBetEntries';
import { useEffect, useState } from 'react';

export default function EntriesPage() {
  const { entries, addEntry, updateEntry, deleteEntry, isLoaded } = useBetEntries();
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EntryForm onAddEntry={addEntry} />
      <EntriesTable entries={entries} onDeleteEntry={deleteEntry} onUpdateEntry={updateEntry} />
    </div>
  );
}

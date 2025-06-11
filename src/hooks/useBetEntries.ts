
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BetEntry } from '@/lib/types';
import useLocalStorage from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from './use-toast'; // トースト表示用のフックを追加

const calculateEntryFields = (betAmount: number, payoutAmount: number): Pick<BetEntry, 'profitLoss' | 'roi'> => {
  const profitLoss = payoutAmount - betAmount;
  const roi = betAmount > 0 ? (payoutAmount / betAmount) * 100 : 0; // 個別の回収率
  return { profitLoss, roi };
};

export function useBetEntries() {
  const [entries, setEntries] = useLocalStorage<BetEntry[]>('betEntries', []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const addEntry = useCallback((newEntryData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    const { profitLoss, roi } = calculateEntryFields(newEntryData.betAmount, newEntryData.payoutAmount);
    const entryWithCalculations: BetEntry = {
      ...newEntryData,
      id: uuidv4(),
      profitLoss,
      roi, // 個別の回収率
    };
    setEntries(prevEntries => [...prevEntries, entryWithCalculations].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast({
      title: "成功",
      description: "エントリーが追加されました。",
    });
  }, [setEntries]);

  const updateEntry = useCallback((id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    const { profitLoss, roi } = calculateEntryFields(updatedData.betAmount, updatedData.payoutAmount);
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id
          ? { ...entry, ...updatedData, profitLoss, roi }
          : entry
      ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    toast({
      title: "成功",
      description: "エントリーが更新されました。",
    });
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    toast({
      title: "成功",
      description: "エントリーが削除されました。",
      variant: "destructive" 
    });
  }, [setEntries]);
  
  const loadedEntries = isLoaded ? entries : [];

  return { entries: loadedEntries, addEntry, updateEntry, deleteEntry, isLoaded };
}

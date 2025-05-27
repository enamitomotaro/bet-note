"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BetEntry } from '@/lib/types';
import useLocalStorage from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Install uuid: npm install uuid @types/uuid
// For this exercise, assuming uuid is available or can be added.
// If not, a simpler ID generator can be used. For now, let's assume it's added.

const calculateEntryFields = (betAmount: number, payoutAmount: number): Pick<BetEntry, 'profitLoss' | 'roi'> => {
  const profitLoss = payoutAmount - betAmount;
  const roi = betAmount > 0 ? (profitLoss / betAmount) * 100 : 0;
  return { profitLoss, roi };
};

export function useBetEntries() {
  const [entries, setEntries] = useLocalStorage<BetEntry[]>('betEntries', []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This ensures that we only try to access localStorage after the component has mounted on the client.
    setIsLoaded(true);
  }, []);

  const addEntry = useCallback((newEntryData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    const { profitLoss, roi } = calculateEntryFields(newEntryData.betAmount, newEntryData.payoutAmount);
    const entryWithCalculations: BetEntry = {
      ...newEntryData,
      id: uuidv4(),
      profitLoss,
      roi,
    };
    setEntries(prevEntries => [...prevEntries, entryWithCalculations].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  }, [setEntries]);
  
  // Return entries only when loaded to avoid hydration issues with localStorage
  const loadedEntries = isLoaded ? entries : [];

  return { entries: loadedEntries, addEntry, deleteEntry, isLoaded };
}

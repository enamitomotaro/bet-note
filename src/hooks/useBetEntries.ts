
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { BetEntry } from '@/lib/types';
import { toast } from './use-toast'; // トースト表示用のフックを追加
import { useSupabase } from '@/contexts/SupabaseProvider';
import { insertBetEntry, updateBetEntry, deleteBetEntry } from '@/app/actions/betEntries';

const calculateEntryFields = (betAmount: number, payoutAmount: number): Pick<BetEntry, 'profitLoss' | 'roi'> => {
  const profitLoss = payoutAmount - betAmount;
  const roi = betAmount > 0 ? (payoutAmount / betAmount) * 100 : 0; // 個別の回収率
  return { profitLoss, roi };
};

export function useBetEntries() {
  const { supabase, session } = useSupabase();
  const [entries, setEntries] = useState<BetEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Supabase チャンネルを保持する ref
  const channelRef = useRef<RealtimeChannel | null>(null);

  const mapRow = (row: any): BetEntry => {
    const { profitLoss, roi } = calculateEntryFields(row.stake, row.payout ?? 0);
    return {
      id: row.id,
      date: row.date,
      raceName: row.race_name,
      betAmount: row.stake,
      payoutAmount: row.payout ?? 0,
      profitLoss,
      roi,
    };
  };

  useEffect(() => {
    if (!session) {
      setEntries([]);
      setIsLoaded(true);
      return;
    }

    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('bet_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true });
      if (!error && data) {
        setEntries(data.map(mapRow));
      }
      setIsLoaded(true);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      channelRef.current = supabase
        .channel('public:bet_entries')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bet_entries', filter: `user_id=eq.${session.user.id}` },
          payload => {
            if (payload.eventType === 'INSERT') {
              setEntries(prev => [...prev, mapRow(payload.new)].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } else if (payload.eventType === 'UPDATE') {
              setEntries(prev => prev.map(e => e.id === payload.new.id ? mapRow(payload.new) : e).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } else if (payload.eventType === 'DELETE') {
              setEntries(prev => prev.filter(e => e.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };

    fetchEntries();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, session]);

  const addEntry = useCallback(async (newEntryData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    if (!session) return;
    try {
      await insertBetEntry({
        date: newEntryData.date,
        raceName: newEntryData.raceName,
        betAmount: newEntryData.betAmount,
        payoutAmount: newEntryData.payoutAmount,
      });
      toast({
        title: '成功',
        description: 'エントリーが追加されました。',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'エラー',
        description: 'エントリーの追加に失敗しました。',
        variant: 'destructive',
      });
    }
  }, [session]);

  const updateEntry = useCallback(async (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    if (!session) return;
    try {
      await updateBetEntry(id, {
        date: updatedData.date,
        raceName: updatedData.raceName,
        betAmount: updatedData.betAmount,
        payoutAmount: updatedData.payoutAmount,
      });
      toast({
        title: '成功',
        description: 'エントリーが更新されました。',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'エラー',
        description: 'エントリーの更新に失敗しました。',
        variant: 'destructive',
      });
    }
  }, [session]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!session) return;
    try {
      await deleteBetEntry(id);
      toast({
        title: '成功',
        description: 'エントリーが削除されました。',
        variant: 'destructive',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'エラー',
        description: 'エントリーの削除に失敗しました。',
        variant: 'destructive',
      });
    }
  }, [session]);

  const loadedEntries = isLoaded ? entries : [];

  return { entries: loadedEntries, addEntry, updateEntry, deleteEntry, isLoaded };
}

'use server';

import { createClient } from '@supabase/supabase-js';

type EntryBase = {
  date: string;
  raceName?: string;
  betAmount: number;
  payoutAmount: number;
};

function getClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function mapToDb(userId: string, data: EntryBase) {
  return {
    user_id: userId,
    date: data.date,
    race_name: data.raceName ?? '',
    stake: data.betAmount,
    payout: data.payoutAmount,
  };
}

export async function insertBetEntry(userId: string, data: EntryBase) {
  const supabase = getClient();
  const { error } = await supabase.from('bet_entries').insert(mapToDb(userId, data));
  if (error) throw error;
}

export async function updateBetEntry(id: string, userId: string, data: EntryBase) {
  const supabase = getClient();
  const { error } = await supabase
    .from('bet_entries')
    .update(mapToDb(userId, data))
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteBetEntry(id: string, userId: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from('bet_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

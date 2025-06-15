'use server';

import { createClient } from '@/utils/supabase/server';

type EntryBase = {
  date: string;
  raceName?: string;
  betAmount: number;
  payoutAmount: number;
};

function getClient() {
  return createClient();
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

export async function insertBetEntry(data: EntryBase) {
  const supabase = getClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error('Unauthorized');
  const { error } = await supabase.from('bet_entries').insert(mapToDb(user.id, data));
  if (error) throw error;
}

export async function updateBetEntry(id: string, data: EntryBase) {
  const supabase = getClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error('Unauthorized');
  const { error } = await supabase
    .from('bet_entries')
    .update(mapToDb(user.id, data))
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteBetEntry(id: string) {
  const supabase = getClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error('Unauthorized');
  const { error } = await supabase
    .from('bet_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function bulkInsertBetEntries(data: EntryBase[]) {
  const supabase = getClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error('Unauthorized');
  const rows = data.map(d => mapToDb(user.id, d));
  const { error } = await supabase.from('bet_entries').insert(rows);
  if (error) throw error;
}

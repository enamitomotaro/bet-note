import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  return createClient();
}

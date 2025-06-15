import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = cookies();
  const access_token = cookieStore.get('sb-access-token')?.value;
  const refresh_token = cookieStore.get('sb-refresh-token')?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token });
  }

  return supabase;
}

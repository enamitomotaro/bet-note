import { redirect } from 'next/navigation';
import DashboardLayoutClient from './DashboardLayoutClient';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

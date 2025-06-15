"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) =>
      setSession(s)
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: session?.access_token ?? null,
        refresh_token: session?.refresh_token ?? null,
      }),
    });
  }, [session]);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return ctx;
};

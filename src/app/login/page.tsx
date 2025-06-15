"use client";

import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/contexts/SupabaseProvider";

export default function LoginPage() {
  const router = useRouter();
  const { session } = useSupabase();
  const [supabase] = useState(() => createClient());
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : undefined;

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google", "apple"]}
        redirectTo={redirectTo}
      />
    </div>
  );
}

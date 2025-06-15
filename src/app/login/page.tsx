"use client";

import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [supabase] = useState(() => createClient());
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : undefined;

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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");

  if (session) {
    router.replace("/dashboard");
  }

  const signInWithEmail = async () => {
    await supabase.auth.signInWithOtp({ email });
    alert("確認リンクを送信しました");
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({ provider: "apple" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <div className="space-y-2 w-72">
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={signInWithEmail} className="w-full">
          メールリンクでログイン
        </Button>
        <Button onClick={signInWithGoogle} variant="secondary" className="w-full">
          Google でログイン
        </Button>
        <Button onClick={signInWithApple} variant="secondary" className="w-full">
          Apple でログイン
        </Button>
      </div>
    </div>
  );
}

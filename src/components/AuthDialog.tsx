"use client";

import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSupabase } from "@/contexts/SupabaseProvider";

export default function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { supabase } = useSupabase();
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={["google", "apple"]} view="magic_link" redirectTo={redirectTo} />
      </DialogContent>
    </Dialog>
  );
}

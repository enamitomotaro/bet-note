"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthDialog from "@/components/AuthDialog";
import { useSupabase } from "@/contexts/SupabaseProvider";

export default function LoginPage() {
  const { session } = useSupabase();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  return <AuthDialog open={open} onOpenChange={(o) => setOpen(o)} />;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface WaitlistButtonProps {
  slotId: string;
  isWaitlisted: boolean;
  onToggle?: (slotId: string, joined: boolean) => void;
}

export function WaitlistButton({ slotId, isWaitlisted: initialWaitlisted, onToggle }: WaitlistButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [waitlisted, setWaitlisted] = useState(initialWaitlisted);

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (waitlisted) {
      await supabase.from("waitlist").delete().eq("slot_id", slotId).eq("player_id", user.id);
      setWaitlisted(false);
      onToggle?.(slotId, false);
    } else {
      await supabase.from("waitlist").insert({ slot_id: slotId, player_id: user.id });
      setWaitlisted(true);
      onToggle?.(slotId, true);
    }

    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant={waitlisted ? "secondary" : "outline"}
      className="w-full h-7 text-xs"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "..." : waitlisted ? "En lista ✓" : "Lista espera"}
    </Button>
  );
}

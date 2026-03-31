"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface JoinMatchButtonProps {
  matchId: string;
  complexId: string;
  creatorId: string;
}

export function JoinMatchButton({ matchId, creatorId }: JoinMatchButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("match_participants").insert({
      match_id: matchId,
      player_id: user.id,
      status: "pending",
    });

    if (error) {
      alert("No se pudo unir al partido");
      setLoading(false);
      return;
    }

    // Notify the match creator
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await notifyUser(creatorId, {
      title: "Alguien quiere jugar 🎾",
      body: `${profile?.full_name ?? "Un jugador"} quiere unirse a tu partido`,
      url: "/bookings",
    });

    setJoined(true);
    setLoading(false);
    router.refresh();
  }

  if (joined) {
    return (
      <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
        ✓ Solicitado
      </span>
    );
  }

  return (
    <Button size="sm" onClick={handleJoin} disabled={loading} className="h-8 text-xs">
      {loading ? "..." : "Unirse"}
    </Button>
  );
}

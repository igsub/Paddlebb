"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyUser } from "@/app/actions";

interface ParticipantActionsProps {
  participantId: string;
  playerName: string;
  playerId: string;
  matchId: string;
}

export function ParticipantActions({
  participantId,
  playerName,
  playerId,
  matchId,
}: ParticipantActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);

  async function handleAction(status: "accepted" | "rejected") {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("match_participants")
      .update({ status })
      .eq("id", participantId);

    // Notify the player
    if (status === "accepted") {
      await notifyUser(playerId, {
        title: "¡Fuiste aceptado al partido! 🎾",
        body: "Tu solicitud fue aceptada. ¡A jugar!",
        url: "/bookings",
      });
    } else {
      await notifyUser(playerId, {
        title: "Solicitud de partido",
        body: "Tu solicitud no pudo ser aceptada esta vez.",
        url: "/matches",
      });
    }

    setDone(status);
    setLoading(false);
    router.refresh();
  }

  if (done) {
    return (
      <div className="text-xs text-gray-500">
        {playerName} — {done === "accepted" ? "✓ Aceptado" : "✗ Rechazado"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-700 flex-1">{playerName}</span>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
      >
        Rechazar
      </button>
      <button
        onClick={() => handleAction("accepted")}
        disabled={loading}
        className="px-2 py-1 rounded bg-emerald-600 text-xs text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        Aceptar
      </button>
    </div>
  );
}

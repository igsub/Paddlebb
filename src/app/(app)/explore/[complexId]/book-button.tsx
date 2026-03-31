"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface BookButtonProps {
  slotId: string;
  complexId: string;
  date: string;
}

export function BookButton({ slotId, complexId, date }: BookButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirming" | "loading" | "done">("idle");
  const [openMatch, setOpenMatch] = useState(false);
  const [spotsNeeded, setSpotsNeeded] = useState(1);
  const [level, setLevel] = useState("intermedio");
  const [matchType, setMatchType] = useState("amistoso");

  async function handleBook() {
    setState("loading");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({ slot_id: slotId, player_id: user.id, status: "confirmed" })
      .select("id")
      .single();

    if (error) {
      alert("No se pudo reservar. El turno puede haber sido tomado.");
      setState("idle");
      router.refresh();
      return;
    }

    // Create open match if requested
    if (openMatch && booking) {
      await supabase.from("open_matches").insert({
        booking_id: booking.id,
        creator_id: user.id,
        spots_needed: spotsNeeded,
        level,
        match_type: matchType,
      });
    }

    // Notify complex owner
    const { data: complex } = await supabase
      .from("complexes")
      .select("owner_id, name")
      .eq("id", complexId)
      .single();

    if (complex) {
      const { data: playerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await notifyUser(complex.owner_id, {
        title: "Nueva reserva 🎾",
        body: `${playerProfile?.full_name ?? "Un jugador"} reservó un turno para el ${date}`,
        url: "/owner/dashboard",
      });
    }

    setState("done");
    router.refresh();
  }

  if (state === "done") {
    return (
      <span className="text-xs text-emerald-700 font-semibold">✓ Reservado</span>
    );
  }

  if (state === "confirming") {
    return (
      <div className="text-left space-y-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs font-semibold text-gray-800">¿Buscar compañeros?</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={openMatch}
            onChange={(e) => setOpenMatch(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600"
          />
          <span className="text-xs text-gray-700">Publicar partido abierto</span>
        </label>
        {openMatch && (
          <div className="space-y-1.5 pt-1">
            <select
              value={spotsNeeded}
              onChange={(e) => setSpotsNeeded(Number(e.target.value))}
              className="w-full h-7 rounded border border-gray-200 text-xs px-2"
            >
              <option value={1}>Busco 1 compañero</option>
              <option value={2}>Busco 2 compañeros</option>
              <option value={3}>Busco 3 compañeros</option>
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-7 rounded border border-gray-200 text-xs px-2"
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="competitivo">Competitivo</option>
            </select>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full h-7 rounded border border-gray-200 text-xs px-2"
            >
              <option value="amistoso">Amistoso</option>
              <option value="competitivo">Competitivo</option>
            </select>
          </div>
        )}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => setState("idle")}
            className="flex-1 h-7 rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleBook}
            className="flex-1 h-7 rounded bg-emerald-600 text-xs text-white font-semibold hover:bg-emerald-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      className="w-full h-7 text-xs"
      onClick={() => setState("confirming")}
      disabled={state === "loading"}
    >
      {state === "loading" ? "..." : "Reservar"}
    </Button>
  );
}

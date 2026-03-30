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
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleBook() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Create booking
    const { error } = await supabase.from("bookings").insert({
      slot_id: slotId,
      player_id: user.id,
      status: "confirmed",
    });

    if (error) {
      alert("No se pudo reservar. El turno puede haber sido tomado.");
      setLoading(false);
      router.refresh();
      return;
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
        title: "Nueva reserva",
        body: `${playerProfile?.full_name ?? "Un jugador"} reservó un turno para el ${date}`,
        url: "/dashboard",
      });
    }

    setDone(true);
    setLoading(false);
    router.refresh();
  }

  if (done) return <span className="text-xs text-emerald-700 font-medium">✓ Reservado</span>;

  return (
    <Button size="sm" className="w-full h-7 text-xs" onClick={handleBook} disabled={loading}>
      {loading ? "..." : "Reservar"}
    </Button>
  );
}

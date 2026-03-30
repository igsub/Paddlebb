"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

interface CancelButtonProps {
  bookingId: string;
  slotId: string;
  ownerId?: string;
}

export function CancelButton({ bookingId, slotId, ownerId }: CancelButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleCancel() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cancel booking (trigger will set slot back to available)
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      alert("No se pudo cancelar la reserva");
      setLoading(false);
      setConfirmed(false);
      return;
    }

    // Notify complex owner
    if (ownerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await notifyUser(ownerId, {
        title: "Reserva cancelada",
        body: `${profile?.full_name ?? "Un jugador"} canceló su reserva`,
        url: "/dashboard",
      });
    }

    // Notify first person on waitlist
    const { data: waitlist } = await supabase
      .from("waitlist")
      .select("player_id")
      .eq("slot_id", slotId)
      .order("created_at")
      .limit(1);

    if (waitlist && waitlist.length > 0) {
      const { data: slot } = await supabase
        .from("slots")
        .select("date, start_time, court:courts!slots_court_id_fkey(name, complex:complexes!courts_complex_id_fkey(name))")
        .eq("id", slotId)
        .single();

      const courtName = (slot?.court as unknown as { name: string })?.name;
      await notifyUser(waitlist[0].player_id, {
        title: "Turno disponible",
        body: `Se liberó un turno en ${courtName} para el ${slot?.date}. ¡Reservá ahora!`,
        url: `/explore`,
      });
    }

    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`text-xs ${confirmed ? "border-red-300 text-red-600 hover:bg-red-50" : ""}`}
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? "..." : confirmed ? "Confirmar cancelación" : "Cancelar"}
    </Button>
  );
}

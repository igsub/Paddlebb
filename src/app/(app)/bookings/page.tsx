import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { CancelButton } from "./cancel-button";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      slot:slots!bookings_slot_id_fkey(
        date, start_time, end_time, price,
        court:courts!slots_court_id_fkey(
          name,
          complex:complexes!courts_complex_id_fkey(name, address, city, owner_id)
        )
      )
    `)
    .eq("player_id", user.id)
    .order("slot(date)", { ascending: true })
    .order("slot(start_time)", { ascending: true });

  const upcoming = (bookings ?? []).filter(
    (b) => b.status === "confirmed" && b.slot?.date >= today
  );
  const past = (bookings ?? []).filter(
    (b) => b.status === "cancelled" || b.slot?.date < today
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis turnos</h1>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Próximos</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No tenés turnos próximos</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => {
              const slot = booking.slot;
              const court = slot?.court;
              const complex = court?.complex;
              return (
                <Card key={booking.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{complex?.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{complex?.address}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          {court?.name} — {slot ? formatDate(slot.date) : ""}
                        </p>
                        <p className="text-sm text-gray-600">
                          {slot ? formatTime(slot.start_time) : ""} — {slot ? formatTime(slot.end_time) : ""}
                        </p>
                        <p className="text-sm font-medium text-emerald-700 mt-1">
                          {slot ? formatCurrency(slot.price) : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="default">Confirmada</Badge>
                        <CancelButton
                          bookingId={booking.id}
                          slotId={booking.slot_id}
                          ownerId={complex?.owner_id}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial</h2>
          <div className="space-y-3">
            {past.map((booking) => {
              const slot = booking.slot;
              const court = slot?.court;
              const complex = court?.complex;
              return (
                <Card key={booking.id} className="opacity-70">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{complex?.name}</p>
                        <p className="text-sm text-gray-600">
                          {court?.name} — {slot ? formatDate(slot.date) : ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          {slot ? formatTime(slot.start_time) : ""} — {slot ? formatTime(slot.end_time) : ""}
                        </p>
                      </div>
                      <Badge variant={booking.status === "cancelled" ? "destructive" : "secondary"}>
                        {booking.status === "cancelled" ? "Cancelada" : "Completada"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

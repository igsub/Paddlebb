import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Phone } from "lucide-react";

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const { date: qDate, status: qStatus } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = qDate ?? today;
  const selectedStatus = qStatus ?? "confirmed";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/owner/login");

  const { data: complex } = await supabase
    .from("complexes")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!complex) redirect("/owner/setup");

  const { data: courts } = await supabase
    .from("courts")
    .select("id")
    .eq("complex_id", complex.id);

  const courtIds = courts?.map((c) => c.id) ?? [];

  let query = supabase
    .from("bookings")
    .select(`
      id, status, created_at,
      player:profiles!bookings_player_id_fkey(full_name, email, phone),
      slot:slots!bookings_slot_id_fkey(
        date, start_time, end_time, price,
        court:courts!slots_court_id_fkey(name)
      )
    `)
    .in("slot.court_id", courtIds)
    .eq("slot.date", selectedDate)
    .order("slot(start_time)");

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data: bookings } = await query;

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>

      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <a
              key={d}
              href={`/owner/bookings?date=${d}&status=${selectedStatus}`}
              className={`flex flex-col items-center min-w-[48px] rounded-xl px-2 py-2 text-xs font-medium transition-colors shrink-0 ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="uppercase">
                {date.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
            </a>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {[
          { value: "confirmed", label: "Confirmadas" },
          { value: "cancelled", label: "Canceladas" },
          { value: "all", label: "Todas" },
        ].map(({ value, label }) => (
          <a
            key={value}
            href={`/owner/bookings?date=${selectedDate}&status=${value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedStatus === value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Date heading */}
      <p className="text-sm text-gray-500">{formatDate(selectedDate)}</p>

      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Sin reservas para este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const slot = booking.slot as unknown as {
              date: string;
              start_time: string;
              end_time: string;
              price: number;
              court: { name: string };
            } | null;
            const player = booking.player as unknown as {
              full_name: string;
              email: string;
              phone?: string;
            } | null;

            return (
              <Card key={booking.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {slot?.court?.name}
                        </p>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {booking.status === "confirmed"
                            ? "Confirmada"
                            : "Cancelada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">
                        {slot ? formatTime(slot.start_time) : ""} –{" "}
                        {slot ? formatTime(slot.end_time) : ""}
                      </p>
                      <p className="text-sm font-medium text-emerald-700 mt-1">
                        {slot ? formatCurrency(slot.price) : ""}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {player?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{player?.email}</p>
                        {player?.phone && (
                          <a
                            href={`https://wa.me/${player.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 mt-1 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {player.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

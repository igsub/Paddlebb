import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { MapPin, Users } from "lucide-react";
import { CancelButton } from "./cancel-button";
import { ParticipantActions } from "./participant-actions";
import { RateButton } from "./rate-button";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, status, slot_id,
      slot:slots!bookings_slot_id_fkey(
        id, date, start_time, end_time, price,
        court:courts!slots_court_id_fkey(
          id, name,
          complex:complexes!courts_complex_id_fkey(id, name, address, city, owner_id, cancellation_hours)
        )
      ),
      open_match:open_matches(
        id, spots_needed, spots_filled, level, match_type, is_open,
        participants:match_participants(id, status, player:profiles!match_participants_player_id_fkey(id, full_name))
      ),
      rating:ratings(score)
    `)
    .eq("player_id", user.id)
    .order("slot(date)", { ascending: true })
    .order("slot(start_time)", { ascending: true });

  const upcoming = (bookings ?? []).filter(
    (b) =>
      b.status === "confirmed" &&
      (b.slot as unknown as { date: string })?.date >= today
  );
  const past = (bookings ?? []).filter(
    (b) =>
      b.status === "cancelled" ||
      (b.slot as unknown as { date: string })?.date < today
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis turnos</h1>
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          <Users className="h-4 w-4" />
          Partidos abiertos
        </Link>
      </div>

      {/* Upcoming */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Próximos
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-3xl mb-2">🎾</p>
            <p className="text-sm text-gray-500">No tenés turnos próximos</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/explore">Explorar canchas</Link>
            </Button>
          </div>
        ) : (
          upcoming.map((booking) => {
            const slot = booking.slot as unknown as {
              id: string;
              date: string;
              start_time: string;
              end_time: string;
              price: number;
              court: {
                id: string;
                name: string;
                complex: {
                  id: string;
                  name: string;
                  address: string;
                  city: string;
                  owner_id: string;
                  cancellation_hours: number | null;
                };
              };
            } | null;
            const complex = slot?.court?.complex;
            const openMatch = (booking.open_match as unknown as {
              id: string;
              spots_needed: number;
              spots_filled: number;
              level: string;
              match_type: string;
              is_open: boolean;
              participants: {
                id: string;
                status: string;
                player: { id: string; full_name: string };
              }[];
            }[] | null)?.[0] ?? null;

            const pendingParticipants =
              openMatch?.participants?.filter((p) => p.status === "pending") ?? [];
            const acceptedParticipants =
              openMatch?.participants?.filter((p) => p.status === "accepted") ?? [];
            const spotsLeft = openMatch
              ? openMatch.spots_needed - openMatch.spots_filled
              : null;

            // Check if cancellation is still allowed
            const slotDateTime = slot
              ? new Date(`${slot.date}T${slot.start_time}`)
              : null;
            const now = new Date();
            const hoursUntil = slotDateTime
              ? (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
              : Infinity;
            const cancellationHours = complex?.cancellation_hours ?? 2;
            const canCancel = hoursUntil > cancellationHours;

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-4 space-y-3">
                  {/* Main booking info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {complex?.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{complex?.address}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        🎾 {slot?.court?.name}
                      </p>
                      <p className="text-sm text-gray-700">
                        📅 {slot ? formatDate(slot.date) : ""}
                      </p>
                      <p className="text-sm text-gray-700">
                        ⏰ {slot ? formatTime(slot.start_time) : ""} –{" "}
                        {slot ? formatTime(slot.end_time) : ""}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">
                        {slot ? formatCurrency(slot.price) : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="default">Confirmada</Badge>
                      {canCancel && (
                        <CancelButton
                          bookingId={booking.id}
                          slotId={booking.slot_id}
                          ownerId={complex?.owner_id}
                          complexId={complex?.id}
                        />
                      )}
                      {!canCancel && (
                        <span className="text-xs text-gray-400 text-right leading-tight">
                          Sin cancelación<br />({cancellationHours}h policy)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open match section */}
                  {openMatch && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Partido abierto
                          {spotsLeft !== null && spotsLeft > 0 && (
                            <span className="text-emerald-600">
                              · {spotsLeft} lugar{spotsLeft !== 1 ? "es" : ""} libre{spotsLeft !== 1 ? "s" : ""}
                            </span>
                          )}
                          {spotsLeft === 0 && (
                            <span className="text-gray-400">· Completo</span>
                          )}
                        </p>
                      </div>

                      {/* Accepted players */}
                      {acceptedParticipants.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {acceptedParticipants.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 text-xs text-gray-700"
                            >
                              <span className="text-emerald-500">✓</span>
                              {p.player.full_name}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pending participants needing approval */}
                      {pendingParticipants.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-orange-600 font-medium">
                            {pendingParticipants.length} solicitud{pendingParticipants.length !== 1 ? "es" : ""} pendiente{pendingParticipants.length !== 1 ? "s" : ""}:
                          </p>
                          {pendingParticipants.map((p) => (
                            <ParticipantActions
                              key={p.id}
                              participantId={p.id}
                              playerName={p.player.full_name}
                              playerId={p.player.id}
                              matchId={openMatch.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Past bookings */}
      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Historial
          </h2>
          {past.map((booking) => {
            const slot = booking.slot as unknown as {
              date: string;
              start_time: string;
              end_time: string;
              court: { name: string; complex: { id: string; name: string } };
            } | null;
            const complex = slot?.court?.complex;
            const existingRating = (booking.rating as unknown as { score: number }[] | null)?.[0] ?? null;
            const isCompleted = booking.status !== "cancelled";
            return (
              <div
                key={booking.id}
                className="p-3 rounded-xl bg-white border border-gray-100 opacity-80"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {complex?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {slot?.court?.name} · {slot ? formatDate(slot.date) : ""} ·{" "}
                      {slot ? formatTime(slot.start_time) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={booking.status === "cancelled" ? "destructive" : "secondary"}
                    >
                      {booking.status === "cancelled" ? "Cancelada" : "Completada"}
                    </Badge>
                    {isCompleted && complex && (
                      <Link
                        href={`/explore/${complex.id}`}
                        className="text-xs text-emerald-600 hover:underline shrink-0"
                      >
                        Reservar de nuevo
                      </Link>
                    )}
                  </div>
                </div>
                {isCompleted && complex && (
                  <div className="mt-2 flex items-center gap-2">
                    <RateButton
                      bookingId={booking.id}
                      complexId={complex.id}
                      complexName={complex.name}
                      existingScore={existingRating?.score ?? null}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

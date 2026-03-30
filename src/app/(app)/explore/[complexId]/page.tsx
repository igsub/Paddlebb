import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatCurrency } from "@/lib/utils";
import { MapPin, Phone } from "lucide-react";
import { BookButton } from "./book-button";
import { WaitlistButton } from "./waitlist-button";
import { Complex, Court, Slot } from "@/types";

const surfaceLabels: Record<string, string> = {
  cemento: "Cemento",
  cesped_sintetico: "Césped sintético",
  madera: "Madera",
  cristal: "Cristal",
};

export default async function ComplexDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ complexId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { complexId } = await params;
  const { date: qDate } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = qDate ?? today;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: complex } = await supabase
    .from("complexes")
    .select("*")
    .eq("id", complexId)
    .single();

  if (!complex) notFound();

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("complex_id", complexId)
    .eq("active", true)
    .order("name");

  // Load slots for all courts on selected date
  const courtIds = courts?.map((c) => c.id) ?? [];
  const { data: slots } = courtIds.length > 0
    ? await supabase
        .from("slots")
        .select("*")
        .in("court_id", courtIds)
        .eq("date", selectedDate)
        .order("start_time")
    : { data: [] };

  // Load user's waitlist entries for today's slots
  const { data: waitlistEntries } = user && slots && slots.length > 0
    ? await supabase
        .from("waitlist")
        .select("slot_id")
        .eq("player_id", user.id)
        .in("slot_id", slots.map((s) => s.id))
    : { data: [] };

  const waitlistedSlotIds = new Set((waitlistEntries ?? []).map((w) => w.slot_id));

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const slotsByCourtId: Record<string, Slot[]> = {};
  for (const slot of slots ?? []) {
    if (!slotsByCourtId[slot.court_id]) slotsByCourtId[slot.court_id] = [];
    slotsByCourtId[slot.court_id].push(slot as Slot);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Complex header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{(complex as Complex).name}</h1>
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          {(complex as Complex).address}, {(complex as Complex).city}
        </div>
        {(complex as Complex).phone && (
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <Phone className="h-4 w-4" />
            {(complex as Complex).phone}
          </div>
        )}
        {(complex as Complex).description && (
          <p className="text-sm text-gray-600 mt-2">{(complex as Complex).description}</p>
        )}
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/explore/${complexId}?date=${d}`}
              className={`flex flex-col items-center min-w-[52px] rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isSelected ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{date.toLocaleDateString("es-AR", { weekday: "short" })}</span>
              <span className="text-base font-bold">{date.getDate()}</span>
            </Link>
          );
        })}
      </div>

      {/* Courts and slots */}
      {!courts || courts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Este complejo aún no tiene canchas disponibles</p>
      ) : (
        courts.map((court) => {
          const courtSlots = slotsByCourtId[court.id] ?? [];
          return (
            <Card key={court.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {(court as Court).name}
                  <Badge variant="secondary">{surfaceLabels[(court as Court).surface] ?? (court as Court).surface}</Badge>
                  {(court as Court).indoor && <Badge variant="outline">Cubierta</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courtSlots.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin turnos disponibles para este día</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {courtSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg border p-3 text-center transition-all ${
                          slot.status === "available"
                            ? "border-emerald-200 bg-emerald-50"
                            : slot.status === "booked"
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-100 bg-gray-50 opacity-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-800">
                          {formatTime(slot.start_time)}
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(slot.end_time)}</p>
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {formatCurrency(slot.price)}
                        </p>
                        <div className="mt-2">
                          {slot.status === "available" && user && (
                            <BookButton slotId={slot.id} complexId={complexId} date={selectedDate} />
                          )}
                          {slot.status === "booked" && user && (
                            <WaitlistButton
                              slotId={slot.id}
                              isWaitlisted={waitlistedSlotIds.has(slot.id)}
                            />
                          )}
                          {slot.status === "blocked" && (
                            <span className="text-xs text-gray-400">No disponible</span>
                          )}
                          {!user && slot.status === "available" && (
                            <Link href="/login" className="text-xs text-emerald-600 font-medium">
                              Reservar
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

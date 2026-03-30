import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatCurrency } from "@/lib/utils";
import { MapPin, Phone, MessageCircle, Star } from "lucide-react";
import { BookButton } from "./book-button";
import { WaitlistButton } from "./waitlist-button";
import { ComplexDetailMap } from "./complex-detail-map";
import { Complex, Court, Slot } from "@/types";

const surfaceLabels: Record<string, string> = {
  cemento: "Cemento",
  cesped_sintetico: "Césped sint.",
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const courtIds = courts?.map((c) => c.id) ?? [];
  const { data: slots } =
    courtIds.length > 0
      ? await supabase
          .from("slots")
          .select("*")
          .in("court_id", courtIds)
          .eq("date", selectedDate)
          .order("start_time")
      : { data: [] };

  const { data: waitlistEntries } =
    user && slots && slots.length > 0
      ? await supabase
          .from("waitlist")
          .select("slot_id")
          .eq("player_id", user.id)
          .in(
            "slot_id",
            slots.map((s) => s.id)
          )
      : { data: [] };

  const waitlistedSlotIds = new Set(
    (waitlistEntries ?? []).map((w) => w.slot_id)
  );

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

  const c = complex as Complex & {
    lat?: number;
    lng?: number;
    avg_rating?: number;
    whatsapp?: string;
    phone?: string;
    cancellation_hours?: number;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{c.name}</h1>
          {c.avg_rating && (
            <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-1 text-sm font-semibold text-yellow-700 shrink-0">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {c.avg_rating}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4 shrink-0" />
          {c.address}, {c.city}
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {c.phone && (
            <a
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600"
            >
              <Phone className="h-4 w-4" />
              {c.phone}
            </a>
          )}
          {c.whatsapp && (
            <a
              href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>
        {c.description && (
          <p className="text-sm text-gray-600 mt-2">{c.description}</p>
        )}
        {c.cancellation_hours != null && c.cancellation_hours > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            ⏱ Cancelación gratuita hasta {c.cancellation_hours}h antes del turno
          </p>
        )}
      </div>

      {/* Map */}
      {c.lat && c.lng && (
        <ComplexDetailMap
          lat={c.lat}
          lng={c.lng}
          name={c.name}
          address={`${c.address}, ${c.city}`}
        />
      )}

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/explore/${complexId}?date=${d}`}
              className={`flex flex-col items-center min-w-[48px] rounded-xl px-2 py-2 text-xs font-medium transition-colors shrink-0 ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="uppercase">
                {date.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
            </Link>
          );
        })}
      </div>

      {/* Courts and slots */}
      {!courts || courts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Este complejo aún no tiene canchas disponibles
        </p>
      ) : (
        courts.map((court) => {
          const courtSlots = slotsByCourtId[court.id] ?? [];
          return (
            <Card key={court.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                  {(court as Court).name}
                  <Badge variant="secondary">
                    {surfaceLabels[(court as Court).surface] ?? (court as Court).surface}
                  </Badge>
                  {(court as Court).indoor && (
                    <Badge variant="outline">Cubierta</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courtSlots.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">
                    Sin turnos disponibles para este día
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {courtSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          slot.status === "available"
                            ? "border-emerald-200 bg-emerald-50"
                            : slot.status === "booked"
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-100 bg-gray-50 opacity-50"
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-800">
                          {formatTime(slot.start_time)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(slot.end_time)}
                        </p>
                        <p className="text-xs font-semibold text-gray-700 mt-1">
                          {formatCurrency(slot.price)}
                        </p>
                        <div className="mt-2">
                          {slot.status === "available" && user && (
                            <BookButton
                              slotId={slot.id}
                              complexId={complexId}
                              date={selectedDate}
                            />
                          )}
                          {slot.status === "booked" && user && (
                            <WaitlistButton
                              slotId={slot.id}
                              isWaitlisted={waitlistedSlotIds.has(slot.id)}
                            />
                          )}
                          {slot.status === "blocked" && (
                            <span className="text-xs text-gray-400">
                              No disponible
                            </span>
                          )}
                          {!user && slot.status === "available" && (
                            <Link
                              href="/login"
                              className="block text-xs text-emerald-600 font-semibold py-1"
                            >
                              Reservar
                            </Link>
                          )}
                          {slot.status === "booked" && !user && (
                            <span className="text-xs text-orange-600 font-medium">
                              Ocupada
                            </span>
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

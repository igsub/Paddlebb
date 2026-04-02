import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Phone, MessageCircle, Star } from "lucide-react";
import { ComplexDetailMap } from "./complex-detail-map";
import { SlotsGrid } from "./slots-grid";
import { Complex, Slot } from "@/types";

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

  const { data: ratings } = await supabase
    .from("ratings")
    .select("score, comment, created_at, player:profiles!ratings_player_id_fkey(full_name)")
    .eq("complex_id", complexId)
    .order("created_at", { ascending: false })
    .limit(5);

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

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

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

      {/* Reviews */}
      {ratings && ratings.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Opiniones ({ratings.length}{ratings.length === 5 ? "+" : ""})
          </h2>
          <div className="space-y-2">
            {ratings.map((r, i) => {
              const player = r.player as unknown as { full_name: string } | null;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700">
                      {player?.full_name ?? "Jugador"}
                    </span>
                    <span className="text-xs text-yellow-500 font-semibold">
                      {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{r.comment}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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

      {/* Courts and slots — realtime */}
      <SlotsGrid
        courts={(courts ?? []).map((ct) => ({
          id: ct.id,
          name: ct.name,
          surface: ct.surface,
          indoor: ct.indoor,
        }))}
        initialSlots={(slots ?? []) as Slot[]}
        selectedDate={selectedDate}
        complexId={complexId}
        userId={user?.id ?? null}
        waitlistedSlotIds={[...waitlistedSlotIds]}
      />
    </div>
  );
}

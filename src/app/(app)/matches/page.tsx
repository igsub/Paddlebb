import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { JoinMatchButton } from "./join-match-button";

const levelLabel: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  competitivo: "Competitivo",
};

const levelColor: Record<string, "default" | "secondary" | "warning" | "destructive" | "outline"> = {
  principiante: "secondary",
  intermedio: "default",
  avanzado: "warning",
  competitivo: "destructive",
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; type?: string }>;
}) {
  const { level: filterLevel, type: filterType } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("open_matches")
    .select(`
      id, spots_needed, spots_filled, level, match_type, notes, created_at,
      creator:profiles!open_matches_creator_id_fkey(id, full_name),
      booking:bookings!open_matches_booking_id_fkey(
        id,
        slot:slots!bookings_slot_id_fkey(
          date, start_time, end_time,
          court:courts!slots_court_id_fkey(
            name,
            complex:complexes!courts_complex_id_fkey(id, name, city)
          )
        )
      ),
      participants:match_participants(player_id, status)
    `)
    .eq("is_open", true)
    .gte("booking.slot.date", today)
    .order("booking.slot.date")
    .order("booking.slot.start_time");

  if (filterLevel) query = query.eq("level", filterLevel);
  if (filterType) query = query.eq("match_type", filterType);

  const { data: matches } = await query;

  // Get matches user already joined
  const { data: myParticipations } = await supabase
    .from("match_participants")
    .select("match_id")
    .eq("player_id", user.id);

  const joinedMatchIds = new Set((myParticipations ?? []).map((p) => p.match_id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partidos abiertos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Sumate a un partido y completá la cancha
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {[
          { href: "/matches", label: "Todos" },
          { href: "/matches?level=principiante", label: "Principiante" },
          { href: "/matches?level=intermedio", label: "Intermedio" },
          { href: "/matches?level=avanzado", label: "Avanzado" },
          { href: "/matches?type=amistoso", label: "Amistoso" },
          { href: "/matches?type=competitivo", label: "Competitivo" },
        ].map(({ href, label }) => {
          const isActive =
            href === "/matches"
              ? !filterLevel && !filterType
              : href === `/matches?level=${filterLevel}` ||
                href === `/matches?type=${filterType}`;
          return (
            <a
              key={href}
              href={href}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {!matches || matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎾</p>
          <p className="font-medium text-gray-600">No hay partidos abiertos</p>
          <p className="text-sm mt-1">
            Reservá una cancha y marcala como abierta para buscar compañeros
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const booking = match.booking as unknown as {
              id: string;
              slot: {
                date: string;
                start_time: string;
                end_time: string;
                court: { name: string; complex: { id: string; name: string; city: string } };
              };
            } | null;
            const creator = match.creator as unknown as { id: string; full_name: string } | null;
            const slot = booking?.slot;
            const court = slot?.court;
            const complex = court?.complex;
            const spotsLeft = match.spots_needed - match.spots_filled;
            const isMyMatch = creator?.id === user.id;
            const alreadyJoined = joinedMatchIds.has(match.id);

            return (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Complex & court */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {complex?.name}
                        </p>
                        <span className="text-xs text-gray-400">·</span>
                        <p className="text-xs text-gray-500">{court?.name}</p>
                      </div>

                      {/* Date & time */}
                      <p className="text-sm text-gray-700">
                        📅 {slot ? formatDate(slot.date) : ""} &nbsp;
                        ⏰ {slot ? formatTime(slot.start_time) : ""} — {slot ? formatTime(slot.end_time) : ""}
                      </p>

                      {/* City */}
                      <p className="text-xs text-gray-500 mt-0.5">{complex?.city}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {match.level && (
                          <Badge variant={levelColor[match.level] ?? "secondary"}>
                            {levelLabel[match.level] ?? match.level}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {match.match_type === "competitivo" ? "Competitivo" : "Amistoso"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3" />
                          {spotsLeft} lugar{spotsLeft !== 1 ? "es" : ""} libre{spotsLeft !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Creator */}
                      <p className="text-xs text-gray-400 mt-2">
                        Organiza: {creator?.full_name}
                      </p>

                      {/* Notes */}
                      {match.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{match.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {isMyMatch ? (
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                          Tu partido
                        </span>
                      ) : alreadyJoined ? (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          Solicitado
                        </span>
                      ) : (
                        <JoinMatchButton
                          matchId={match.id}
                          complexId={complex?.id ?? ""}
                          creatorId={creator?.id ?? ""}
                        />
                      )}
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

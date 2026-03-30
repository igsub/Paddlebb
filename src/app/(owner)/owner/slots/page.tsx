import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatCurrency, formatDate } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusLabel: Record<string, string> = {
  available: "Libre",
  booked: "Reservada",
  blocked: "Bloqueada",
};
const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "warning" | "outline"
> = {
  available: "default",
  booked: "warning",
  blocked: "destructive",
};

export default async function OwnerSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: qDate } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = qDate ?? today;

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
    .select("id, name")
    .eq("complex_id", complex.id)
    .eq("active", true)
    .order("name");

  const courtIds = courts?.map((c) => c.id) ?? [];
  const { data: slots } = courtIds.length > 0
    ? await supabase
        .from("slots")
        .select("*, court:courts!slots_court_id_fkey(id, name)")
        .in("court_id", courtIds)
        .eq("date", selectedDate)
        .order("court_id")
        .order("start_time")
    : { data: [] };

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  // Group slots by court
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slotsByCourt: Record<string, any[]> = {};
  for (const slot of slots ?? []) {
    const courtId = slot.court_id;
    if (!slotsByCourt[courtId]) slotsByCourt[courtId] = [];
    slotsByCourt[courtId]!.push(slot);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
      </div>

      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <a
              key={d}
              href={`/owner/slots?date=${d}`}
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

      <p className="text-sm text-gray-500">{formatDate(selectedDate)}</p>

      {/* Per-court slots */}
      {!courts || courts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No tenés canchas aún.</p>
          <Button asChild className="mt-3" size="sm">
            <Link href="/owner/courts/new">Crear cancha</Link>
          </Button>
        </div>
      ) : (
        courts.map((court) => {
          const courtSlots = slotsByCourt[court.id] ?? [];
          return (
            <Card key={court.id}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{court.name}</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/owner/courts/${court.id}/slots/new?date=${selectedDate}`}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Agregar
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {courtSlots.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Sin turnos</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {courtSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg border p-2 text-center ${
                          slot.status === "available"
                            ? "border-emerald-200 bg-emerald-50"
                            : slot.status === "booked"
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <p className="text-xs font-semibold text-gray-800">
                          {formatTime(slot.start_time)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatCurrency(slot.price)}
                        </p>
                        <Badge
                          variant={statusVariant[slot.status] ?? "secondary"}
                          className="mt-1 text-[10px] px-1.5 py-0"
                        >
                          {statusLabel[slot.status]}
                        </Badge>
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

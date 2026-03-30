import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Court } from "@/types";

const statusLabel: Record<string, string> = {
  available: "Disponible",
  booked: "Reservada",
  blocked: "Bloqueada",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "warning" | "outline"> = {
  available: "default",
  booked: "warning",
  blocked: "destructive",
};

export default async function AllSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: qDate } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = qDate ?? today;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: complex } = await supabase
    .from("complexes")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!complex) redirect("/dashboard/setup");

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("complex_id", complex.id)
    .eq("active", true)
    .order("name");

  const courtIds = courts?.map((c) => c.id) ?? [];
  const { data: slots } = courtIds.length > 0
    ? await supabase
        .from("slots")
        .select("*, court:courts!slots_court_id_fkey(name)")
        .in("court_id", courtIds)
        .eq("date", selectedDate)
        .order("start_time")
    : { data: [] };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
        <p className="text-sm text-gray-500">{formatDate(selectedDate)}</p>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/courts/slots?date=${d}`}
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

      {/* Manage per-court */}
      <div className="flex flex-wrap gap-2">
        {(courts as Court[] ?? []).map((court) => (
          <Link
            key={court.id}
            href={`/courts/${court.id}/slots?date=${selectedDate}`}
            className="text-sm px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            + Agregar turnos a {court.name}
          </Link>
        ))}
      </div>

      {!slots || slots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-3xl mb-2">📅</p>
          <p>No hay turnos para este día</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {(slot.court as { name: string })?.name} — {formatTime(slot.start_time)} a {formatTime(slot.end_time)}
                </p>
                <p className="text-xs text-gray-500">{formatCurrency(slot.price)}</p>
              </div>
              <Badge variant={statusVariant[slot.status] ?? "secondary"}>
                {statusLabel[slot.status] ?? slot.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

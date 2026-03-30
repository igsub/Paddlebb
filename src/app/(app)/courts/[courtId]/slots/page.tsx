import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Slot } from "@/types";

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

export default async function CourtSlotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ courtId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { courtId } = await params;
  const { date: qDate } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = qDate ?? today;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: court } = await supabase
    .from("courts")
    .select("*, complex:complexes!courts_complex_id_fkey(owner_id, name)")
    .eq("id", courtId)
    .single();

  if (!court || (court.complex as { owner_id: string }).owner_id !== user.id) redirect("/courts");

  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("court_id", courtId)
    .eq("date", selectedDate)
    .order("start_time");

  // Generate date tabs (today + next 6 days)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos — {court.name}</h1>
          <p className="text-sm text-gray-500">{(court.complex as { name: string }).name}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/courts/${courtId}/slots/new?date=${selectedDate}`}>
            <PlusCircle className="h-4 w-4" />
            Agregar
          </Link>
        </Button>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/courts/${courtId}/slots?date=${d}`}
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

      {/* Slots */}
      {!slots || slots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-3xl mb-2">📅</p>
          <p className="font-medium">No hay turnos para este día</p>
          <Button asChild className="mt-4" size="sm">
            <Link href={`/courts/${courtId}/slots/new?date=${selectedDate}`}>Agregar turnos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(slots as Slot[]).map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
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

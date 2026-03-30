import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatCurrency } from "@/lib/utils";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Slot } from "@/types";
import { DeleteSlotButton } from "./delete-slot-button";

const statusLabel: Record<string, string> = {
  available: "Disponible",
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

export default async function OwnerCourtSlotsPage({
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/owner/login");

  const { data: court } = await supabase
    .from("courts")
    .select("*, complex:complexes!courts_complex_id_fkey(owner_id, name)")
    .eq("id", courtId)
    .single();

  if (
    !court ||
    (court.complex as { owner_id: string }).owner_id !== user.id
  ) {
    redirect("/owner/courts");
  }

  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("court_id", courtId)
    .eq("date", selectedDate)
    .order("start_time");

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/owner/courts" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{court.name}</h1>
          <p className="text-xs text-gray-500">
            {(court.complex as { name: string }).name}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/owner/courts/${courtId}/slots/new?date=${selectedDate}`}>
            <PlusCircle className="h-4 w-4" />
            Agregar turnos
          </Link>
        </Button>
      </div>

      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {dates.map((d) => {
          const date = new Date(d + "T00:00:00");
          const isSelected = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/owner/courts/${courtId}/slots?date=${d}`}
              className={`flex flex-col items-center min-w-[48px] rounded-xl px-2 py-2 text-xs font-medium transition-colors shrink-0 ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="uppercase">
                {date.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold leading-tight">
                {date.getDate()}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Slots */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!slots || slots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm">Sin turnos para este día</p>
              <Button asChild size="sm" className="mt-3">
                <Link
                  href={`/owner/courts/${courtId}/slots/new?date=${selectedDate}`}
                >
                  Crear turnos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(slots as Slot[]).map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(slot.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[slot.status] ?? "secondary"}>
                      {statusLabel[slot.status] ?? slot.status}
                    </Badge>
                    {slot.status === "available" && (
                      <DeleteSlotButton slotId={slot.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

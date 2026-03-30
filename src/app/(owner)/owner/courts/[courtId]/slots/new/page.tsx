"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewOwnerSlotsPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultDate = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(defaultDate);
  const [dateTo, setDateTo] = useState(defaultDate);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("22:00");
  const [duration, setDuration] = useState(90);
  const [price, setPrice] = useState(5000);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  function countSlots() {
    const from = new Date(dateFrom + "T00:00:00");
    const to = new Date(dateTo + "T00:00:00");
    let days = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) days++;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    const slotsPerDay = Math.floor(totalMinutes / duration);
    return days * Math.max(0, slotsPerDay);
  }

  function generateSlots(date: string) {
    const slots = [];
    const [eh, em] = endTime.split(":").map(Number);
    const endMins = eh * 60 + em;
    let current = startTime;

    while (true) {
      const [h, m] = current.split(":").map(Number);
      const nextMins = h * 60 + m + duration;
      if (nextMins > endMins) break;

      const endH = Math.floor(nextMins / 60);
      const endM = nextMins % 60;
      const next = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      slots.push({
        court_id: courtId,
        date,
        start_time: current,
        end_time: next,
        price,
        status: "available",
      });

      current = next;
    }
    return slots;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const allSlots = [];

    const from = new Date(dateFrom + "T00:00:00");
    const to = new Date(dateTo + "T00:00:00");

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      allSlots.push(...generateSlots(d.toISOString().split("T")[0]));
    }

    if (allSlots.length === 0) {
      setError("No se generaron turnos. Verificá los horarios y duración.");
      setLoading(false);
      return;
    }

    const { error, count } = await supabase
      .from("slots")
      .insert(allSlots, { count: "exact" });

    if (error) {
      setError(
        error.code === "23505"
          ? "Ya existen turnos para alguno de esos horarios. Verificá el rango."
          : error.message
      );
      setLoading(false);
      return;
    }

    setPreview(count ?? allSlots.length);
    setLoading(false);
    setTimeout(() => {
      router.push(`/owner/courts/${courtId}/slots?date=${dateFrom}`);
      router.refresh();
    }, 1200);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear turnos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Los turnos se generan automáticamente para el rango seleccionado
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Se crearán turnos consecutivos de la duración indicada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {preview !== null && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                ✓ Se crearon {preview} turnos
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Rango de fechas
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={(e) => setDateTo(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Horario de apertura
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Primer turno</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Último turno termina</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duración del turno</Label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={60}>60 min (1 hora)</option>
                  <option value={90}>90 min (1h 30m)</option>
                  <option value={120}>120 min (2 horas)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Precio (ARS)</Label>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Preview count */}
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              Se crearán aproximadamente{" "}
              <strong>{countSlots()} turnos</strong>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || preview !== null} className="flex-1">
              {loading ? "Creando..." : "Crear turnos"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

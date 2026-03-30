"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewSlotsPage({
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
  const [duration, setDuration] = useState(90); // minutes
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(0);

  function generateSlots(date: string) {
    const slots = [];
    let current = startTime;

    while (true) {
      const [h, m] = current.split(":").map(Number);
      const totalMins = h * 60 + m + duration;
      if (totalMins > 24 * 60) break;

      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      const next = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      if (next > endTime) break;

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
      const dateStr = d.toISOString().split("T")[0];
      allSlots.push(...generateSlots(dateStr));
    }

    if (allSlots.length === 0) {
      setError("No se generaron turnos. Verificá los horarios y duración.");
      setLoading(false);
      return;
    }

    const { error, count } = await supabase.from("slots").insert(allSlots, { count: "exact" });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCreated(count ?? allSlots.length);
    setLoading(false);

    setTimeout(() => {
      router.push(`/courts/${courtId}/slots?date=${dateFrom}`);
      router.refresh();
    }, 1500);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear turnos</h1>
        <p className="text-sm text-gray-500 mt-1">Los turnos se generan automáticamente según los parámetros</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configuración de turnos</CardTitle>
            <CardDescription>
              Se crearán todos los turnos del rango de fechas, con la duración indicada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}
            {created > 0 && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                ✓ Se crearon {created} turnos exitosamente
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Desde</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Hasta</Label>
                <Input type="date" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Horario inicio</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Horario fin</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min={30}
                  max={180}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Precio (ARS)</Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creando..." : "Crear turnos"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

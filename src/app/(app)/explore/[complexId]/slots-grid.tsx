"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatTime, formatCurrency } from "@/lib/utils";
import { Slot } from "@/types";
import { BookButton } from "./book-button";
import { WaitlistButton } from "./waitlist-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

const surfaceLabels: Record<string, string> = {
  cemento: "Cemento",
  cesped_sintetico: "Césped sint.",
  madera: "Madera",
  cristal: "Cristal",
};

interface Court {
  id: string;
  name: string;
  surface: string;
  indoor: boolean;
}

interface SlotsGridProps {
  courts: Court[];
  initialSlots: Slot[];
  selectedDate: string;
  complexId: string;
  userId: string | null;
  waitlistedSlotIds: string[];
}

export function SlotsGrid({
  courts,
  initialSlots,
  selectedDate,
  complexId,
  userId,
  waitlistedSlotIds: initialWaitlisted,
}: SlotsGridProps) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [waitlisted, setWaitlisted] = useState<Set<string>>(
    new Set(initialWaitlisted)
  );
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const courtIds = new Set(courts.map((c) => c.id));

    const channel = supabase
      .channel(`slots-${complexId}-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "slots",
        },
        (payload) => {
          const updated = payload.new as Slot;
          if (!courtIds.has(updated.court_id)) return;
          if (updated.date !== selectedDate) return;
          setSlots((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complexId, selectedDate, courts]);

  const slotsByCourtId: Record<string, Slot[]> = {};
  for (const slot of slots) {
    if (!slotsByCourtId[slot.court_id]) slotsByCourtId[slot.court_id] = [];
    slotsByCourtId[slot.court_id].push(slot);
  }

  return (
    <div className="space-y-4">
      {live && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <Wifi className="h-3.5 w-3.5" />
          Disponibilidad en tiempo real
        </div>
      )}

      {courts.length === 0 ? (
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
                  {court.name}
                  <Badge variant="secondary">
                    {surfaceLabels[court.surface] ?? court.surface}
                  </Badge>
                  {court.indoor && (
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
                          {slot.status === "available" && userId && (
                            <BookButton
                              slotId={slot.id}
                              complexId={complexId}
                              date={selectedDate}
                            />
                          )}
                          {slot.status === "booked" && userId && (
                            <WaitlistButton
                              slotId={slot.id}
                              isWaitlisted={waitlisted.has(slot.id)}
                              onToggle={(slotId, joined) => {
                                setWaitlisted((prev) => {
                                  const next = new Set(prev);
                                  joined ? next.add(slotId) : next.delete(slotId);
                                  return next;
                                });
                              }}
                            />
                          )}
                          {slot.status === "blocked" && (
                            <span className="text-xs text-gray-400">
                              No disponible
                            </span>
                          )}
                          {!userId && slot.status === "available" && (
                            <Link
                              href="/login"
                              className="block text-xs text-emerald-600 font-semibold py-1"
                            >
                              Reservar
                            </Link>
                          )}
                          {slot.status === "booked" && !userId && (
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

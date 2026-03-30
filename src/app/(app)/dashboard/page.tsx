import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { PlusCircle, Calendar, Users } from "lucide-react";
import { Booking, Complex } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "complex_owner") redirect("/explore");

  // Load complex
  const { data: complex } = await supabase
    .from("complexes")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!complex) {
    redirect("/dashboard/setup");
  }

  // Load today's bookings
  const today = new Date().toISOString().split("T")[0];
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      player:profiles!bookings_player_id_fkey(full_name, email, phone),
      slot:slots!bookings_slot_id_fkey(
        date, start_time, end_time, price,
        court:courts!slots_court_id_fkey(name, complex_id)
      )
    `)
    .eq("status", "confirmed")
    .eq("slot.date", today)
    .order("slot(start_time)");

  // Stats
  const { count: totalCourts } = await supabase
    .from("courts")
    .select("id", { count: "exact" })
    .eq("complex_id", complex.id)
    .eq("active", true);

  const { count: todayBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact" })
    .eq("status", "confirmed")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{(complex as Complex).name}</h1>
          <p className="text-sm text-gray-500">{(complex as Complex).address}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/courts/new">
            <PlusCircle className="h-4 w-4" />
            Nueva cancha
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayBookings ?? 0}</p>
              <p className="text-xs text-gray-500">Reservas hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCourts ?? 0}</p>
              <p className="text-xs text-gray-500">Canchas activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-1">
          <Link href="/courts">
            <span className="text-xl">🏟️</span>
            <span className="text-sm">Gestionar canchas</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-1">
          <Link href="/courts/slots">
            <span className="text-xl">📅</span>
            <span className="text-sm">Gestionar turnos</span>
          </Link>
        </Button>
      </div>

      {/* Today's bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservas de hoy — {formatDate(today)}</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No hay reservas para hoy</p>
          ) : (
            <div className="space-y-3">
              {(bookings as unknown as Booking[]).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {booking.slot?.court?.name} —{" "}
                      {booking.slot ? formatTime(booking.slot.start_time) : ""} a{" "}
                      {booking.slot ? formatTime(booking.slot.end_time) : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(booking.player as unknown as { full_name: string })?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{booking.slot ? formatCurrency(booking.slot.price) : ""}</Badge>
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

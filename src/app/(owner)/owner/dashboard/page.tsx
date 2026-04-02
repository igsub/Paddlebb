import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Users,
  Star,
  TrendingUp,
  PlusCircle,
  CalendarDays,
  BookOpen,
} from "lucide-react";

export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/owner/login");

  const { data: complex } = await supabase
    .from("complexes")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!complex) redirect("/owner/setup");

  const today = new Date().toISOString().split("T")[0];

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const [
    { count: todayBookings },
    { count: weekBookings },
    { count: totalCourts },
    { data: todayBookingList },
    { data: ratings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "confirmed")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`),
    supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "confirmed")
      .gte("created_at", `${weekStartStr}T00:00:00`),
    supabase
      .from("courts")
      .select("id", { count: "exact" })
      .eq("complex_id", complex.id)
      .eq("active", true),
    supabase
      .from("bookings")
      .select(`
        id,
        player:profiles!bookings_player_id_fkey(full_name),
        slot:slots!bookings_slot_id_fkey(
          date, start_time, end_time, price,
          court:courts!slots_court_id_fkey(name)
        )
      `)
      .eq("status", "confirmed")
      .eq("slot.date", today)
      .order("slot(start_time)"),
    supabase
      .from("ratings")
      .select("score")
      .eq("complex_id", complex.id),
  ]);

  const avgRating =
    ratings && ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complex.name}</h1>
          <p className="text-sm text-gray-500">
            {complex.address}, {complex.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/owner/complex/edit">Editar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/owner/courts/new">
              <PlusCircle className="h-4 w-4" />
              Cancha
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: Calendar,
            color: "text-emerald-600",
            label: "Hoy",
            value: todayBookings ?? 0,
            sub: "reservas",
          },
          {
            icon: TrendingUp,
            color: "text-blue-600",
            label: "Esta semana",
            value: weekBookings ?? 0,
            sub: "reservas",
          },
          {
            icon: Users,
            color: "text-purple-600",
            label: "Canchas",
            value: totalCourts ?? 0,
            sub: "activas",
          },
          {
            icon: Star,
            color: "text-yellow-500",
            label: "Rating",
            value: avgRating ?? "—",
            sub: `${ratings?.length ?? 0} opiniones`,
          },
        ].map(({ icon: Icon, color, label, value, sub }, i) => (
          <Card key={i}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-16 flex-col gap-1">
          <Link href="/owner/slots">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <span className="text-xs">Ver / crear turnos</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 flex-col gap-1">
          <Link href="/owner/bookings">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <span className="text-xs">Ver reservas</span>
          </Link>
        </Button>
      </div>

      {/* Today's schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Agenda de hoy — {formatDate(today)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!todayBookingList || todayBookingList.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-2xl mb-1">📅</p>
              <p className="text-sm">No hay reservas para hoy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayBookingList.map((booking) => {
                const slot = booking.slot as unknown as {
                  start_time: string;
                  end_time: string;
                  price: number;
                  court: { name: string };
                } | null;
                const player = booking.player as unknown as { full_name: string } | null;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {slot?.court?.name} ·{" "}
                        {slot ? formatTime(slot.start_time) : ""} →{" "}
                        {slot ? formatTime(slot.end_time) : ""}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {player?.full_name}
                      </p>
                    </div>
                    <Badge variant="default" className="shrink-0">
                      {slot ? formatCurrency(slot.price) : ""}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

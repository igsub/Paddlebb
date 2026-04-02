import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  const [
    { count: totalComplexes },
    { count: totalUsers },
    { count: totalBookings },
    { data: complexes },
  ] = await Promise.all([
    supabase.from("complexes").select("id", { count: "exact" }),
    supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("role", "player"),
    supabase.from("bookings").select("id", { count: "exact" }).eq("status", "confirmed"),
    supabase
      .from("complexes")
      .select("id, name, city, avg_rating, created_at, owner:profiles!complexes_owner_id_fkey(full_name, email)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm">Panel de administración de Padelbb</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Complejos", value: totalComplexes ?? 0 },
          { label: "Jugadores", value: totalUsers ?? 0 },
          { label: "Reservas activas", value: totalBookings ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-800 rounded-xl p-5">
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/complexes/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
        >
          + Nuevo complejo
        </Link>
        <Link
          href="/admin/owners/new"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
        >
          + Nuevo dueño de complejo
        </Link>
      </div>

      {/* Complexes list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Complejos registrados</h2>
        {!complexes || complexes.length === 0 ? (
          <p className="text-gray-400">Sin complejos registrados aún.</p>
        ) : (
          <div className="space-y-2">
            {complexes.map((complex) => {
              const owner = complex.owner as unknown as { full_name: string; email: string } | null;
              return (
                <div
                  key={complex.id}
                  className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{complex.name}</p>
                    <p className="text-gray-400 text-xs">
                      {complex.city} · Dueño: {owner?.full_name ?? "—"} ({owner?.email})
                    </p>
                    <p className="text-gray-500 text-xs">
                      Creado: {formatDate(complex.created_at.split("T")[0])}
                      {complex.avg_rating ? ` · ⭐ ${complex.avg_rating}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

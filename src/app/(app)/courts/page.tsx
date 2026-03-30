import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Court } from "@/types";

const surfaceLabels: Record<string, string> = {
  cemento: "Cemento",
  cesped_sintetico: "Césped sintético",
  madera: "Madera",
  cristal: "Cristal",
};

export default async function CourtsPage() {
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
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Canchas</h1>
        <Button asChild size="sm">
          <Link href="/courts/new">
            <PlusCircle className="h-4 w-4" />
            Agregar
          </Link>
        </Button>
      </div>

      {!courts || courts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-medium">Todavía no tenés canchas</p>
          <p className="text-sm mt-1">Agregá tu primera cancha para comenzar a recibir reservas</p>
          <Button asChild className="mt-4">
            <Link href="/courts/new">Agregar cancha</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(courts as Court[]).map((court) => (
            <Card key={court.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{court.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{surfaceLabels[court.surface] ?? court.surface}</Badge>
                    {court.indoor && <Badge variant="outline">Cubierta</Badge>}
                    {!court.active && <Badge variant="destructive">Inactiva</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/courts/${court.id}/slots`}>Turnos</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/courts/${court.id}/edit`}>Editar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

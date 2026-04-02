import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ChevronRight } from "lucide-react";
import { Court } from "@/types";
import { CourtActions } from "./court-actions";

const surfaceLabels: Record<string, string> = {
  cemento: "Cemento",
  cesped_sintetico: "Césped sint.",
  madera: "Madera",
  cristal: "Cristal",
};

export default async function OwnerCourtsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/owner/login");

  const { data: complex } = await supabase
    .from("complexes")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!complex) redirect("/owner/setup");

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("complex_id", complex.id)
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis canchas</h1>
        <Button asChild size="sm">
          <Link href="/owner/courts/new">
            <PlusCircle className="h-4 w-4" />
            Agregar
          </Link>
        </Button>
      </div>

      {!courts || courts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-semibold text-gray-700">Sin canchas todavía</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Agregá tu primera cancha para comenzar
          </p>
          <Button asChild>
            <Link href="/owner/courts/new">Agregar cancha</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(courts as Court[]).map((court) => (
            <Link key={court.id} href={`/owner/courts/${court.id}/slots`}>
              <Card className="hover:border-emerald-300 transition-colors cursor-pointer">
                <CardContent className="py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{court.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">
                        {surfaceLabels[court.surface] ?? court.surface}
                      </Badge>
                      {court.indoor && (
                        <Badge variant="outline">Cubierta</Badge>
                      )}
                      {!court.active && (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CourtActions
                      courtId={court.id}
                      isActive={court.active}
                      courtName={court.name}
                    />
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Complex } from "@/types";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: complexes } = await supabase
    .from("complexes")
    .select("*")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explorar complejos</h1>
        <p className="text-sm text-gray-500 mt-1">Encontrá un complejo y reservá tu turno</p>
      </div>

      {!complexes || complexes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-medium">No hay complejos disponibles aún</p>
          <p className="text-sm mt-1">Volvé más tarde</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(complexes as Complex[]).map((complex) => (
            <Link key={complex.id} href={`/explore/${complex.id}`}>
              <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{complex.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {complex.address}, {complex.city}
                      </div>
                      {complex.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{complex.description}</p>
                      )}
                    </div>
                    <div className="text-2xl ml-3">🏟️</div>
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

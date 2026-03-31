import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./explore-client";

export default async function ExplorePage() {
  const supabase = await createClient();

  const [{ data: complexes }, { data: courts }] = await Promise.all([
    supabase
      .from("complexes")
      .select("id, name, address, city, description, avg_rating, lat, lng, whatsapp")
      .order("name"),
    supabase
      .from("courts")
      .select("id, complex_id, indoor, active")
      .eq("active", true),
  ]);

  // Attach court info to complexes
  const courtsByComplex: Record<string, { indoor: boolean }[]> = {};
  for (const court of courts ?? []) {
    if (!courtsByComplex[court.complex_id]) courtsByComplex[court.complex_id] = [];
    courtsByComplex[court.complex_id].push({ indoor: court.indoor });
  }

  const enriched = (complexes ?? []).map((c) => ({
    ...c,
    courts: courtsByComplex[c.id] ?? [],
  }));

  // Unique cities for filter
  const cities = [...new Set((complexes ?? []).map((c) => c.city).filter(Boolean))].sort();

  return <ExploreClient complexes={enriched} cities={cities} />;
}

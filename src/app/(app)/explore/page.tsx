import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "./explore-client";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: complexes } = await supabase
    .from("complexes")
    .select("id, name, address, city, description, avg_rating, lat, lng, whatsapp")
    .order("name");

  return <ExploreClient complexes={complexes ?? []} />;
}

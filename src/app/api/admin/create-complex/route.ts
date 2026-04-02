import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { owner_id, name, address, city, phone, whatsapp, description, lat, lng, cancellation_hours } = body;

  if (!owner_id || !name || !address || !city) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient.from("complexes").insert({
    owner_id,
    name,
    address,
    city,
    phone: phone || null,
    whatsapp: whatsapp || null,
    description: description || null,
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    cancellation_hours: parseInt(cancellation_hours) || 2,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

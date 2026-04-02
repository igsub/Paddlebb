import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
  // Verify caller is admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { full_name, email, password, phone } = await request.json();

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  // Create the auth user
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "complex_owner",
      },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Update profile with phone if provided
  if (phone && newUser.user) {
    await adminClient
      .from("profiles")
      .update({ phone })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ success: true, userId: newUser.user?.id });
}

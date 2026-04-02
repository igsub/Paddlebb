import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/owner/login", "/admin/login", "/landing"];
  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2)$/);

  if (!user && !isPublic) {
    // Redirect to appropriate login based on path
    const url = request.nextUrl.clone();
    if (pathname.startsWith("/owner")) {
      url.pathname = "/owner/login";
    } else if (pathname.startsWith("/admin")) {
      url.pathname = "/admin/login";
    } else {
      url.pathname = "/login";
    }
    return NextResponse.redirect(url);
  }

  // Protect owner routes: only complex_owners can access /owner/*
  if (user && pathname.startsWith("/owner") && !pathname.startsWith("/owner/login")) {
    const role = user.user_metadata?.role;
    if (role !== "complex_owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes: only admins
  if (user && pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const role = user.user_metadata?.role;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Prevent owners/admins from accessing player routes
  if (user && (pathname.startsWith("/explore") || pathname.startsWith("/bookings"))) {
    const role = user.user_metadata?.role;
    if (role === "complex_owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/dashboard";
      return NextResponse.redirect(url);
    }
    if (role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

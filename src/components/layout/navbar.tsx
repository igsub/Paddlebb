"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Home, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  profile: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOwner = profile.role === "complex_owner";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const playerLinks = [
    { href: "/explore", label: "Explorar", icon: Home },
    { href: "/bookings", label: "Mis turnos", icon: Calendar },
  ];

  const ownerLinks = [
    { href: "/dashboard", label: "Panel", icon: Home },
    { href: "/courts", label: "Canchas", icon: PlusSquare },
  ];

  const links = isOwner ? ownerLinks : playerLinks;

  return (
    <>
      {/* Top bar (desktop) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <Link href={isOwner ? "/dashboard" : "/explore"} className="font-bold text-xl text-emerald-700">
          Paddlebb
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{profile.full_name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <span className="font-bold text-lg text-emerald-700">Paddlebb</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 truncate max-w-[120px]">{profile.full_name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-emerald-600"
                  : "text-gray-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium text-gray-500"
          >
            <User className="h-5 w-5" />
            Salir
          </button>
        </div>
      </nav>
    </>
  );
}

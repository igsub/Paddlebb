"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Grid, CalendarDays, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerNavbarProps {
  profile: Profile;
}

const links = [
  { href: "/owner/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/owner/courts", label: "Canchas", icon: Grid },
  { href: "/owner/slots", label: "Turnos", icon: CalendarDays },
  { href: "/owner/bookings", label: "Reservas", icon: BookOpen },
];

export function OwnerNavbar({ profile }: OwnerNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/owner/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-gray-900 text-white sticky top-0 z-40">
        <Link href="/owner/dashboard" className="font-bold text-lg text-white flex items-center gap-2">
          <span>🏟️</span> Padelbb Complejos
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-white/20 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{profile.full_name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white sticky top-0 z-40">
        <span className="font-bold text-base text-white">🏟️ Mi Complejo</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-gray-300 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40 pb-safe">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                pathname.startsWith(href) ? "text-white" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

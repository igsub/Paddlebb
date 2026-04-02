"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Profile } from "@/types";
import { Calendar, Search, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  profile: Profile;
}

const playerLinks = [
  { href: "/explore", label: "Explorar", icon: Search },
  { href: "/matches", label: "Partidos", icon: Users },
  { href: "/bookings", label: "Mis turnos", icon: Calendar },
  { href: "/profile", label: "Perfil", icon: User },
];

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <Link href="/explore" className="font-bold text-xl text-emerald-700">
          🎾 Padelbb
        </Link>
        <nav className="flex items-center gap-1">
          {playerLinks.map(({ href, label }) => (
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
        <span className="text-sm text-gray-500 max-w-[150px] truncate">
          {profile.full_name}
        </span>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <span className="font-bold text-base text-emerald-700">🎾 Padelbb</span>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {playerLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                pathname.startsWith(href) ? "text-emerald-600" : "text-gray-400"
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

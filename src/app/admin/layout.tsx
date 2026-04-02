import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminLogout } from "./admin-logout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page doesn't need auth check
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user && user.user_metadata?.role === "admin" && (
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
          <Link href="/admin" className="font-bold text-sm text-white">
            Padelbb Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/admin" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/complexes/new" className="hover:text-white">
              + Complejo
            </Link>
            <Link href="/admin/owners/new" className="hover:text-white">
              + Dueño
            </Link>
          </nav>
          <AdminLogout />
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OwnerNavbar } from "@/components/layout/owner-navbar";
import { PushManager } from "@/components/layout/push-manager";
import { Profile } from "@/types";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/owner/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "complex_owner") {
    redirect("/owner/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/owner/login");

  return (
    <div className="flex flex-col min-h-screen">
      <OwnerNavbar profile={profile as Profile} />
      <PushManager />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}

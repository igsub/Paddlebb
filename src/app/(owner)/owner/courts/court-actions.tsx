"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CourtActionsProps {
  courtId: string;
  isActive: boolean;
  courtName: string;
}

export function CourtActions({ courtId, isActive, courtName }: CourtActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault(); // Don't navigate to slots page
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("courts")
      .update({ active: !active })
      .eq("id", courtId);

    if (!error) {
      setActive((v) => !v);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={active ? `Desactivar ${courtName}` : `Activar ${courtName}`}
      className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
        active
          ? "text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600"
          : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
      }`}
    >
      {loading ? "..." : active ? "Desactivar" : "Activar"}
    </button>
  );
}

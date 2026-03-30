"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

export function DeleteSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este turno?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("slots").delete().eq("id", slotId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Eliminar turno"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

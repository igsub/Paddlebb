"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewCourtPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surface, setSurface] = useState("cemento");
  const [indoor, setIndoor] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: complex } = await supabase
      .from("complexes")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!complex) { router.push("/dashboard/setup"); return; }

    const { error } = await supabase.from("courts").insert({
      complex_id: complex.id,
      name,
      surface,
      indoor,
      active: true,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/courts");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva cancha</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Datos de la cancha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}
            <div className="space-y-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Cancha 1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Superficie *</Label>
              <Select value={surface} onValueChange={setSurface}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cemento">Cemento</SelectItem>
                  <SelectItem value="cesped_sintetico">Césped sintético</SelectItem>
                  <SelectItem value="madera">Madera</SelectItem>
                  <SelectItem value="cristal">Cristal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="indoor"
                type="checkbox"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="indoor" className="cursor-pointer">Cancha cubierta</Label>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Crear cancha"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

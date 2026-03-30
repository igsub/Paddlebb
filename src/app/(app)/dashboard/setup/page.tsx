"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplexSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("complexes").insert({
      owner_id: user.id,
      name,
      address,
      city,
      phone: phone || null,
      description: description || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurá tu complejo</h1>
        <p className="text-gray-500 text-sm mt-1">Completá los datos de tu complejo de paddle para comenzar</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Datos del complejo</CardTitle>
            <CardDescription>Esta información verán los jugadores al buscar canchas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="name">Nombre del complejo *</Label>
              <Input id="name" placeholder="Club de Paddle Norte" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Dirección *</Label>
              <Input id="address" placeholder="Av. Corrientes 1234" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">Ciudad *</Label>
              <Input id="city" placeholder="Buenos Aires" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="+54 11 1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Contá brevemente sobre tu complejo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Crear complejo"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OwnerSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    whatsapp: "",
    description: "",
    cancellation_hours: 2,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/owner/login");
      return;
    }

    const { error } = await supabase.from("complexes").insert({
      owner_id: user.id,
      name: form.name,
      address: form.address,
      city: form.city,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      description: form.description || null,
      cancellation_hours: form.cancellation_hours,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/owner/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurá tu complejo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completá los datos para comenzar a recibir reservas
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Datos del complejo</CardTitle>
            <CardDescription>
              Esta información la verán los jugadores al buscar canchas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del complejo *</Label>
              <Input
                id="name"
                placeholder="Club de Padel Norte"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                placeholder="Av. Corrientes 1234"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                placeholder="Buenos Aires"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+54 11 1234-5678"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="+54911..."
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cancellation_hours">
                Cancelación hasta (horas antes)
              </Label>
              <Input
                id="cancellation_hours"
                type="number"
                min={0}
                max={72}
                value={form.cancellation_hours}
                onChange={(e) => set("cancellation_hours", Number(e.target.value))}
              />
              <p className="text-xs text-gray-400">
                El jugador podrá cancelar hasta {form.cancellation_hours}h antes del
                turno
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Contá sobre tu complejo, instalaciones, estacionamiento..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Guardando..." : "Guardar y continuar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

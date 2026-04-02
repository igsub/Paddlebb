"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerOption {
  id: string;
  full_name: string;
  email: string;
}

export default function AdminNewComplexPage() {
  const router = useRouter();
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    whatsapp: "",
    description: "",
    lat: "",
    lng: "",
    cancellation_hours: "2",
    owner_id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "complex_owner")
      .then(({ data }) => setOwners(data ?? []));
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function geocodeAddress() {
    if (!form.address || !form.city) return;
    const query = encodeURIComponent(`${form.address}, ${form.city}, Argentina`);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data[0]) {
        setForm((prev) => ({
          ...prev,
          lat: data[0].lat,
          lng: data[0].lon,
        }));
      } else {
        alert("No se encontró la dirección. Ingresá las coordenadas manualmente.");
      }
    } catch {
      alert("Error al geocodificar. Intentá de nuevo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.owner_id) {
      setError("Seleccioná un dueño para el complejo");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/create-complex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al crear el complejo");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Nuevo complejo</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-gray-300">Asignar a dueño *</Label>
          <select
            value={form.owner_id}
            onChange={(e) => set("owner_id", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Seleccioná un dueño...</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.full_name} ({o.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Si no hay dueños,{" "}
            <a href="/admin/owners/new" className="text-emerald-400 hover:underline">
              creá uno primero
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-gray-300">Nombre del complejo *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-gray-300">Dirección *</Label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Av. Corrientes 1234"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Ciudad *</Label>
            <Input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Buenos Aires"
              required
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={geocodeAddress}
              className="w-full border-gray-600 text-gray-300 hover:text-white bg-gray-700"
            >
              📍 Geocodificar dirección
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Latitud</Label>
            <Input
              value={form.lat}
              onChange={(e) => set("lat", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="-34.6037"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Longitud</Label>
            <Input
              value={form.lng}
              onChange={(e) => set("lng", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="-58.3816"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">WhatsApp</Label>
            <Input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="+54911..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Cancelación (horas antes)</Label>
            <Input
              type="number"
              value={form.cancellation_hours}
              onChange={(e) => set("cancellation_hours", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              min={0}
              max={72}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-gray-300">Descripción</Label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="flex w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin")}
            className="flex-1 border-gray-600 text-gray-300 hover:text-white bg-gray-700"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creando..." : "Crear complejo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

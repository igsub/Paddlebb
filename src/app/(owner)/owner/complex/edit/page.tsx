"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

type FormState = {
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  description: string;
  cancellation_hours: number;
};

export default function EditComplexPage() {
  const router = useRouter();
  const [complexId, setComplexId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    address: "",
    city: "",
    phone: "",
    whatsapp: "",
    description: "",
    cancellation_hours: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormState, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/owner/login"); return; }

      const { data: complex } = await supabase
        .from("complexes")
        .select("id, name, address, city, phone, whatsapp, description, cancellation_hours")
        .eq("owner_id", user.id)
        .single();

      if (!complex) { router.push("/owner/setup"); return; }

      setComplexId(complex.id);
      setForm({
        name: complex.name ?? "",
        address: complex.address ?? "",
        city: complex.city ?? "",
        phone: complex.phone ?? "",
        whatsapp: complex.whatsapp ?? "",
        description: complex.description ?? "",
        cancellation_hours: complex.cancellation_hours ?? 2,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complexId) return;
    setError("");
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("complexes")
      .update({
        name: form.name,
        address: form.address,
        city: form.city,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        description: form.description || null,
        cancellation_hours: form.cancellation_hours,
      })
      .eq("id", complexId);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-48 mb-6" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/owner/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar complejo</h1>
          <p className="text-sm text-gray-500">Actualizá los datos de tu complejo</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base">Datos del complejo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Cambios guardados correctamente
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del complejo *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
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
                El jugador podrá cancelar hasta {form.cancellation_hours}h antes del turno
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
            <Button type="submit" className="w-full h-12" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

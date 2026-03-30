"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminNewOwnerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Use admin API route to create the user with complex_owner role
    const res = await fetch("/api/admin/create-owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al crear el usuario");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-6 py-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white">Dueño creado exitosamente</h2>
        <p className="text-gray-400 mt-2">
          Se creó la cuenta para <strong>{form.full_name}</strong> ({form.email})
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Comunicale sus credenciales para que pueda acceder al portal de complejos.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={() => router.push("/admin/complexes/new")} variant="outline" className="border-gray-600 text-gray-300">
            Crear complejo para este dueño
          </Button>
          <Button onClick={() => router.push("/admin")}>
            Volver al admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Nuevo dueño de complejo</h1>
      <p className="text-gray-400 text-sm mb-6">
        Creá la cuenta del encargado del complejo. Luego asignale un complejo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Nombre completo *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300">Email *</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300">Contraseña inicial *</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <p className="text-xs text-gray-500">
            Comunicale esta contraseña al dueño. Se recomienda que la cambie en su primer acceso.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300">Teléfono</Label>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="+54 11..."
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin")}
            className="flex-1 border-gray-600 text-gray-300 bg-gray-700"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creando..." : "Crear dueño"}
          </Button>
        </div>
      </form>
    </div>
  );
}

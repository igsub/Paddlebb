"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "player", phone: phone || null },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If Supabase requires email confirmation, session will be null
    if (!data.session) {
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    router.push("/explore");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎾</div>
          <h1 className="text-3xl font-bold text-emerald-700">Padelbb</h1>
          <p className="text-gray-500 text-sm mt-1">Reserva de canchas de padel</p>
        </div>
        {needsConfirmation ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-bold text-gray-900">
                Revisá tu email
              </h2>
              <p className="text-sm text-gray-500">
                Te enviamos un link de confirmación a{" "}
                <span className="font-medium text-gray-700">{email}</span>.
                Hacé clic en el link para activar tu cuenta.
              </p>
              <a
                href="/login"
                className="block mt-2 text-sm text-emerald-600 font-medium hover:underline"
              >
                Ya confirmé → Iniciar sesión
              </a>
            </CardContent>
          </Card>
        ) : (
        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>
              Registrate para empezar a reservar turnos
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Juan García"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Teléfono{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                ¿Ya tenés cuenta?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Iniciá sesión
                </Link>
              </p>
              <p className="text-xs text-gray-400 text-center">
                ¿Sos un complejo?{" "}
                <Link
                  href="/owner/login"
                  className="text-gray-500 hover:underline"
                >
                  Acceso para complejos
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
}

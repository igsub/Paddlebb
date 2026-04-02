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

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "complex_owner") {
      await supabase.auth.signOut();
      setError("Esta cuenta no tiene acceso al portal de complejos");
      setLoading(false);
      return;
    }

    router.push("/owner/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-gray-200">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏟️</div>
          <h1 className="text-3xl font-bold text-gray-800">Padelbb</h1>
          <p className="text-gray-500 text-sm mt-1">Portal para complejos</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso al complejo</CardTitle>
            <CardDescription>
              Ingresá con las credenciales de tu complejo
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="complejo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-12 text-base bg-gray-800 hover:bg-gray-900"
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                ¿Sos jugador?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline">
                  Acceso para jugadores
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

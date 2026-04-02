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

export default function AdminLoginPage() {
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
      setError("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== "admin") {
      await supabase.auth.signOut();
      setError("Acceso denegado. Solo administradores.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">ADMIN</p>
          <h1 className="text-2xl font-bold text-white">Padelbb</h1>
        </div>
        <Card className="border-gray-700 bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Acceso administrativo</CardTitle>
            <CardDescription className="text-gray-400">
              Solo para administradores del sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300">Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-900 hover:bg-gray-100"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

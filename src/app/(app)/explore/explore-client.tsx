"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Map, List, Search } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR
const ComplexesMap = dynamic(
  () => import("@/components/map/complexes-map").then((m) => m.ComplexesMap),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" /> }
);

interface Complex {
  id: string;
  name: string;
  address: string;
  city: string;
  description?: string | null;
  avg_rating?: number | null;
  lat?: number | null;
  lng?: number | null;
  whatsapp?: string | null;
}

interface ExploreClientProps {
  complexes: Complex[];
}

export function ExploreClient({ complexes }: ExploreClientProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complexes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [complexes, search]);

  const mappable = filtered.filter((c) => c.lat != null && c.lng != null) as (Complex & {
    lat: number;
    lng: number;
  })[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Explorar</h1>
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Mapa</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar complejo o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Map view */}
      {view === "map" && (
        <div className="space-y-4">
          {mappable.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
              No hay complejos con ubicación disponible
            </div>
          ) : (
            <ComplexesMap
              complexes={mappable}
              selectedId={selectedId}
              onSelect={setSelectedId}
              className="h-72 w-full"
            />
          )}
          {/* Selected complex card */}
          {selectedId && (
            <div>
              {filtered
                .filter((c) => c.id === selectedId)
                .map((c) => (
                  <ComplexCard key={c.id} complex={c} />
                ))}
            </div>
          )}
          {/* All complexes below map */}
          <div className="space-y-2">
            {filtered.map((c) => (
              <ComplexCard
                key={c.id}
                complex={c}
                highlighted={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">🏟️</p>
              <p className="font-medium">
                {search ? "Sin resultados" : "No hay complejos disponibles aún"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <ComplexCard key={c.id} complex={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ComplexCard({
  complex,
  highlighted,
  onClick,
}: {
  complex: Complex;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={`/explore/${complex.id}`} onClick={onClick}>
      <Card
        className={`hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer ${
          highlighted ? "border-emerald-500 shadow-md" : ""
        }`}
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{complex.name}</p>
                {complex.avg_rating && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600 font-medium">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {complex.avg_rating}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {complex.address}, {complex.city}
                </span>
              </div>
              {complex.description && (
                <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                  {complex.description}
                </p>
              )}
            </div>
            <div className="text-2xl shrink-0">🏟️</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

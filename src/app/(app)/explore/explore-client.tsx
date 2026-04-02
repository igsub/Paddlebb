"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Map, List, Search, SlidersHorizontal, X } from "lucide-react";
import dynamic from "next/dynamic";

const ComplexesMap = dynamic(
  () => import("@/components/map/complexes-map").then((m) => m.ComplexesMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
    ),
  }
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
  courts: { indoor: boolean }[];
}

interface ExploreClientProps {
  complexes: Complex[];
  cities: string[];
}

export function ExploreClient({ complexes, cities }: ExploreClientProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [filterIndoor, setFilterIndoor] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const activeFilterCount = [selectedCity, filterIndoor !== null].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complexes.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q))
        return false;
      if (selectedCity && c.city !== selectedCity) return false;
      if (filterIndoor !== null) {
        const hasMatchingCourt = c.courts.some((ct) => ct.indoor === filterIndoor);
        if (!hasMatchingCourt) return false;
      }
      return true;
    });
  }, [complexes, search, selectedCity, filterIndoor]);

  const mappable = filtered.filter(
    (c) => c.lat != null && c.lng != null
  ) as (Complex & { lat: number; lng: number })[];

  function clearFilters() {
    setSelectedCity("");
    setFilterIndoor(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Explorar</h1>
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              showFilters || activeFilterCount > 0
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "map"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar complejo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          {/* City filter */}
          {cities.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Ciudad
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    !selectedCity
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todas
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCity === city
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indoor/outdoor filter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tipo de cancha
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterIndoor(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterIndoor === null
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterIndoor(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterIndoor === true
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🏠 Cubiertas
              </button>
              <button
                onClick={() => setFilterIndoor(false)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterIndoor === false
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ☀️ Descubiertas
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCity && (
            <button
              onClick={() => setSelectedCity("")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
            >
              📍 {selectedCity}
              <X className="h-3 w-3" />
            </button>
          )}
          {filterIndoor !== null && (
            <button
              onClick={() => setFilterIndoor(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
            >
              {filterIndoor ? "🏠 Cubierta" : "☀️ Descubierta"}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400">
        {filtered.length} complejo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Map view */}
      {view === "map" && (
        <div className="space-y-4">
          {mappable.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
              {filtered.length === 0
                ? "Sin resultados con los filtros aplicados"
                : "No hay complejos con ubicación cargada"}
            </div>
          ) : (
            <ComplexesMap
              complexes={mappable}
              selectedId={selectedId}
              onSelect={setSelectedId}
              className="h-72 w-full"
            />
          )}
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
              <p className="font-medium">Sin resultados</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-emerald-600 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
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
  const indoorCount = complex.courts.filter((c) => c.indoor).length;
  const outdoorCount = complex.courts.filter((c) => !c.indoor).length;

  return (
    <Link href={`/explore/${complex.id}`} onClick={onClick}>
      <Card
        className={`hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] ${
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
              {/* Court type badges */}
              {complex.courts.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {indoorCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      🏠 {indoorCount} cubierta{indoorCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {outdoorCount > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      ☀️ {outdoorCount} descubierta{outdoorCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="text-2xl shrink-0">🏟️</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

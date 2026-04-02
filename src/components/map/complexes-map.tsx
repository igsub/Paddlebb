"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

interface ComplexMarker {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  avg_rating?: number | null;
}

interface ComplexesMapProps {
  complexes: ComplexMarker[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ComplexesMap({
  complexes,
  selectedId,
  onSelect,
  className = "h-64 w-full",
}: ComplexesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon paths (needed for Next.js)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Center on Bahía Blanca by default, or first complex
      const center: [number, number] =
        complexes.length > 0
          ? [complexes[0].lat, complexes[0].lng]
          : [-38.7183, -62.2663];

      const map = L.map(containerRef.current, {
        center,
        zoom: complexes.length > 1 ? 12 : 15,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const emeraldIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#059669;border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      complexes.forEach((c) => {
        const marker = L.marker([c.lat, c.lng], { icon: emeraldIcon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:140px">
              <p style="font-weight:600;margin:0 0 4px">${c.name}</p>
              <p style="font-size:12px;color:#6b7280;margin:0">${c.address}</p>
              ${c.avg_rating ? `<p style="font-size:12px;margin:4px 0 0">⭐ ${c.avg_rating}</p>` : ""}
              <a href="/explore/${c.id}" style="display:block;margin-top:8px;font-size:12px;color:#059669;font-weight:600;">
                Ver canchas →
              </a>
            </div>`,
            { maxWidth: 200 }
          );

        marker.on("click", () => {
          onSelect?.(c.id);
        });

        if (c.id === selectedId) {
          marker.openPopup();
        }
      });

      // Fit bounds if multiple complexes
      if (complexes.length > 1) {
        const bounds = L.latLngBounds(complexes.map((c) => [c.lat, c.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add leaflet CSS
  useEffect(() => {
    const link = document.getElementById("leaflet-css");
    if (!link) {
      const el = document.createElement("link");
      el.id = "leaflet-css";
      el.rel = "stylesheet";
      el.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(el);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${className} rounded-xl overflow-hidden z-0`}
    />
  );
}

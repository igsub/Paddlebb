"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export function SingleMap({
  lat,
  lng,
  name,
  address,
}: {
  lat: number;
  lng: number;
  name: string;
  address: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          `<strong>${name}</strong><br/><span style="font-size:12px">${address}</span>`,
          { closeButton: false }
        )
        .openPopup();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name, address]);

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div
        ref={containerRef}
        className="h-40 w-full rounded-xl overflow-hidden z-0 pointer-events-none"
      />
      <p className="text-xs text-center text-emerald-600 mt-1 hover:underline">
        Ver en Google Maps →
      </p>
    </a>
  );
}

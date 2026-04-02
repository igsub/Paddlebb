import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paddlebb – Reserva de canchas de paddle",
    short_name: "Paddlebb",
    description: "Encontrá y reservá canchas de paddle en tu ciudad",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["sports", "lifestyle"],
  };
}

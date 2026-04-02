import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Padelbb – Reservá canchas de pádel en Bahía Blanca",
    short_name: "Padelbb",
    description: "Reservá canchas de pádel en Bahía Blanca en segundos. Disponibilidad en tiempo real.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["sports", "lifestyle"],
  };
}

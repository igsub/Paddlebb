import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Padelbb – Reserva de canchas de padel",
    short_name: "Padelbb",
    description: "Encontrá y reservá canchas de padel en tu ciudad",
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

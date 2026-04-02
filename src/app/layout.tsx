import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

const siteUrl = "https://paddlebb.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Padelbb – Reservá canchas de pádel en Bahía Blanca",
    template: "%s | Padelbb",
  },
  description:
    "La plataforma de reservas de canchas de pádel en Bahía Blanca. Disponibilidad en tiempo real, reservá en segundos y encontrá compañeros de juego.",
  keywords: [
    "padel Bahía Blanca",
    "pádel Bahía Blanca",
    "canchas de padel Bahía Blanca",
    "reserva canchas padel",
    "padelbb",
    "club padel BB",
    "turnos padel Bahía Blanca",
    "alquiler cancha padel",
  ],
  authors: [{ name: "Padelbb" }],
  creator: "Padelbb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Padelbb",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Padelbb",
    title: "Padelbb – Reservá canchas de pádel en Bahía Blanca",
    description:
      "Encontrá canchas de pádel disponibles en Bahía Blanca. Reservá en segundos, encontrá compañeros y seguí tu actividad.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Padelbb – Reserva de canchas de pádel en Bahía Blanca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Padelbb – Reservá canchas de pádel en Bahía Blanca",
    description:
      "Encontrá canchas de pádel disponibles en Bahía Blanca. Reservá en segundos, encontrá compañeros y seguí tu actividad.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Padelbb",
  url: siteUrl,
  description:
    "Plataforma de reservas de canchas de pádel en Bahía Blanca, Argentina.",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web, iOS, Android",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
  areaServed: {
    "@type": "City",
    name: "Bahía Blanca",
    "@id": "https://www.wikidata.org/wiki/Q186276",
  },
  inLanguage: "es-AR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 antialiased font-sans">
        {children}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

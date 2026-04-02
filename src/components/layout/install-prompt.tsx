"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    if (standalone) return;

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    if (sessionStorage.getItem("install-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }

  function handleDismiss() {
    sessionStorage.setItem("install-dismissed", "1");
    setDismissed(true);
  }

  if (isStandalone || dismissed) return null;

  // iOS: Safari doesn't support beforeinstallprompt — show manual instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
        <div className="bg-white border border-emerald-200 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Instalá Padelbb</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Tocá <span className="font-medium">⎋ Compartir</span> y luego{" "}
              <span className="font-medium">"Agregar a pantalla de inicio" ➕</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-gray-400 hover:text-gray-600 mt-0.5"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome: native install prompt available
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white border border-emerald-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Instalá Padelbb</p>
          <p className="text-xs text-gray-500">Accedé desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

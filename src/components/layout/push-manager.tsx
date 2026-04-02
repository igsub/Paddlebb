"use client";

import { useEffect } from "react";
import { subscribePush } from "@/app/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function setup() {
      try {
        // Register SW (no-op if already registered)
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Wait until SW is fully active before accessing pushManager
        const reg = await navigator.serviceWorker.ready;

        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          // Re-sync to DB on every mount (handles new logins / VAPID key rotations)
          await subscribePush(JSON.parse(JSON.stringify(existing)));
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });

        await subscribePush(JSON.parse(JSON.stringify(sub)));
      } catch (e) {
        console.error("[push] setup failed:", e);
      }
    }

    setup();
  }, []);

  return null;
}

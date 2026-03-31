import webpush from "web-push";
import { PushSubscriptionJSON } from "@/types";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error("VAPID env vars not set. See SETUP.md.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  payload: PushPayload
) {
  ensureInitialized();
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ icon: "/icons/icon-192.png", ...payload })
    );
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    throw err;
  }
}

import webpush from "web-push";
import { PushSubscriptionJSON } from "@/types";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ icon: "/icons/icon-192.png", ...payload })
    );
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired — caller should remove it
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    throw err;
  }
}

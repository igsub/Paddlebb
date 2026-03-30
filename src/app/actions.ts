"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPushNotification, PushPayload } from "@/lib/push";
import { PushSubscriptionJSON } from "@/types";

export async function subscribePush(sub: PushSubscriptionJSON) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from("profiles")
    .update({ push_subscription: sub })
    .eq("id", user.id);

  return { success: true };
}

export async function unsubscribePush() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from("profiles")
    .update({ push_subscription: null })
    .eq("id", user.id);

  return { success: true };
}

export async function notifyUser(userId: string, payload: PushPayload) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("push_subscription")
    .eq("id", userId)
    .single();

  if (!profile?.push_subscription) return;

  try {
    await sendPushNotification(profile.push_subscription as PushSubscriptionJSON, payload);
  } catch (err: unknown) {
    if ((err as Error).message === "SUBSCRIPTION_EXPIRED") {
      await supabase
        .from("profiles")
        .update({ push_subscription: null })
        .eq("id", userId);
    }
  }
}

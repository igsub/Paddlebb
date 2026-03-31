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

export async function submitRating(
  bookingId: string,
  complexId: string,
  score: number,
  comment: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  if (score < 1 || score > 5) return { error: "Puntaje inválido" };

  // Verify ownership of the booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, player_id")
    .eq("id", bookingId)
    .eq("player_id", user.id)
    .single();

  if (!booking) return { error: "Reserva no encontrada" };

  const { error } = await supabase.from("ratings").insert({
    booking_id: bookingId,
    player_id: user.id,
    complex_id: complexId,
    score,
    comment: comment.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya calificaste esta reserva" };
    return { error: "Error al guardar la calificación" };
  }

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

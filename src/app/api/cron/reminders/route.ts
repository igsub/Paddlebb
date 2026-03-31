import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/push";
import { PushSubscriptionJSON } from "@/types";
import { formatTime } from "@/lib/utils";

// This route is called by a cron job (e.g. Vercel Cron or external scheduler)
// It sends push notifications to players with bookings in the next ~24-26 hours
// Configure a cron to call this endpoint daily (e.g. at 10:00 AM)
// Add CRON_SECRET to env to secure this endpoint

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: NextRequest) {
  // Verify the request is from our cron job
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find bookings 24 hours from now (window: 23-25h from now)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const windowStartDate = windowStart.toISOString().split("T")[0];
  const windowStartTime = windowStart.toTimeString().slice(0, 5);
  const windowEndDate = windowEnd.toISOString().split("T")[0];
  const windowEndTime = windowEnd.toTimeString().slice(0, 5);

  // Get confirmed bookings in the window
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      player:profiles!bookings_player_id_fkey(full_name, push_subscription),
      slot:slots!bookings_slot_id_fkey(
        date, start_time, end_time,
        court:courts!slots_court_id_fkey(
          name,
          complex:complexes!courts_complex_id_fkey(name)
        )
      )
    `)
    .eq("status", "confirmed")
    .gte("slot.date", windowStartDate)
    .lte("slot.date", windowEndDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const booking of bookings ?? []) {
    const player = booking.player as unknown as {
      full_name: string;
      push_subscription?: PushSubscriptionJSON | null;
    } | null;
    const slot = booking.slot as unknown as {
      date: string;
      start_time: string;
      end_time: string;
      court: { name: string; complex: { name: string } };
    } | null;

    if (!player?.push_subscription || !slot) {
      skipped++;
      continue;
    }

    // Only notify if slot is actually within our window
    const slotTime = slot.start_time.slice(0, 5);
    if (slot.date === windowStartDate && slotTime < windowStartTime) {
      skipped++;
      continue;
    }
    if (slot.date === windowEndDate && slotTime > windowEndTime) {
      skipped++;
      continue;
    }

    try {
      await sendPushNotification(player.push_subscription, {
        title: "Recordatorio: turno mañana 🎾",
        body: `${slot.court?.complex?.name} · ${slot.court?.name} · ${formatTime(slot.start_time)}`,
        url: "/bookings",
      });
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: (bookings ?? []).length,
  });
}

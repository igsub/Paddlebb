export type UserRole = "player" | "complex_owner";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  push_subscription?: PushSubscriptionJSON | null;
  created_at: string;
}

export interface Complex {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  created_at: string;
}

export type CourtSurface = "cemento" | "cesped_sintetico" | "madera" | "cristal";

export interface Court {
  id: string;
  complex_id: string;
  name: string;
  surface: CourtSurface;
  indoor: boolean;
  active: boolean;
}

export type SlotStatus = "available" | "booked" | "blocked";

export interface Slot {
  id: string;
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: SlotStatus;
  court?: Court;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  slot_id: string;
  player_id: string;
  status: BookingStatus;
  created_at: string;
  slot?: Slot & { court?: Court & { complex?: Complex } };
  player?: Profile;
}

export interface WaitlistEntry {
  id: string;
  slot_id: string;
  player_id: string;
  created_at: string;
  slot?: Slot;
  player?: Profile;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

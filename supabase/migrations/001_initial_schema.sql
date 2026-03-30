-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('player', 'complex_owner')),
  phone text,
  avatar_url text,
  push_subscription jsonb,
  created_at timestamptz default now()
);

-- Complexes table
create table public.complexes (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  city text not null default 'Buenos Aires',
  phone text,
  description text,
  logo_url text,
  created_at timestamptz default now()
);

-- Courts table
create table public.courts (
  id uuid default uuid_generate_v4() primary key,
  complex_id uuid references public.complexes(id) on delete cascade not null,
  name text not null,
  surface text not null check (surface in ('cemento', 'cesped_sintetico', 'madera', 'cristal')),
  indoor boolean not null default false,
  active boolean not null default true
);

-- Slots table (availability)
create table public.slots (
  id uuid default uuid_generate_v4() primary key,
  court_id uuid references public.courts(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  price numeric(10,2) not null default 0,
  status text not null default 'available' check (status in ('available', 'booked', 'blocked')),
  constraint slots_time_check check (end_time > start_time)
);

create index slots_court_date_idx on public.slots(court_id, date);
create index slots_status_idx on public.slots(status);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.slots(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz default now(),
  unique(slot_id, status) -- only one active booking per slot
);

create index bookings_player_idx on public.bookings(player_id);
create index bookings_slot_idx on public.bookings(slot_id);

-- Waitlist table
create table public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references public.slots(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(slot_id, player_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.complexes enable row level security;
alter table public.courts enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.waitlist enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Complexes policies
create policy "Complexes are viewable by everyone"
  on public.complexes for select using (true);

create policy "Owners can insert their own complexes"
  on public.complexes for insert with check (auth.uid() = owner_id);

create policy "Owners can update their own complexes"
  on public.complexes for update using (auth.uid() = owner_id);

create policy "Owners can delete their own complexes"
  on public.complexes for delete using (auth.uid() = owner_id);

-- Courts policies
create policy "Courts are viewable by everyone"
  on public.courts for select using (true);

create policy "Owners can manage their courts"
  on public.courts for all using (
    exists (
      select 1 from public.complexes
      where complexes.id = courts.complex_id and complexes.owner_id = auth.uid()
    )
  );

-- Slots policies
create policy "Slots are viewable by everyone"
  on public.slots for select using (true);

create policy "Owners can manage their slots"
  on public.slots for all using (
    exists (
      select 1 from public.courts
      join public.complexes on complexes.id = courts.complex_id
      where courts.id = slots.court_id and complexes.owner_id = auth.uid()
    )
  );

-- Bookings policies
create policy "Players can view their own bookings"
  on public.bookings for select using (
    auth.uid() = player_id or
    exists (
      select 1 from public.slots
      join public.courts on courts.id = slots.court_id
      join public.complexes on complexes.id = courts.complex_id
      where slots.id = bookings.slot_id and complexes.owner_id = auth.uid()
    )
  );

create policy "Players can create bookings"
  on public.bookings for insert with check (auth.uid() = player_id);

create policy "Players can cancel their own bookings"
  on public.bookings for update using (auth.uid() = player_id);

-- Waitlist policies
create policy "Users can view their own waitlist"
  on public.waitlist for select using (auth.uid() = player_id);

create policy "Users can join waitlist"
  on public.waitlist for insert with check (auth.uid() = player_id);

create policy "Users can leave waitlist"
  on public.waitlist for delete using (auth.uid() = player_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update slot status when booking changes
create or replace function public.handle_booking_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.slots set status = 'booked' where id = NEW.slot_id;
  elsif TG_OP = 'UPDATE' and NEW.status = 'cancelled' then
    update public.slots set status = 'available' where id = NEW.slot_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_booking_change
  after insert or update on public.bookings
  for each row execute procedure public.handle_booking_change();

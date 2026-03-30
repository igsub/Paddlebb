-- Add location coordinates to complexes
alter table public.complexes
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- Add whatsapp contact
alter table public.complexes
  add column if not exists whatsapp text;

-- Add cancellation policy (hours before slot when cancel is allowed)
alter table public.complexes
  add column if not exists cancellation_hours integer not null default 2;

-- Add notes/instructions per slot
alter table public.slots
  add column if not exists notes text;

-- Ratings: players can rate a court after playing
create table if not exists public.ratings (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  player_id uuid references public.profiles(id) on delete cascade not null,
  complex_id uuid references public.complexes(id) on delete cascade not null,
  score smallint not null check (score between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.ratings enable row level security;

create policy "Players can create ratings for their own bookings"
  on public.ratings for insert with check (auth.uid() = player_id);

create policy "Ratings are publicly readable"
  on public.ratings for select using (true);

-- Add avg_rating column to complexes (materialized for perf)
alter table public.complexes
  add column if not exists avg_rating numeric(3,2) default null;

-- Function: recalculate avg rating for a complex
create or replace function public.update_complex_rating()
returns trigger as $$
begin
  update public.complexes
  set avg_rating = (
    select round(avg(score)::numeric, 2)
    from public.ratings
    where complex_id = NEW.complex_id
  )
  where id = NEW.complex_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_rating_change
  after insert or update on public.ratings
  for each row execute procedure public.update_complex_rating();

-- Add phone index for profiles (useful for whatsapp contact lookup)
create index if not exists profiles_phone_idx on public.profiles(phone);

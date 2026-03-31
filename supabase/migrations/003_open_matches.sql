-- Open matches: a booking where the booker is looking for partners
create table if not exists public.open_matches (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  -- How many more players needed (1 = need one partner, 2 = need two for doubles, 3 = need three)
  spots_needed smallint not null default 1 check (spots_needed between 1 and 3),
  spots_filled smallint not null default 0,
  level text check (level in ('principiante', 'intermedio', 'avanzado', 'competitivo')),
  match_type text not null default 'amistoso' check (match_type in ('amistoso', 'competitivo')),
  notes text,
  is_open boolean not null default true, -- false once full or cancelled
  created_at timestamptz default now()
);

-- Participants who joined an open match
create table if not exists public.match_participants (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.open_matches(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(match_id, player_id)
);

alter table public.open_matches enable row level security;
alter table public.match_participants enable row level security;

-- Open matches are visible to everyone
create policy "Open matches are viewable by everyone"
  on public.open_matches for select using (true);

create policy "Creators can manage their open matches"
  on public.open_matches for all using (auth.uid() = creator_id);

-- Participants
create policy "Match participants visible to match creator and participants"
  on public.match_participants for select using (
    auth.uid() = player_id or
    exists (
      select 1 from public.open_matches
      where open_matches.id = match_participants.match_id
      and open_matches.creator_id = auth.uid()
    )
  );

create policy "Players can request to join matches"
  on public.match_participants for insert with check (auth.uid() = player_id);

create policy "Players can withdraw their participation"
  on public.match_participants for delete using (auth.uid() = player_id);

create policy "Match creator can update participant status"
  on public.match_participants for update using (
    exists (
      select 1 from public.open_matches
      where open_matches.id = match_participants.match_id
      and open_matches.creator_id = auth.uid()
    )
  );

-- Function: update spots_filled when participant status changes
create or replace function public.update_match_spots()
returns trigger as $$
begin
  update public.open_matches
  set
    spots_filled = (
      select count(*) from public.match_participants
      where match_id = coalesce(NEW.match_id, OLD.match_id)
      and status = 'accepted'
    ),
    is_open = (
      select spots_filled < spots_needed
      from public.open_matches
      where id = coalesce(NEW.match_id, OLD.match_id)
    )
  where id = coalesce(NEW.match_id, OLD.match_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_participant_change
  after insert or update or delete on public.match_participants
  for each row execute procedure public.update_match_spots();

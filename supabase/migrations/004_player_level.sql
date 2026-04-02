-- Add level field to player profiles
alter table public.profiles
  add column if not exists level text check (level in ('principiante', 'intermedio', 'avanzado', 'competitivo'));

-- Update trigger to also store phone and level from user metadata on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone, level)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'player'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'level'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Allow players to update their own profile
create policy "Players can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

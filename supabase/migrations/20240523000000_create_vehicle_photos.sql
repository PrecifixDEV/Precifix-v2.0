-- Create vehicle_photos table
create table if not exists public.vehicle_photos (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  url text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.vehicle_photos enable row level security;

-- Policies for vehicle_photos
create policy "Users can view photos of their vehicles"
  on public.vehicle_photos for select
  using ( exists ( select 1 from public.vehicles v where v.id = vehicle_photos.vehicle_id and v.user_id = auth.uid() ) );

create policy "Users can insert photos for their vehicles"
  on public.vehicle_photos for insert
  with check ( exists ( select 1 from public.vehicles v where v.id = vehicle_photos.vehicle_id and v.user_id = auth.uid() ) );

create policy "Users can delete photos of their vehicles"
  on public.vehicle_photos for delete
  using ( exists ( select 1 from public.vehicles v where v.id = vehicle_photos.vehicle_id and v.user_id = auth.uid() ) );

-- Create storage bucket for vehicle images
insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

-- Storage policies (adjusting for common Supabase storage policy patterns)
-- Ensure RLS is enabled on objects if not already (Commented out due to permissions)
-- alter table storage.objects enable row level security;

create policy "Vehicle Images Public Access"
on storage.objects for select
to public
using ( bucket_id = 'vehicle-images' );

create policy "Users can upload vehicle images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Users can delete their vehicle images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'vehicle-images' and (storage.foldername(name))[1] = auth.uid()::text );

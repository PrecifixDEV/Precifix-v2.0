-- Precifix v2.0 - Schema Proposal
-- Based on requirements + analysis of Precifix v1.0 backup

-- 1. Profiles (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  shop_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Clients (Clientes)
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  document text, -- CPF/CNPJ
  zip_code text,
  address text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Vehicles (Veículos)
-- IMPROVEMENT: Normalized from v1.0 (where it was a text column on clients)
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  license_plate text, -- Placa
  brand text,         -- Marca
  model text,         -- Modelo
  year text,
  color text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Services Catalog (Catálogo de Serviços)
create table public.services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  base_price numeric(10,2) not null default 0,
  category text, -- Estética, Martelinho, Pintura, etc.
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Expenses (Despesas) - formerly operational_costs
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text, -- Agua, Luz, Aluguel, Prolabore, etc.
  amount numeric(10,2) not null,
  date date not null default current_date,
  is_paid boolean default false,
  paid_date date,
  recurrence text, -- monthly, weekly, none
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Service Orders / Quotes (Orçamentos e Vendas) - formerly quotes
create table public.service_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  
  -- Status flow: draft -> approved -> in_progress -> completed -> paid
  status text not null default 'draft', 
  
  sale_number text, -- The #0001 user-friendly ID
  
  total_amount numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  final_amount numeric(10,2) default 0,
  
  date_in date default current_date,
  date_out date,
  
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Service Order Items (Itens do Orçamento)
create table public.service_order_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Denormalized for RLS
  service_order_id uuid references public.service_orders(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null, 
  
  title text not null, -- Snapshot name
  unit_price numeric(10,2) not null, -- Snapshot price
  quantity numeric(10,2) default 1,
  
  created_at timestamptz default now()
);

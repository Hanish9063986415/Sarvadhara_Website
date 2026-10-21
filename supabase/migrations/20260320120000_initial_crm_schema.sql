-- Sarvadhara Automate CRM — initial Supabase schema
-- Apply: Supabase Dashboard → SQL, or `supabase db push` with Supabase CLI linked to your project.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.crm_project_status as enum ('active', 'completed', 'on_hold');

create type public.crm_delivery_phase as enum (
  'discovery',
  'design',
  'development',
  'qa',
  'launch',
  'support'
);

create type public.crm_finance_kind as enum ('salary', 'cost');

-- ---------------------------------------------------------------------------
-- Projects (core CRM)
-- ---------------------------------------------------------------------------

create table public.crm_projects (
  id uuid primary key,
  project_name text not null default '',
  client_name text not null default '',
  client_email text not null default '',
  client_phone text not null default '',
  client_address text not null default '',
  project_url text not null default '',
  total_contract_amount numeric(14, 2) not null default 0,
  first_transaction_amount numeric(14, 2) not null default 0,
  payments_cleared_amount numeric(14, 2) not null default 0,
  balance numeric(14, 2) not null default 0,
  all_payments_cleared boolean not null default false,
  status public.crm_project_status not null default 'active',
  notes text not null default '',
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  delivery_phase public.crm_delivery_phase not null default 'discovery',
  maintenance_enabled boolean not null default false,
  maintenance_monthly_amount numeric(14, 2) not null default 0,
  maintenance_billing_day smallint not null default 1 check (maintenance_billing_day between 1 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_projects_name_idx on public.crm_projects (project_name);
create index crm_projects_maintenance_idx on public.crm_projects (maintenance_enabled)
  where maintenance_enabled = true;

-- ---------------------------------------------------------------------------
-- Project children (normalized from JSON arrays)
-- ---------------------------------------------------------------------------

create table public.crm_project_tasks (
  id uuid primary key,
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  meter smallint not null default 0 check (meter between 0 and 100),
  sort_order integer not null default 0
);

create index crm_project_tasks_project_idx on public.crm_project_tasks (project_id);

create table public.crm_project_payment_transactions (
  id uuid primary key,
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  label text not null default '',
  amount numeric(14, 2) not null default 0 check (amount >= 0),
  paid_on date,
  note text not null default '',
  sort_order integer not null default 0
);

create index crm_project_transactions_project_idx on public.crm_project_payment_transactions (project_id);

create table public.crm_project_documents (
  id uuid primary key,
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  label text not null default '',
  file_name text not null default '',
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  storage_path text not null default '',
  uploaded_at timestamptz not null default now()
);

create index crm_project_documents_project_idx on public.crm_project_documents (project_id);

-- ---------------------------------------------------------------------------
-- Maintenance billing
-- ---------------------------------------------------------------------------

create table public.crm_maintenance_payment_records (
  id uuid primary key,
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  period_key text not null check (period_key ~ '^\d{4}-\d{2}$'),
  paid_amount numeric(14, 2) not null default 0 check (paid_amount >= 0),
  paid_on date,
  note text not null default '',
  updated_at timestamptz not null default now(),
  constraint crm_maintenance_payment_records_project_period unique (project_id, period_key)
);

create index crm_maintenance_records_period_idx on public.crm_maintenance_payment_records (period_key);

create table public.crm_maintenance_settings (
  id text primary key default 'default',
  clearance_day smallint not null default 21 check (clearance_day between 1 and 28),
  updated_at timestamptz not null default now()
);

insert into public.crm_maintenance_settings (id, clearance_day)
values ('default', 21)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Finance & recurring expenses
-- ---------------------------------------------------------------------------

create table public.crm_finance_entries (
  id uuid primary key,
  kind public.crm_finance_kind not null,
  label text not null default '',
  amount numeric(14, 2) not null default 0,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index crm_finance_entries_month_idx on public.crm_finance_entries (month);

create table public.crm_monthly_expenses (
  id uuid primary key,
  title text not null default '',
  amount numeric(14, 2) not null default 0 check (amount >= 0),
  due_day smallint not null default 1 check (due_day between 1 and 28),
  remind_days_before smallint not null default 3 check (remind_days_before between 2 and 7),
  category text not null default '',
  note text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_monthly_expenses_active_idx on public.crm_monthly_expenses (active)
  where active = true;

-- ---------------------------------------------------------------------------
-- Public maintenance invoice share links (WhatsApp)
-- ---------------------------------------------------------------------------

create table public.crm_maintenance_invoice_shares (
  id uuid primary key,
  project_id uuid references public.crm_projects (id) on delete set null,
  period_key text not null check (period_key ~ '^\d{4}-\d{2}$'),
  invoice_number text not null default '',
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index crm_invoice_shares_created_idx on public.crm_maintenance_invoice_shares (created_at desc);
create index crm_invoice_shares_project_idx on public.crm_maintenance_invoice_shares (project_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger (projects + monthly expenses + maintenance settings)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger crm_projects_updated_at
  before update on public.crm_projects
  for each row execute function public.set_updated_at();

create trigger crm_monthly_expenses_updated_at
  before update on public.crm_monthly_expenses
  for each row execute function public.set_updated_at();

create trigger crm_maintenance_settings_updated_at
  before update on public.crm_maintenance_settings
  for each row execute function public.set_updated_at();

create trigger crm_maintenance_payment_records_updated_at
  before update on public.crm_maintenance_payment_records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — deny direct client access; Next.js API uses service role
-- ---------------------------------------------------------------------------

alter table public.crm_projects enable row level security;
alter table public.crm_project_tasks enable row level security;
alter table public.crm_project_payment_transactions enable row level security;
alter table public.crm_project_documents enable row level security;
alter table public.crm_maintenance_payment_records enable row level security;
alter table public.crm_maintenance_settings enable row level security;
alter table public.crm_finance_entries enable row level security;
alter table public.crm_monthly_expenses enable row level security;
alter table public.crm_maintenance_invoice_shares enable row level security;

-- Optional: later add Supabase Auth policies for authenticated automate users.
-- Service role key (server-only) bypasses RLS for API routes.

-- Table privileges for PostgREST / service_role (required for API inserts)
grant usage on schema public to postgres, service_role;

grant usage on type public.crm_project_status to service_role;
grant usage on type public.crm_delivery_phase to service_role;
grant usage on type public.crm_finance_kind to service_role;

grant all on table public.crm_projects to service_role;
grant all on table public.crm_project_tasks to service_role;
grant all on table public.crm_project_payment_transactions to service_role;
grant all on table public.crm_project_documents to service_role;
grant all on table public.crm_maintenance_payment_records to service_role;
grant all on table public.crm_maintenance_settings to service_role;
grant all on table public.crm_finance_entries to service_role;
grant all on table public.crm_monthly_expenses to service_role;
grant all on table public.crm_maintenance_invoice_shares to service_role;

grant execute on function public.set_updated_at() to service_role;

alter default privileges in schema public
  grant all on tables to service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket for project documents (private)
-- Run after migration if Storage is enabled on your project:
-- Dashboard → Storage → New bucket: crm-project-documents (private)
-- Or use SQL (requires appropriate privileges):
-- insert into storage.buckets (id, name, public) values ('crm-project-documents', 'crm-project-documents', false);

comment on table public.crm_projects is 'Automate CRM projects — migrated from data/crm-projects.json';
comment on table public.crm_maintenance_payment_records is 'Per-project monthly maintenance payments — data/crm-maintenance-records.json';
comment on table public.crm_maintenance_invoice_shares is 'Public invoice share payloads — data/crm-invoice-shares.json';

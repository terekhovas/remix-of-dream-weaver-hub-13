-- =============================================
-- PropManager Full Schema
-- Migration: 20260519000000_initial_schema
-- =============================================

-- COMPANIES
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- PROFILES (one per auth.users row)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id),
  full_name text,
  role text not null default 'pm' check (role in ('pm', 'admin')),
  created_at timestamptz default now()
);

-- PROPERTIES
create table properties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  address text not null,
  city text not null,
  postcode text,
  sqm numeric,
  floor integer,
  bedrooms integer,
  bathrooms integer,
  wc integer,
  year_built integer,
  year_renovated integer,
  electricity_meter text,
  water_meter text,
  drive_photos_url text,
  google_maps_url text,
  furnishing_notes text,
  status text not null default 'vacant' check (status in ('let', 'vacant')),
  assigned_pm_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- LANDLORDS
create table landlords (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  full_name text not null,
  email text,
  phone text,
  legal_rep_name text,
  legal_rep_phone text,
  created_at timestamptz default now()
);

-- MANAGEMENT AGREEMENTS
create table management_agreements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  contract_type text not null check (contract_type in ('guaranteed_rent', 'commission', 'management_fee')),
  start_date date not null,
  end_date date not null,
  monthly_rent_guaranteed numeric,
  commission_pct numeric,
  management_fee numeric,
  drive_contract_url text,
  alert_30d_sent_at timestamptz,
  created_at timestamptz default now()
);

-- TENANTS
create table tenants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  full_name text not null,
  email text,
  phone text,
  passport_drive_url text,
  created_at timestamptz default now()
);

-- TENANCIES
create table tenancies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  tenant_id uuid not null references tenants(id),
  start_date date not null,
  end_date date not null,
  monthly_rent numeric not null,
  rent_payment_day integer not null default 1,
  cpi_indexed boolean default false,
  bills_included text[],
  bills_excluded text[],
  status text not null default 'active' check (status in ('active', 'future', 'past')),
  created_at timestamptz default now()
);

-- RENT PAYMENTS
create table rent_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  tenancy_id uuid not null references tenancies(id),
  property_id uuid not null references properties(id),
  month date not null,
  amount numeric not null,
  paid boolean default false,
  paid_at timestamptz,
  bank_statement_date date,
  proof_of_payment_url text,
  rf_reference text,
  created_at timestamptz default now(),
  unique (tenancy_id, month)
);

-- ARREARS LOG (idempotency guard for automation)
create table arrears_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  rent_payment_id uuid not null references rent_payments(id),
  stage text not null check (stage in ('d1', 'd7', 'd30')),
  sent_at timestamptz not null default now(),
  created_at timestamptz default now(),
  unique (rent_payment_id, stage)
);

-- CERTIFICATES
create table certificates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  type text not null,
  label text not null,
  valid_until date,
  rating text,
  document_url text,
  created_at timestamptz default now()
);

-- UTILITIES
create table utilities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  type text not null check (type in ('electricity', 'water', 'internet')),
  provider text,
  account_number text,
  meter_number text,
  transfer_status text default 'not-transferred' check (transfer_status in ('transferred', 'not-transferred')),
  transfer_date date,
  building_manager_name text,
  building_manager_phone text,
  building_charges_amount numeric,
  created_at timestamptz default now()
);

-- UTILITY PAYMENTS
create table utility_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  utility_id uuid not null references utilities(id),
  property_id uuid not null references properties(id),
  month date not null,
  amount numeric not null,
  paid boolean default false,
  drive_url text,
  created_at timestamptz default now()
);

-- COMMUNICATION LOGS
create table communication_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  date date not null,
  type text not null check (type in ('whatsapp', 'phone', 'email', 'in-person', 'maintenance')),
  summary text not null,
  description text,
  agreed_steps text,
  author_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- DOCUMENTS
create table documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  tenancy_id uuid references tenancies(id),
  type text not null check (type in ('tenancy_agreement', 'ydh_certificate', 'pea_certificate', 'check_in_report', 'check_out_report', 'other')),
  name text not null,
  drive_url text,
  storage_path text,
  created_at timestamptz default now()
);

-- PAYOUTS
create table payouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  management_agreement_id uuid references management_agreements(id),
  period_start date not null,
  period_end date not null,
  gross_rent numeric not null,
  deductions numeric default 0,
  net_amount numeric not null,
  sent boolean default false,
  sent_at timestamptz,
  bank_reference text,
  created_at timestamptz default now()
);

-- AGENTS (M6)
create table agents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  full_name text not null,
  company_name text,
  phone text,
  email text,
  area_specialty text,
  commission_pct numeric,
  created_at timestamptz default now()
);

-- LEADS (M6)
create table leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  property_id uuid not null references properties(id),
  agent_id uuid references agents(id),
  full_name text,
  phone text,
  email text,
  status text not null default 'new' check (status in ('new', 'viewing', 'offer', 'converted', 'lost')),
  comments text,
  created_at timestamptz default now()
);

-- PIPELINE PROPERTIES (M6)
create table pipeline_properties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  address text not null,
  expected_rollout_date date,
  status text not null default 'sourcing' check (status in ('sourcing', 'signed', 'listed', 'let')),
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
alter table companies enable row level security;
alter table profiles enable row level security;
alter table properties enable row level security;
alter table landlords enable row level security;
alter table management_agreements enable row level security;
alter table tenants enable row level security;
alter table tenancies enable row level security;
alter table rent_payments enable row level security;
alter table arrears_log enable row level security;
alter table certificates enable row level security;
alter table utilities enable row level security;
alter table utility_payments enable row level security;
alter table communication_logs enable row level security;
alter table documents enable row level security;
alter table payouts enable row level security;
alter table agents enable row level security;
alter table leads enable row level security;
alter table pipeline_properties enable row level security;

-- Helper: returns the company_id of the currently authenticated user
create or replace function auth_company_id()
returns uuid
language sql stable security definer
as $$
  select company_id from profiles where id = auth.uid()
$$;

-- PROFILES: each user sees only profiles in their company
create policy "profiles_company_isolation" on profiles
  for all using (company_id = auth_company_id());

-- PROPERTIES
create policy "properties_company_isolation" on properties
  for all using (company_id = auth_company_id());

-- LANDLORDS
create policy "landlords_company_isolation" on landlords
  for all using (company_id = auth_company_id());

-- MANAGEMENT AGREEMENTS
create policy "management_agreements_company_isolation" on management_agreements
  for all using (company_id = auth_company_id());

-- TENANTS
create policy "tenants_company_isolation" on tenants
  for all using (company_id = auth_company_id());

-- TENANCIES
create policy "tenancies_company_isolation" on tenancies
  for all using (company_id = auth_company_id());

-- RENT PAYMENTS
create policy "rent_payments_company_isolation" on rent_payments
  for all using (company_id = auth_company_id());

-- ARREARS LOG
create policy "arrears_log_company_isolation" on arrears_log
  for all using (company_id = auth_company_id());

-- CERTIFICATES
create policy "certificates_company_isolation" on certificates
  for all using (company_id = auth_company_id());

-- UTILITIES
create policy "utilities_company_isolation" on utilities
  for all using (company_id = auth_company_id());

-- UTILITY PAYMENTS
create policy "utility_payments_company_isolation" on utility_payments
  for all using (company_id = auth_company_id());

-- COMMUNICATION LOGS
create policy "communication_logs_company_isolation" on communication_logs
  for all using (company_id = auth_company_id());

-- DOCUMENTS
create policy "documents_company_isolation" on documents
  for all using (company_id = auth_company_id());

-- PAYOUTS
create policy "payouts_company_isolation" on payouts
  for all using (company_id = auth_company_id());

-- AGENTS
create policy "agents_company_isolation" on agents
  for all using (company_id = auth_company_id());

-- LEADS
create policy "leads_company_isolation" on leads
  for all using (company_id = auth_company_id());

-- PIPELINE PROPERTIES
create policy "pipeline_properties_company_isolation" on pipeline_properties
  for all using (company_id = auth_company_id());

-- =============================================
-- SEED DATA (1 company, 2 PM accounts for testing)
-- Run separately after creating users in Supabase Auth dashboard
-- Replace UUIDs with actual auth.users IDs after creating accounts
-- =============================================

-- Uncomment and fill in after creating users in Supabase Auth:
-- insert into companies (id, name) values ('YOUR-COMPANY-UUID', 'Renty');
-- insert into profiles (id, company_id, full_name, role) values
--   ('AUTH-USER-1-UUID', 'YOUR-COMPANY-UUID', 'Sofia Terekhova', 'admin'),
--   ('AUTH-USER-2-UUID', 'YOUR-COMPANY-UUID', 'PM Two', 'pm');

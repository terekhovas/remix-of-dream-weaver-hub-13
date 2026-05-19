# PropManager M0 + M1 — Pipeline Setup & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the full CI/CD pipeline (GitHub Actions + Vitest coverage + Vercel) and implement Supabase Auth with protected routes, so the app requires login and all subsequent milestone code lands with CI running from day one.

**Architecture:** A GitHub Actions workflow runs typecheck → lint → test → build on every push; Vercel auto-deploys previews per branch. Supabase provides auth via `@supabase/supabase-js`; an `AuthContext` wraps the app and a `ProtectedRoute` component guards the main dashboard. The full Supabase schema is migrated in M0 so TypeScript types are accurate from M1 onward.

**Tech Stack:** Vite 5, React 18, TypeScript 5.8, Vitest 3, React Testing Library 16, @supabase/supabase-js 2, GitHub Actions, Vercel

---

## File Map

### Created in M0

| File | Responsibility |
|------|---------------|
| `.github/workflows/ci.yml` | CI pipeline: typecheck → lint → test → build |
| `.env.local.example` | Documents required env vars for contributors |
| `supabase/migrations/20260519000000_initial_schema.sql` | Full DB schema: all tables + RLS policies |
| `src/types/supabase.ts` | TypeScript types matching the DB schema |

### Modified in M0

| File | Change |
|------|--------|
| `vite.config.ts` | Add Vitest coverage config (v8 provider) |

### Created in M1

| File | Responsibility |
|------|---------------|
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/contexts/AuthContext.tsx` | Auth state (session, user, loading) via React context |
| `src/hooks/useAuth.ts` | Convenience hook that reads from AuthContext |
| `src/components/auth/ProtectedRoute.tsx` | Redirects unauthenticated users to `/login` |
| `src/pages/Login.tsx` | Email + password login form |
| `src/hooks/useAuth.test.ts` | Unit tests for useAuth hook |
| `src/__tests__/auth/Login.test.tsx` | Integration test: Login form submit → Supabase called |
| `src/__tests__/auth/ProtectedRoute.test.tsx` | Integration test: unauthenticated → redirect, authenticated → children |

### Modified in M1

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/login` route, wrap routes in `AuthProvider`, protect `/` with `ProtectedRoute` |
| `package.json` | Add `@supabase/supabase-js` dependency |

---

## Phase 1: M0 — Pipeline Setup

---

### Task 1: GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow directory and file**

```bash
mkdir -p ~/propmanager/.github/workflows
```

- [ ] **Step 2: Write the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run test -- --coverage

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [typecheck, lint, test]
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

- [ ] **Step 3: Verify the file is syntactically valid YAML**

```bash
cd ~/propmanager && python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 4: Commit**

```bash
cd ~/propmanager
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow (typecheck, lint, test, build)"
```

---

### Task 2: Vitest Coverage Configuration

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read the current vite.config.ts**

```bash
cat ~/propmanager/vite.config.ts
```

- [ ] **Step 2: Add coverage configuration to the test block**

In `vite.config.ts`, the `test` block currently has `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`. Add a `coverage` key:

```typescript
test: {
  globals: true,
  environment: "jsdom",
  setupFiles: "./src/test/setup.ts",
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov"],
    exclude: [
      "node_modules/**",
      "src/test/**",
      "src/components/ui/**",
      "**/*.config.*",
      "src/vite-env.d.ts",
      "src/main.tsx",
    ],
  },
},
```

- [ ] **Step 3: Install the v8 coverage provider**

```bash
cd ~/propmanager && npm install --save-dev @vitest/coverage-v8
```

- [ ] **Step 4: Run tests with coverage to verify it works**

```bash
cd ~/propmanager && npm run test -- --coverage
```

Expected output: coverage table printed, `src/test/example.test.ts` passes, no errors.

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add vite.config.ts package.json package-lock.json
git commit -m "test: add Vitest v8 coverage configuration"
```

---

### Task 3: Environment Variable Documentation

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Create the example env file**

Create `.env.local.example`:

```bash
# Supabase project URL — found in Supabase dashboard > Project Settings > API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase anon (public) key — found in Supabase dashboard > Project Settings > API
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 2: Verify .env.local is already gitignored**

```bash
cd ~/propmanager && grep -n "\.env" .gitignore
```

Expected: `.env.local` or `*.local` appears in output.

- [ ] **Step 3: Commit**

```bash
cd ~/propmanager
git add .env.local.example
git commit -m "docs: add .env.local.example with required Supabase variables"
```

---

### Task 4: Supabase Database Schema Migration

**Files:**
- Create: `supabase/migrations/20260519000000_initial_schema.sql`

- [ ] **Step 1: Create the supabase directory**

```bash
mkdir -p ~/propmanager/supabase/migrations
```

- [ ] **Step 2: Write the full schema migration**

Create `supabase/migrations/20260519000000_initial_schema.sql`:

```sql
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
```

- [ ] **Step 3: Commit**

```bash
cd ~/propmanager
git add supabase/migrations/20260519000000_initial_schema.sql
git commit -m "db: add full Supabase schema with RLS policies for all tables"
```

---

### Task 5: TypeScript Types for Supabase Schema

**Files:**
- Create: `src/types/supabase.ts`

These types mirror the schema exactly. They will be the single source of truth used by all hooks and components.

- [ ] **Step 1: Create the types directory and file**

```bash
mkdir -p ~/propmanager/src/types
```

- [ ] **Step 2: Write the Supabase TypeScript types**

Create `src/types/supabase.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          company_id: string
          full_name: string | null
          role: "pm" | "admin"
          created_at: string
        }
        Insert: {
          id: string
          company_id: string
          full_name?: string | null
          role?: "pm" | "admin"
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          full_name?: string | null
          role?: "pm" | "admin"
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          company_id: string
          address: string
          city: string
          postcode: string | null
          sqm: number | null
          floor: number | null
          bedrooms: number | null
          bathrooms: number | null
          wc: number | null
          year_built: number | null
          year_renovated: number | null
          electricity_meter: string | null
          water_meter: string | null
          drive_photos_url: string | null
          google_maps_url: string | null
          furnishing_notes: string | null
          status: "let" | "vacant"
          assigned_pm_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          address: string
          city: string
          postcode?: string | null
          sqm?: number | null
          floor?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          wc?: number | null
          year_built?: number | null
          year_renovated?: number | null
          electricity_meter?: string | null
          water_meter?: string | null
          drive_photos_url?: string | null
          google_maps_url?: string | null
          furnishing_notes?: string | null
          status?: "let" | "vacant"
          assigned_pm_id?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>
      }
      landlords: {
        Row: {
          id: string
          company_id: string
          property_id: string
          full_name: string
          email: string | null
          phone: string | null
          legal_rep_name: string | null
          legal_rep_phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          legal_rep_name?: string | null
          legal_rep_phone?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["landlords"]["Insert"]>
      }
      management_agreements: {
        Row: {
          id: string
          company_id: string
          property_id: string
          contract_type: "guaranteed_rent" | "commission" | "management_fee"
          start_date: string
          end_date: string
          monthly_rent_guaranteed: number | null
          commission_pct: number | null
          management_fee: number | null
          drive_contract_url: string | null
          alert_30d_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          contract_type: "guaranteed_rent" | "commission" | "management_fee"
          start_date: string
          end_date: string
          monthly_rent_guaranteed?: number | null
          commission_pct?: number | null
          management_fee?: number | null
          drive_contract_url?: string | null
          alert_30d_sent_at?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["management_agreements"]["Insert"]>
      }
      tenants: {
        Row: {
          id: string
          company_id: string
          full_name: string
          email: string | null
          phone: string | null
          passport_drive_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          passport_drive_url?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>
      }
      tenancies: {
        Row: {
          id: string
          company_id: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          rent_payment_day: number
          cpi_indexed: boolean
          bills_included: string[] | null
          bills_excluded: string[] | null
          status: "active" | "future" | "past"
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          rent_payment_day?: number
          cpi_indexed?: boolean
          bills_included?: string[] | null
          bills_excluded?: string[] | null
          status?: "active" | "future" | "past"
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["tenancies"]["Insert"]>
      }
      rent_payments: {
        Row: {
          id: string
          company_id: string
          tenancy_id: string
          property_id: string
          month: string
          amount: number
          paid: boolean
          paid_at: string | null
          bank_statement_date: string | null
          proof_of_payment_url: string | null
          rf_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          tenancy_id: string
          property_id: string
          month: string
          amount: number
          paid?: boolean
          paid_at?: string | null
          bank_statement_date?: string | null
          proof_of_payment_url?: string | null
          rf_reference?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["rent_payments"]["Insert"]>
      }
      arrears_log: {
        Row: {
          id: string
          company_id: string
          rent_payment_id: string
          stage: "d1" | "d7" | "d30"
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          rent_payment_id: string
          stage: "d1" | "d7" | "d30"
          sent_at?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["arrears_log"]["Insert"]>
      }
      certificates: {
        Row: {
          id: string
          company_id: string
          property_id: string
          type: string
          label: string
          valid_until: string | null
          rating: string | null
          document_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          type: string
          label: string
          valid_until?: string | null
          rating?: string | null
          document_url?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>
      }
      utilities: {
        Row: {
          id: string
          company_id: string
          property_id: string
          type: "electricity" | "water" | "internet"
          provider: string | null
          account_number: string | null
          meter_number: string | null
          transfer_status: "transferred" | "not-transferred"
          transfer_date: string | null
          building_manager_name: string | null
          building_manager_phone: string | null
          building_charges_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          type: "electricity" | "water" | "internet"
          provider?: string | null
          account_number?: string | null
          meter_number?: string | null
          transfer_status?: "transferred" | "not-transferred"
          transfer_date?: string | null
          building_manager_name?: string | null
          building_manager_phone?: string | null
          building_charges_amount?: number | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["utilities"]["Insert"]>
      }
      utility_payments: {
        Row: {
          id: string
          company_id: string
          utility_id: string
          property_id: string
          month: string
          amount: number
          paid: boolean
          drive_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          utility_id: string
          property_id: string
          month: string
          amount: number
          paid?: boolean
          drive_url?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["utility_payments"]["Insert"]>
      }
      communication_logs: {
        Row: {
          id: string
          company_id: string
          property_id: string
          date: string
          type: "whatsapp" | "phone" | "email" | "in-person" | "maintenance"
          summary: string
          description: string | null
          agreed_steps: string | null
          author_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          date: string
          type: "whatsapp" | "phone" | "email" | "in-person" | "maintenance"
          summary: string
          description?: string | null
          agreed_steps?: string | null
          author_id?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["communication_logs"]["Insert"]>
      }
      documents: {
        Row: {
          id: string
          company_id: string
          property_id: string
          tenancy_id: string | null
          type: "tenancy_agreement" | "ydh_certificate" | "pea_certificate" | "check_in_report" | "check_out_report" | "other"
          name: string
          drive_url: string | null
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          tenancy_id?: string | null
          type: "tenancy_agreement" | "ydh_certificate" | "pea_certificate" | "check_in_report" | "check_out_report" | "other"
          name: string
          drive_url?: string | null
          storage_path?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>
      }
      payouts: {
        Row: {
          id: string
          company_id: string
          property_id: string
          management_agreement_id: string | null
          period_start: string
          period_end: string
          gross_rent: number
          deductions: number
          net_amount: number
          sent: boolean
          sent_at: string | null
          bank_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          management_agreement_id?: string | null
          period_start: string
          period_end: string
          gross_rent: number
          deductions?: number
          net_amount: number
          sent?: boolean
          sent_at?: string | null
          bank_reference?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["payouts"]["Insert"]>
      }
      agents: {
        Row: {
          id: string
          company_id: string
          full_name: string
          company_name: string | null
          phone: string | null
          email: string | null
          area_specialty: string | null
          commission_pct: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          full_name: string
          company_name?: string | null
          phone?: string | null
          email?: string | null
          area_specialty?: string | null
          commission_pct?: number | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>
      }
      leads: {
        Row: {
          id: string
          company_id: string
          property_id: string
          agent_id: string | null
          full_name: string | null
          phone: string | null
          email: string | null
          status: "new" | "viewing" | "offer" | "converted" | "lost"
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          property_id: string
          agent_id?: string | null
          full_name?: string | null
          phone?: string | null
          email?: string | null
          status?: "new" | "viewing" | "offer" | "converted" | "lost"
          comments?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>
      }
      pipeline_properties: {
        Row: {
          id: string
          company_id: string
          address: string
          expected_rollout_date: string | null
          status: "sourcing" | "signed" | "listed" | "let"
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          address: string
          expected_rollout_date?: string | null
          status?: "sourcing" | "signed" | "listed" | "let"
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["pipeline_properties"]["Insert"]>
      }
    }
    Functions: {
      auth_company_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

// Convenience row types — use these in components and hooks
export type Company = Database["public"]["Tables"]["companies"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Property = Database["public"]["Tables"]["properties"]["Row"]
export type Landlord = Database["public"]["Tables"]["landlords"]["Row"]
export type ManagementAgreement = Database["public"]["Tables"]["management_agreements"]["Row"]
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"]
export type Tenancy = Database["public"]["Tables"]["tenancies"]["Row"]
export type RentPayment = Database["public"]["Tables"]["rent_payments"]["Row"]
export type ArrearsLog = Database["public"]["Tables"]["arrears_log"]["Row"]
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"]
export type Utility = Database["public"]["Tables"]["utilities"]["Row"]
export type UtilityPayment = Database["public"]["Tables"]["utility_payments"]["Row"]
export type CommunicationLog = Database["public"]["Tables"]["communication_logs"]["Row"]
export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type Payout = Database["public"]["Tables"]["payouts"]["Row"]
export type Agent = Database["public"]["Tables"]["agents"]["Row"]
export type Lead = Database["public"]["Tables"]["leads"]["Row"]
export type PipelineProperty = Database["public"]["Tables"]["pipeline_properties"]["Row"]
```

- [ ] **Step 3: Run typecheck to make sure the types file itself is valid**

```bash
cd ~/propmanager && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ~/propmanager
git add src/types/supabase.ts
git commit -m "types: add Supabase TypeScript types for all DB tables"
```

---

### Task 6: Verify M0 is Complete — CI Passes Locally

- [ ] **Step 1: Run the full CI sequence locally**

```bash
cd ~/propmanager
npx tsc --noEmit && echo "✓ typecheck" && \
npm run lint && echo "✓ lint" && \
npm run test -- --coverage && echo "✓ tests" && \
npm run build && echo "✓ build"
```

Expected: all four steps print their ✓ line and the sequence exits 0.

- [ ] **Step 2: Push to GitHub to trigger Actions**

```bash
cd ~/propmanager && git push origin main
```

Then open `https://github.com/terekhovas/remix-of-dream-weaver-hub-13/actions` and confirm all four jobs go green.

**Note on secrets:** Before the CI `test` and `build` jobs will pass with Supabase env vars, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets in GitHub: Settings → Secrets and variables → Actions → New repository secret.

For M0, the tests don't import Supabase yet, so the jobs will pass even without the secrets. Add them before M1 lands.

- [ ] **Step 3: Connect Vercel**

In the Vercel dashboard (vercel.com):
1. Click "Add New Project"
2. Import `terekhovas/remix-of-dream-weaver-hub-13` from GitHub
3. Framework: Vite (auto-detected)
4. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy

After connecting, every branch push will automatically get a preview URL.

- [ ] **Step 4: M0 complete — confirm pipeline is live**

Confirm:
- GitHub Actions green on main ✓
- Vercel production URL live ✓
- Preview deployments appear on branches ✓

---

## Phase 2: M1 — Auth & Supabase Setup

---

### Task 7: Install Supabase JS Client

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Create the Supabase project**

In the Supabase dashboard (supabase.com):
1. Click "New project"
2. Name: `propmanager`
3. Region: EU West (Ireland) — closest to Athens
4. Set a strong database password and save it
5. Wait for provisioning (~2 minutes)

- [ ] **Step 2: Apply the schema migration**

In the Supabase dashboard → SQL Editor → New query:
- Paste the full contents of `supabase/migrations/20260519000000_initial_schema.sql`
- Click Run

Expected: all tables created with no errors.

- [ ] **Step 3: Copy credentials**

In Supabase dashboard → Project Settings → API:
- Copy `Project URL` → this is `VITE_SUPABASE_URL`
- Copy `anon public` key → this is `VITE_SUPABASE_ANON_KEY`

Add both to:
- `.env.local` (local dev)
- GitHub repository secrets (Settings → Secrets → Actions)
- Vercel environment variables (project settings → Environment Variables, set for all environments)

- [ ] **Step 4: Install the Supabase JS client**

```bash
cd ~/propmanager && npm install @supabase/supabase-js
```

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add package.json package-lock.json
git commit -m "deps: add @supabase/supabase-js"
```

---

### Task 8: Supabase Client Singleton

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/supabase.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { supabase } from "./supabase"

describe("supabase client", () => {
  it("exports a supabase client instance", () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.getSession).toBe("function")
    expect(typeof supabase.from).toBe("function")
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ~/propmanager && npm run test -- src/lib/supabase.test.ts
```

Expected: FAIL — `Cannot find module './supabase'`

- [ ] **Step 3: Write the Supabase client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd ~/propmanager && npm run test -- src/lib/supabase.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/lib/supabase.ts src/lib/supabase.test.ts
git commit -m "feat: add typed Supabase client singleton"
```

---

### Task 9: Auth Context

**Files:**
- Create: `src/contexts/AuthContext.tsx`

The AuthContext holds the current Supabase session and profile. It subscribes to `onAuthStateChange` so the entire app reacts to login/logout without polling.

- [ ] **Step 1: Create test directory and write the failing test**

```bash
mkdir -p ~/propmanager/src/__tests__/auth
```

Create `src/__tests__/auth/AuthContext.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext"

// Mock the supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

function TestConsumer() {
  const { session, loading } = useAuthContext()
  if (loading) return <div>loading</div>
  return <div>{session ? "authenticated" : "unauthenticated"}</div>
}

describe("AuthContext", () => {
  it("renders children and shows unauthenticated when no session", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeInTheDocument()
    })
  })

  it("shows loading initially", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByText("loading")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/AuthContext.test.tsx
```

Expected: FAIL — `Cannot find module '@/contexts/AuthContext'`

- [ ] **Step 3: Write the AuthContext**

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/supabase"

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        fetchProfile(data.session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider")
  return ctx
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/AuthContext.test.tsx
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/contexts/AuthContext.tsx src/__tests__/auth/AuthContext.test.tsx
git commit -m "feat: add AuthContext with Supabase session and profile state"
```

---

### Task 10: useAuth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useAuth.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useAuth.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAuth } from "./useAuth"
import { AuthProvider } from "@/contexts/AuthContext"
import { ReactNode } from "react"

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe("useAuth", () => {
  it("returns session, profile, and loading from context", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toHaveProperty("session")
    expect(result.current).toHaveProperty("profile")
    expect(result.current).toHaveProperty("loading")
  })

  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuthContext must be used inside AuthProvider"
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ~/propmanager && npm run test -- src/hooks/useAuth.test.ts
```

Expected: FAIL — `Cannot find module './useAuth'`

- [ ] **Step 3: Write the hook**

Create `src/hooks/useAuth.ts`:

```typescript
import { useAuthContext } from "@/contexts/AuthContext"

export function useAuth() {
  return useAuthContext()
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd ~/propmanager && npm run test -- src/hooks/useAuth.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/hooks/useAuth.ts src/hooks/useAuth.test.ts
git commit -m "feat: add useAuth convenience hook"
```

---

### Task 11: Login Page

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/__tests__/auth/Login.test.tsx`

- [ ] **Step 1: Create test directory and write the failing test**

```bash
mkdir -p ~/propmanager/src/__tests__/auth
```

Create `src/__tests__/auth/Login.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Login from "@/pages/Login"

const mockSignIn = vi.fn()

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
    },
  },
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe("Login page", () => {
  beforeEach(() => {
    mockSignIn.mockReset()
  })

  it("renders email and password fields and a submit button", () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("calls supabase.auth.signInWithPassword with entered credentials", async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "sofia@renty.life" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "sofia@renty.life",
        password: "secret123",
      })
    })
  })

  it("shows an error message when sign-in fails", async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: "Invalid credentials" } })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@email.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/Login.test.tsx
```

Expected: FAIL — `Cannot find module '@/pages/Login'`

- [ ] **Step 3: Write the Login page**

Create `src/pages/Login.tsx`:

```typescript
import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>PropManager</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/Login.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/pages/Login.tsx src/__tests__/auth/Login.test.tsx
git commit -m "feat: add Login page with email/password form and error handling"
```

---

### Task 12: ProtectedRoute Component

**Files:**
- Create: `src/components/auth/ProtectedRoute.tsx`
- Create: `src/__tests__/auth/ProtectedRoute.test.tsx`

- [ ] **Step 1: Create test directory and write the failing test**

```bash
mkdir -p ~/propmanager/src/__tests__/auth
```

Create `src/__tests__/auth/ProtectedRoute.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

// Mock useAuth — we control what it returns per test
const mockUseAuth = vi.fn()
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }))

function renderWithRouter(ui: React.ReactElement, initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ session: { user: { id: "1" } }, loading: false })
    renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(screen.getByText("dashboard")).toBeInTheDocument()
  })

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false })
    renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(screen.getByText("login page")).toBeInTheDocument()
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument()
  })

  it("renders nothing while loading", () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true })
    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>dashboard</div>
      </ProtectedRoute>
    )
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/ProtectedRoute.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/auth/ProtectedRoute'`

- [ ] **Step 3: Write the ProtectedRoute component**

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth()

  if (loading) return null

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd ~/propmanager && npm run test -- src/__tests__/auth/ProtectedRoute.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/components/auth/ProtectedRoute.tsx src/__tests__/auth/ProtectedRoute.test.tsx
git commit -m "feat: add ProtectedRoute — redirects unauthenticated users to /login"
```

---

### Task 13: Wire App Routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Read the current App.tsx**

```bash
cat ~/propmanager/src/App.tsx
```

- [ ] **Step 2: Update App.tsx**

Replace the contents of `src/App.tsx` with:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import Index from "./pages/Index"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Run all tests to verify nothing broke**

```bash
cd ~/propmanager && npm run test
```

Expected: all tests pass.

- [ ] **Step 4: Run typecheck**

```bash
cd ~/propmanager && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Start the dev server and verify the login flow visually**

```bash
cd ~/propmanager && npm run dev
```

Open `http://localhost:8080`. Expected:
- Redirected to `/login` immediately (not authenticated)
- Login form renders with PropManager branding
- Enter credentials for a Supabase user → redirected to dashboard

- [ ] **Step 6: Commit**

```bash
cd ~/propmanager
git add src/App.tsx
git commit -m "feat: protect main route with AuthProvider and ProtectedRoute"
```

---

### Task 14: Add Logout to Dashboard Header

**Files:**
- Modify: `src/pages/Index.tsx`

The dashboard header already renders the PropManager logo. Add a logout button next to it.

- [ ] **Step 1: Read the current Index.tsx header section**

```bash
head -60 ~/propmanager/src/pages/Index.tsx
```

- [ ] **Step 2: Add logout button to the header**

In `src/pages/Index.tsx`, import `useAuth` and `supabase`, then add a logout button to the header. Find the header section (contains `Building2` icon and "PropManager" text) and update it:

```typescript
// Add these imports at the top of Index.tsx
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

// Inside the component, before the return:
const { profile } = useAuth()

// Update the header div to add logout — find the div containing Building2 and add:
<div className="flex items-center justify-between p-4 border-b bg-white">
  <div className="flex items-center gap-2">
    <Building2 className="h-6 w-6 text-primary" />
    <h1 className="text-xl font-semibold">PropManager</h1>
  </div>
  <div className="flex items-center gap-3">
    {profile?.full_name && (
      <span className="text-sm text-muted-foreground">{profile.full_name}</span>
    )}
    <Button
      variant="ghost"
      size="sm"
      onClick={() => supabase.auth.signOut()}
    >
      <LogOut className="h-4 w-4 mr-1" />
      Sign out
    </Button>
  </div>
</div>
```

**Important:** Read `Index.tsx` first to find the exact header markup, then make a targeted edit. Do not rewrite the whole file — only update the header div.

- [ ] **Step 3: Run tests**

```bash
cd ~/propmanager && npm run test
```

Expected: all tests pass.

- [ ] **Step 4: Run typecheck**

```bash
cd ~/propmanager && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd ~/propmanager
git add src/pages/Index.tsx
git commit -m "feat: add logout button and profile name to dashboard header"
```

---

### Task 15: M1 Exit Criteria Verification

- [ ] **Step 1: Seed two PM accounts in Supabase**

In Supabase dashboard → Authentication → Users → Invite user:
1. Invite `sofia@renty.life` (role: admin)
2. Invite a second PM email (role: pm)

Both users will receive an invite email. After they set their password, run the seed SQL in the SQL Editor:

```sql
-- Replace the UUIDs with the actual user IDs from the Authentication > Users table
insert into companies (id, name) values ('YOUR-COMPANY-UUID', 'Renty');
insert into profiles (id, company_id, full_name, role) values
  ('SOFIA-USER-UUID', 'YOUR-COMPANY-UUID', 'Sofia Terekhova', 'admin'),
  ('PM2-USER-UUID', 'YOUR-COMPANY-UUID', 'PM Two', 'pm');
```

- [ ] **Step 2: Verify the exit criteria**

Confirm all of the following:
- [ ] Log in as `sofia@renty.life` → redirected to dashboard ✓
- [ ] Dashboard header shows "Sofia Terekhova" and a Sign out button ✓
- [ ] Click Sign out → redirected to `/login` ✓
- [ ] Log in as PM Two → redirected to dashboard ✓
- [ ] Both accounts see the same company's data (same company_id scope) ✓

- [ ] **Step 3: Run full CI sequence one more time**

```bash
cd ~/propmanager
npx tsc --noEmit && npm run lint && npm run test -- --coverage && npm run build
```

Expected: all pass.

- [ ] **Step 4: Push and verify Vercel preview**

```bash
cd ~/propmanager && git push origin main
```

Open the Vercel dashboard, confirm production deployment is live and shows the login page.

**M1 complete.** ✓

---

## Summary

| Task | Deliverable |
|------|------------|
| 1 | `.github/workflows/ci.yml` — 4-job CI pipeline |
| 2 | Vitest v8 coverage configured |
| 3 | `.env.local.example` — env var documentation |
| 4 | Full Supabase schema SQL with RLS |
| 5 | `src/types/supabase.ts` — typed DB schema |
| 6 | CI verified green locally + on GitHub + Vercel connected |
| 7 | `@supabase/supabase-js` installed, Supabase project created |
| 8 | `src/lib/supabase.ts` — typed client singleton |
| 9 | `src/contexts/AuthContext.tsx` — session + profile state |
| 10 | `src/hooks/useAuth.ts` — convenience hook |
| 11 | `src/pages/Login.tsx` — email/password login form |
| 12 | `src/components/auth/ProtectedRoute.tsx` — auth guard |
| 13 | `src/App.tsx` updated — routes protected |
| 14 | Dashboard header with logout + profile name |
| 15 | Two PM accounts seeded, exit criteria verified |

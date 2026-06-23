-- =============================================
-- PropManager Schema Extension
-- Migration: 20260623000001_extend_schema
-- Run in Supabase SQL editor after 20260623000000_grant_authenticated.sql
-- =============================================

-- =============================================
-- 1. Extend existing tables
-- =============================================

-- Properties: new operational columns
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS landlord_tax_id       text,                         -- 9-digit AFM
  ADD COLUMN IF NOT EXISTS pmc_fee_percent        integer NOT NULL DEFAULT 10,  -- 10 or 15
  ADD COLUMN IF NOT EXISTS payment_punctuality    text CHECK (payment_punctuality IN ('green', 'yellow', 'red')),
  ADD COLUMN IF NOT EXISTS vacant_since_date      date,
  ADD COLUMN IF NOT EXISTS project_id             uuid,
  ADD COLUMN IF NOT EXISTS apartment_label        text;

-- Landlords: add tax ID
ALTER TABLE landlords
  ADD COLUMN IF NOT EXISTS tax_id text;  -- 9-digit AFM

-- Management agreements: update contract type vocabulary and add financial columns
-- Note: existing contract_type check must be dropped and recreated
ALTER TABLE management_agreements
  DROP CONSTRAINT IF EXISTS management_agreements_contract_type_check;

ALTER TABLE management_agreements
  ADD CONSTRAINT management_agreements_contract_type_check
    CHECK (contract_type IN (
      'sublease-guaranteed',
      'sublease-no-guarantee',
      'mgmt-collect-rent',
      'mgmt-owner-collects'
    ));

ALTER TABLE management_agreements
  ADD COLUMN IF NOT EXISTS guaranteed_rent    numeric,   -- sublease-guaranteed: amount PMC guarantees to landlord
  ADD COLUMN IF NOT EXISTS owner_payment      numeric,   -- mgmt-collect-rent: net amount paid to owner
  ADD COLUMN IF NOT EXISTS commission_pct     numeric,   -- sublease-no-guarantee / mgmt-owner-collects: PMC commission %
  ADD COLUMN IF NOT EXISTS document_url       text;      -- Google Drive / Supabase Storage URL

-- =============================================
-- 2. New table: projects (apartment buildings)
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  name          text NOT NULL,
  city          text NOT NULL,
  street        text,
  building_num  text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE properties
  ADD CONSTRAINT properties_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) DEFERRABLE INITIALLY DEFERRED;

-- =============================================
-- 3. New table: deposits
-- =============================================
CREATE TABLE IF NOT EXISTS deposits (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              uuid NOT NULL REFERENCES companies(id),
  property_id             uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status                  text NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'returned')),
  amount                  numeric NOT NULL,
  date_paid               date,
  due_date                date,
  held_at                 text,
  payment_ref             text,
  proof_url               text,
  return_bank_ref         text,
  return_transfer_date    date,
  return_authorized_by    text,
  return_proof_url        text,
  created_at              timestamptz DEFAULT now(),
  UNIQUE (property_id)
);

-- =============================================
-- 4. New table: keys_tracking
-- =============================================
CREATE TABLE IF NOT EXISTS keys_tracking (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  holder      text NOT NULL CHECK (holder IN ('tenant', 'landlord', 'agent')),
  has_key     boolean NOT NULL DEFAULT false,
  given_date  date,
  location    text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (property_id, holder)
);

-- =============================================
-- 5. New table: service_charges
-- =============================================
CREATE TABLE IF NOT EXISTS service_charges (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              uuid NOT NULL REFERENCES companies(id),
  property_id             uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status                  text NOT NULL DEFAULT 'n/a' CHECK (status IN ('paid', 'outstanding', 'n/a')),
  annual_amount           numeric NOT NULL DEFAULT 0,
  building_manager_name   text,
  building_manager_phone  text,
  building_manager_email  text,
  created_at              timestamptz DEFAULT now(),
  UNIQUE (property_id)
);

CREATE TABLE IF NOT EXISTS service_charge_payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_charge_id   uuid NOT NULL REFERENCES service_charges(id) ON DELETE CASCADE,
  month               integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year                integer NOT NULL,
  paid                boolean NOT NULL DEFAULT false,
  proof_url           text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (service_charge_id, year, month)
);

-- =============================================
-- 6. New table: maintenance_items
-- =============================================
CREATE TABLE IF NOT EXISTS maintenance_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  description     text NOT NULL,
  report_date     date NOT NULL,
  resolve_date    date,
  cost            numeric NOT NULL DEFAULT 0,
  resolution_days integer,
  pm_id           uuid REFERENCES profiles(id),
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- =============================================
-- 7. New table: periodical_checks
-- =============================================
CREATE TABLE IF NOT EXISTS periodical_checks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  check_date      date NOT NULL,
  pm_id           uuid REFERENCES profiles(id),
  status          text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
  comments        text,
  photos_count    integer NOT NULL DEFAULT 0,
  next_check_date date,
  created_at      timestamptz DEFAULT now()
);

-- =============================================
-- 8. New table: investment_data
-- =============================================
CREATE TABLE IF NOT EXISTS investment_data (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            uuid NOT NULL REFERENCES companies(id),
  property_id           uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  purchase_price        numeric,
  capex                 numeric,
  debt                  numeric DEFAULT 0,
  debt_terms            text,
  excel_model_url       text,
  gross_yield           numeric,
  net_yield             numeric,
  irr_levered           numeric,
  irr_unlevered         numeric,
  created_at            timestamptz DEFAULT now(),
  UNIQUE (property_id)
);

-- =============================================
-- 9. New table: vacant_listings
-- =============================================
CREATE TABLE IF NOT EXISTS vacant_listings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  listing_url     text,
  is_live         boolean NOT NULL DEFAULT false,
  views           integer NOT NULL DEFAULT 0,
  calls           integer NOT NULL DEFAULT 0,
  viewings        integer NOT NULL DEFAULT 0,
  inquiries       integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (property_id)
);

-- =============================================
-- 10. New table: price_adjustments (vacant properties)
-- =============================================
CREATE TABLE IF NOT EXISTS price_adjustments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date        date NOT NULL,
  price       numeric NOT NULL,
  reason      text,
  created_at  timestamptz DEFAULT now()
);

-- =============================================
-- 11. New table: market_data
-- =============================================
CREATE TABLE IF NOT EXISTS market_data (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  market_rent     numeric,
  actual_rent     numeric,
  source          text,
  last_updated    date,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (property_id)
);

-- =============================================
-- 12. New table: arrears_stages (per-property per-stage state)
-- =============================================
CREATE TABLE IF NOT EXISTS arrears_stages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid NOT NULL REFERENCES companies(id),
  property_id         uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenancy_id          uuid REFERENCES tenancies(id),
  stage               text NOT NULL CHECK (stage IN ('D1', 'D7', 'D30')),
  active              boolean NOT NULL DEFAULT false,
  sms_triggered       boolean DEFAULT false,
  email_triggered     boolean DEFAULT false,
  call_made           boolean DEFAULT false,
  formal_notice       boolean DEFAULT false,
  lawyer_notified     boolean DEFAULT false,
  eviction_initiated  boolean DEFAULT false,
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (property_id, tenancy_id, stage)
);

-- =============================================
-- 13. Enable RLS on all new tables
-- =============================================
ALTER TABLE projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits              ENABLE ROW LEVEL SECURITY;
ALTER TABLE keys_tracking         ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodical_checks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacant_listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_adjustments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data           ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrears_stages        ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 14. RLS policies — company isolation
-- =============================================
CREATE POLICY "projects_company_isolation"              ON projects              FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "deposits_company_isolation"              ON deposits              FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "keys_tracking_company_isolation"         ON keys_tracking         FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "service_charges_company_isolation"       ON service_charges       FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "service_charge_payments_sc_isolation"    ON service_charge_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM service_charges sc WHERE sc.id = service_charge_id AND sc.company_id = auth_company_id())
);
CREATE POLICY "maintenance_items_company_isolation"     ON maintenance_items     FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "periodical_checks_company_isolation"     ON periodical_checks     FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "investment_data_company_isolation"       ON investment_data       FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "vacant_listings_company_isolation"       ON vacant_listings       FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "price_adjustments_company_isolation"     ON price_adjustments     FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "market_data_company_isolation"           ON market_data           FOR ALL USING (company_id = auth_company_id());
CREATE POLICY "arrears_stages_company_isolation"        ON arrears_stages        FOR ALL USING (company_id = auth_company_id());

-- =============================================
-- 15. Grant privileges to authenticated role
-- =============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON projects              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deposits              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON keys_tracking         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_charges       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_charge_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_items     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON periodical_checks     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON investment_data       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vacant_listings       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON price_adjustments     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON market_data           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON arrears_stages        TO authenticated;

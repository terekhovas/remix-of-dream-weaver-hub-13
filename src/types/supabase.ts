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
        Row: { id: string; name: string; created_at: string }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
      }
      profiles: {
        Row: { id: string; company_id: string; full_name: string | null; role: "pm" | "admin"; created_at: string }
        Insert: { id: string; company_id: string; full_name?: string | null; role?: "pm" | "admin"; created_at?: string }
        Update: { id?: string; company_id?: string; full_name?: string | null; role?: "pm" | "admin"; created_at?: string }
      }
      properties: {
        Row: {
          id: string; company_id: string; address: string; city: string; postcode: string | null
          sqm: number | null; floor: number | null; bedrooms: number | null; bathrooms: number | null
          wc: number | null; year_built: number | null; year_renovated: number | null
          electricity_meter: string | null; water_meter: string | null; drive_photos_url: string | null
          google_maps_url: string | null; furnishing_notes: string | null; status: "let" | "vacant"
          assigned_pm_id: string | null; created_at: string
        }
        Insert: {
          id?: string; company_id: string; address: string; city: string; postcode?: string | null
          sqm?: number | null; floor?: number | null; bedrooms?: number | null; bathrooms?: number | null
          wc?: number | null; year_built?: number | null; year_renovated?: number | null
          electricity_meter?: string | null; water_meter?: string | null; drive_photos_url?: string | null
          google_maps_url?: string | null; furnishing_notes?: string | null; status?: "let" | "vacant"
          assigned_pm_id?: string | null; created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>
      }
      landlords: {
        Row: { id: string; company_id: string; property_id: string; full_name: string; email: string | null; phone: string | null; legal_rep_name: string | null; legal_rep_phone: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; full_name: string; email?: string | null; phone?: string | null; legal_rep_name?: string | null; legal_rep_phone?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["landlords"]["Insert"]>
      }
      management_agreements: {
        Row: { id: string; company_id: string; property_id: string; contract_type: "guaranteed_rent" | "commission" | "management_fee"; start_date: string; end_date: string; monthly_rent_guaranteed: number | null; commission_pct: number | null; management_fee: number | null; drive_contract_url: string | null; alert_30d_sent_at: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; contract_type: "guaranteed_rent" | "commission" | "management_fee"; start_date: string; end_date: string; monthly_rent_guaranteed?: number | null; commission_pct?: number | null; management_fee?: number | null; drive_contract_url?: string | null; alert_30d_sent_at?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["management_agreements"]["Insert"]>
      }
      tenants: {
        Row: { id: string; company_id: string; full_name: string; email: string | null; phone: string | null; passport_drive_url: string | null; created_at: string }
        Insert: { id?: string; company_id: string; full_name: string; email?: string | null; phone?: string | null; passport_drive_url?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>
      }
      tenancies: {
        Row: { id: string; company_id: string; property_id: string; tenant_id: string; start_date: string; end_date: string; monthly_rent: number; rent_payment_day: number; cpi_indexed: boolean; bills_included: string[] | null; bills_excluded: string[] | null; status: "active" | "future" | "past"; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; tenant_id: string; start_date: string; end_date: string; monthly_rent: number; rent_payment_day?: number; cpi_indexed?: boolean; bills_included?: string[] | null; bills_excluded?: string[] | null; status?: "active" | "future" | "past"; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["tenancies"]["Insert"]>
      }
      rent_payments: {
        Row: { id: string; company_id: string; tenancy_id: string; property_id: string; month: string; amount: number; paid: boolean; paid_at: string | null; bank_statement_date: string | null; proof_of_payment_url: string | null; rf_reference: string | null; created_at: string }
        Insert: { id?: string; company_id: string; tenancy_id: string; property_id: string; month: string; amount: number; paid?: boolean; paid_at?: string | null; bank_statement_date?: string | null; proof_of_payment_url?: string | null; rf_reference?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["rent_payments"]["Insert"]>
      }
      arrears_log: {
        Row: { id: string; company_id: string; rent_payment_id: string; stage: "d1" | "d7" | "d30"; sent_at: string; created_at: string }
        Insert: { id?: string; company_id: string; rent_payment_id: string; stage: "d1" | "d7" | "d30"; sent_at?: string; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["arrears_log"]["Insert"]>
      }
      certificates: {
        Row: { id: string; company_id: string; property_id: string; type: string; label: string; valid_until: string | null; rating: string | null; document_url: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; type: string; label: string; valid_until?: string | null; rating?: string | null; document_url?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>
      }
      utilities: {
        Row: { id: string; company_id: string; property_id: string; type: "electricity" | "water" | "internet"; provider: string | null; account_number: string | null; meter_number: string | null; transfer_status: "transferred" | "not-transferred"; transfer_date: string | null; building_manager_name: string | null; building_manager_phone: string | null; building_charges_amount: number | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; type: "electricity" | "water" | "internet"; provider?: string | null; account_number?: string | null; meter_number?: string | null; transfer_status?: "transferred" | "not-transferred"; transfer_date?: string | null; building_manager_name?: string | null; building_manager_phone?: string | null; building_charges_amount?: number | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["utilities"]["Insert"]>
      }
      utility_payments: {
        Row: { id: string; company_id: string; utility_id: string; property_id: string; month: string; amount: number; paid: boolean; drive_url: string | null; created_at: string }
        Insert: { id?: string; company_id: string; utility_id: string; property_id: string; month: string; amount: number; paid?: boolean; drive_url?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["utility_payments"]["Insert"]>
      }
      communication_logs: {
        Row: { id: string; company_id: string; property_id: string; date: string; type: "whatsapp" | "phone" | "email" | "in-person" | "maintenance"; summary: string; description: string | null; agreed_steps: string | null; author_id: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; date: string; type: "whatsapp" | "phone" | "email" | "in-person" | "maintenance"; summary: string; description?: string | null; agreed_steps?: string | null; author_id?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["communication_logs"]["Insert"]>
      }
      documents: {
        Row: { id: string; company_id: string; property_id: string; tenancy_id: string | null; type: "tenancy_agreement" | "ydh_certificate" | "pea_certificate" | "check_in_report" | "check_out_report" | "other"; name: string; drive_url: string | null; storage_path: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; tenancy_id?: string | null; type: "tenancy_agreement" | "ydh_certificate" | "pea_certificate" | "check_in_report" | "check_out_report" | "other"; name: string; drive_url?: string | null; storage_path?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>
      }
      payouts: {
        Row: { id: string; company_id: string; property_id: string; management_agreement_id: string | null; period_start: string; period_end: string; gross_rent: number; deductions: number; net_amount: number; sent: boolean; sent_at: string | null; bank_reference: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; management_agreement_id?: string | null; period_start: string; period_end: string; gross_rent: number; deductions?: number; net_amount: number; sent?: boolean; sent_at?: string | null; bank_reference?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["payouts"]["Insert"]>
      }
      agents: {
        Row: { id: string; company_id: string; full_name: string; company_name: string | null; phone: string | null; email: string | null; area_specialty: string | null; commission_pct: number | null; created_at: string }
        Insert: { id?: string; company_id: string; full_name: string; company_name?: string | null; phone?: string | null; email?: string | null; area_specialty?: string | null; commission_pct?: number | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>
      }
      leads: {
        Row: { id: string; company_id: string; property_id: string; agent_id: string | null; full_name: string | null; phone: string | null; email: string | null; status: "new" | "viewing" | "offer" | "converted" | "lost"; comments: string | null; created_at: string }
        Insert: { id?: string; company_id: string; property_id: string; agent_id?: string | null; full_name?: string | null; phone?: string | null; email?: string | null; status?: "new" | "viewing" | "offer" | "converted" | "lost"; comments?: string | null; created_at?: string }
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>
      }
      pipeline_properties: {
        Row: { id: string; company_id: string; address: string; expected_rollout_date: string | null; status: "sourcing" | "signed" | "listed" | "let"; notes: string | null; created_at: string }
        Insert: { id?: string; company_id: string; address: string; expected_rollout_date?: string | null; status?: "sourcing" | "signed" | "listed" | "let"; notes?: string | null; created_at?: string }
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

// Convenience row types
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

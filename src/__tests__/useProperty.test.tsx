import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useProperty } from "@/hooks/useProperty";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from "@/lib/supabase";

const mockDetail = {
  id: "prop-1",
  company_id: "co-1",
  address: "10 Ερμού",
  city: "Athens",
  postcode: "10563",
  status: "let",
  sqm: 75,
  floor: 2,
  bedrooms: 2,
  bathrooms: 1,
  wc: 1,
  year_built: 1990,
  year_renovated: 2015,
  electricity_meter: "EL123",
  water_meter: "W456",
  drive_photos_url: null,
  google_maps_url: null,
  furnishing_notes: null,
  assigned_pm_id: "pm-1",
  created_at: "2026-01-01T00:00:00Z",
  assigned_pm: { full_name: "Γιάννης Σ." },
  landlords: [
    {
      id: "l-1", company_id: "co-1", property_id: "prop-1",
      full_name: "Νίκος Κ.", email: "nikos@email.gr", phone: "6945000002",
      legal_rep_name: null, legal_rep_phone: null, created_at: "2026-01-01T00:00:00Z",
    },
  ],
  management_agreements: [
    {
      id: "ma-1", company_id: "co-1", property_id: "prop-1",
      contract_type: "guaranteed_rent", start_date: "2025-01-01", end_date: "2027-01-01",
      monthly_rent_guaranteed: 800, commission_pct: null, management_fee: null,
      drive_contract_url: null, alert_30d_sent_at: null, created_at: "2026-01-01T00:00:00Z",
    },
  ],
  tenancies: [
    {
      id: "t-1", company_id: "co-1", property_id: "prop-1", tenant_id: "tn-1",
      start_date: "2025-01-01", end_date: "2027-01-01", monthly_rent: 800,
      rent_payment_day: 1, cpi_indexed: false, bills_included: null, bills_excluded: null,
      status: "active", created_at: "2026-01-01T00:00:00Z",
      tenant: {
        id: "tn-1", company_id: "co-1", full_name: "Μαρία Β.",
        email: "maria@email.gr", phone: "6945000001",
        passport_drive_url: null, created_at: "2026-01-01T00:00:00Z",
      },
    },
  ],
  certificates: [
    {
      id: "cert-1", company_id: "co-1", property_id: "prop-1",
      type: "ΥΔΗ", label: "Υπεύθυνη Δήλωση Ηλεκτρολόγου",
      valid_until: "2028-01-01", rating: null, document_url: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useProperty", () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockDetail, error: null }),
        }),
      }),
    } as any);
  });

  it("returns full property detail including landlords and tenancies", async () => {
    const { result } = renderHook(() => useProperty("prop-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.address).toBe("10 Ερμού");
    expect(result.current.data!.landlords).toHaveLength(1);
    expect(result.current.data!.tenancies[0].tenant.full_name).toBe("Μαρία Β.");
    expect(result.current.data!.certificates).toHaveLength(1);
  });

  it("exposes isError when Supabase returns an error", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
        }),
      }),
    } as any);
    const { result } = renderHook(() => useProperty("prop-1"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

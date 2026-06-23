import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useProperties } from "@/hooks/useProperties";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from "@/lib/supabase";

const mockRows = [
  {
    id: "prop-1",
    address: "10 Ερμού",
    city: "Athens",
    postcode: "10563",
    status: "let",
    assigned_pm_id: "pm-1",
    company_id: "co-1",
    sqm: null, floor: null, bedrooms: null, bathrooms: null, wc: null,
    year_built: null, year_renovated: null, electricity_meter: null,
    water_meter: null, drive_photos_url: null, google_maps_url: null,
    furnishing_notes: null, created_at: "2026-01-01T00:00:00Z",
    assigned_pm: { full_name: "Γιάννης Σ." },
    tenancies: [
      {
        id: "t-1",
        start_date: "2025-01-01",
        end_date: "2027-01-01",
        monthly_rent: 800,
        status: "active",
        tenant: { full_name: "Μαρία Β.", phone: "6945000001" },
      },
    ],
  },
];

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useProperties", () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      }),
    } as any);
  });

  it("returns property rows from Supabase", async () => {
    const { result } = renderHook(() => useProperties(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].address).toBe("10 Ερμού");
  });

  it("exposes isLoading true before data arrives", () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    } as any);
    const { result } = renderHook(() => useProperties(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it("exposes isError when Supabase returns an error object", async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
      }),
    } as any);
    const { result } = renderHook(() => useProperties(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

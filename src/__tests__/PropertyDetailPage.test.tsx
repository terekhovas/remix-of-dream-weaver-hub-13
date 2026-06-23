// src/__tests__/PropertyDetailPage.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import PropertyDetailPage from "@/pages/properties/PropertyDetailPage";
import type { PropertyDetail } from "@/hooks/useProperty";

vi.mock("@/hooks/useProperty");
import { useProperty } from "@/hooks/useProperty";

const mockDetail: PropertyDetail = {
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
  furnishing_notes: "Fully furnished",
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
      rent_payment_day: 1, cpi_indexed: true, bills_included: null, bills_excluded: null,
      status: "active", created_at: "2026-01-01T00:00:00Z",
      tenant: {
        id: "tn-1", company_id: "co-1", full_name: "Μαρία Β.",
        email: "maria@email.gr", phone: "6945000001",
        passport_drive_url: null, created_at: "2026-01-01T00:00:00Z",
      },
    },
    {
      id: "t-2", company_id: "co-1", property_id: "prop-1", tenant_id: "tn-2",
      start_date: "2022-01-01", end_date: "2024-12-31", monthly_rent: 650,
      rent_payment_day: 1, cpi_indexed: false, bills_included: null, bills_excluded: null,
      status: "past", created_at: "2026-01-01T00:00:00Z",
      tenant: {
        id: "tn-2", company_id: "co-1", full_name: "Κώστας Δ.",
        email: null, phone: null, passport_drive_url: null, created_at: "2026-01-01T00:00:00Z",
      },
    },
  ],
  certificates: [
    {
      id: "cert-1", company_id: "co-1", property_id: "prop-1",
      type: "ΥΔΗ", label: "Υπεύθυνη Δήλωση Ηλεκτρολόγου",
      valid_until: "2028-06-01", rating: null, document_url: null,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "cert-2", company_id: "co-1", property_id: "prop-1",
      type: "ΠΕΑ", label: "Πιστοποιητικό Ενεργειακής Απόδοσης",
      valid_until: "2026-06-01", rating: "Β+", document_url: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/properties/prop-1"]}>
        <Routes>
          <Route path="/properties/:id" element={<>{children}</>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PropertyDetailPage", () => {
  describe("Home tab (default)", () => {
    it("shows property address as heading", () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      render(<PropertyDetailPage />, { wrapper });
      expect(screen.getByRole("heading", { name: /10 Ερμού/ })).toBeInTheDocument();
    });

    it("shows sqm, floor, bedrooms from property data", () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      render(<PropertyDetailPage />, { wrapper });
      expect(screen.getByText("75 m²")).toBeInTheDocument();
      expect(screen.getByText("2nd floor")).toBeInTheDocument();
      expect(screen.getByText("2 beds")).toBeInTheDocument();
    });

    it("lists certificate types", () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      render(<PropertyDetailPage />, { wrapper });
      expect(screen.getByText("ΥΔΗ")).toBeInTheDocument();
      expect(screen.getByText("ΠΕΑ")).toBeInTheDocument();
    });

    it("shows skeleton when isLoading", () => {
      vi.mocked(useProperty).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any);
      render(<PropertyDetailPage />, { wrapper });
      expect(screen.getByTestId("property-detail-skeleton")).toBeInTheDocument();
    });
  });

  describe("Landlord tab", () => {
    it("shows landlord name and email after clicking Landlord tab", async () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      const user = userEvent.setup();
      render(<PropertyDetailPage />, { wrapper });
      await user.click(screen.getByRole("tab", { name: /landlord/i }));
      expect(screen.getByText("Νίκος Κ.")).toBeInTheDocument();
      expect(screen.getByText("nikos@email.gr")).toBeInTheDocument();
    });

    it("shows management agreement type after clicking Landlord tab", async () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      const user = userEvent.setup();
      render(<PropertyDetailPage />, { wrapper });
      await user.click(screen.getByRole("tab", { name: /landlord/i }));
      expect(screen.getByText(/guaranteed rent/i)).toBeInTheDocument();
    });
  });

  describe("Tenancies tab", () => {
    it("shows active tenant name and monthly rent after clicking Tenancies tab", async () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      const user = userEvent.setup();
      render(<PropertyDetailPage />, { wrapper });
      await user.click(screen.getByRole("tab", { name: /tenanc/i }));
      expect(screen.getByText("Μαρία Β.")).toBeInTheDocument();
      expect(screen.getByText(/€800/)).toBeInTheDocument();
    });

    it("shows past tenant name in Previous Tenancies section", async () => {
      vi.mocked(useProperty).mockReturnValue({ data: mockDetail, isLoading: false, isError: false } as any);
      const user = userEvent.setup();
      render(<PropertyDetailPage />, { wrapper });
      await user.click(screen.getByRole("tab", { name: /tenanc/i }));
      expect(screen.getByText("Κώστας Δ.")).toBeInTheDocument();
    });
  });
});

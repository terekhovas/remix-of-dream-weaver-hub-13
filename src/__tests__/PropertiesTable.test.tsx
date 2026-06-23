// src/__tests__/PropertiesTable.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { PropertiesTable } from "@/components/properties/PropertiesTable";
import type { PropertyListItem } from "@/hooks/useProperties";

vi.mock("@/hooks/useProperties");
import { useProperties } from "@/hooks/useProperties";

const mockItems: PropertyListItem[] = [
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
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<>{children}</>} />
          <Route path="/properties/:id" element={<div>Detail</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PropertiesTable", () => {
  it("renders property address and active tenant name from useProperties data", () => {
    vi.mocked(useProperties).mockReturnValue({ data: mockItems, isLoading: false, isError: false } as any);
    render(<PropertiesTable />, { wrapper });
    expect(screen.getByText("10 Ερμού")).toBeInTheDocument();
    expect(screen.getByText("Μαρία Β.")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading is true", () => {
    vi.mocked(useProperties).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any);
    render(<PropertiesTable />, { wrapper });
    expect(screen.getByTestId("properties-skeleton")).toBeInTheDocument();
  });

  it("shows error message when isError is true", () => {
    vi.mocked(useProperties).mockReturnValue({ data: undefined, isLoading: false, isError: true } as any);
    render(<PropertiesTable />, { wrapper });
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});

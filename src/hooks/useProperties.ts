import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type TenancyRow = Database["public"]["Tables"]["tenancies"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export type PropertyListItem = PropertyRow & {
  assigned_pm: { full_name: string | null } | null;
  tenancies: (Pick<TenancyRow, "id" | "start_date" | "end_date" | "monthly_rent" | "status"> & {
    tenant: Pick<TenantRow, "full_name" | "phone">;
  })[];
};

async function fetchProperties(): Promise<PropertyListItem[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `id, address, city, postcode, status, assigned_pm_id, company_id, sqm, floor,
       bedrooms, bathrooms, wc, year_built, year_renovated, electricity_meter,
       water_meter, drive_photos_url, google_maps_url, furnishing_notes, created_at,
       assigned_pm:profiles!assigned_pm_id(full_name),
       tenancies(id, start_date, end_date, monthly_rent, status, tenant:tenants(full_name, phone))`
    )
    .order("address");

  if (error) throw new Error(error.message);
  return (data ?? []) as PropertyListItem[];
}

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });
}

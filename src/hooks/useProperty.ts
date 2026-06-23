import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type LandlordRow = Database["public"]["Tables"]["landlords"]["Row"];
type ManagementAgreementRow = Database["public"]["Tables"]["management_agreements"]["Row"];
type TenancyRow = Database["public"]["Tables"]["tenancies"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type CertificateRow = Database["public"]["Tables"]["certificates"]["Row"];

export type PropertyDetail = PropertyRow & {
  assigned_pm: { full_name: string | null } | null;
  landlords: LandlordRow[];
  management_agreements: ManagementAgreementRow[];
  tenancies: (TenancyRow & { tenant: TenantRow })[];
  certificates: CertificateRow[];
};

async function fetchProperty(id: string): Promise<PropertyDetail> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `*, assigned_pm:profiles!assigned_pm_id(full_name),
       landlords(*), management_agreements(*),
       tenancies(*, tenant:tenants(*)),
       certificates(*)`
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as PropertyDetail;
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });
}

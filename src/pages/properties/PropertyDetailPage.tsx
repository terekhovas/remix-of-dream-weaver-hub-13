// src/pages/properties/PropertyDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProperty, type PropertyDetail } from "@/hooks/useProperty";

// ─── helpers ──────────────────────────────────────────────────────────────────

function ordinal(floor: number): string {
  if (floor === 0) return "Ground floor";
  const suffix = [, "st", "nd", "rd"][floor] ?? "th";
  return `${floor}${suffix} floor`;
}

function certStatus(valid_until: string | null): "valid" | "expiring" | "expired" {
  if (!valid_until) return "expired";
  const now = new Date();
  const d = new Date(valid_until);
  const in60d = new Date(now);
  in60d.setDate(in60d.getDate() + 60);
  if (d < now) return "expired";
  if (d < in60d) return "expiring";
  return "valid";
}

const certBadgeClass: Record<string, string> = {
  valid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expiring: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const contractTypeLabel: Record<string, string> = {
  guaranteed_rent: "Guaranteed Rent (A1)",
  commission: "Commission (A2)",
  management_fee: "Management Fee (B)",
};

// ─── shared Row ───────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ p }: { p: PropertyDetail }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <Row
            label="Address"
            value={`${p.address}, ${p.city}${p.postcode ? ` ${p.postcode}` : ""}`}
          />
          {p.sqm != null && <Row label="Size" value={`${p.sqm} m²`} />}
          {p.floor != null && <Row label="Floor" value={ordinal(p.floor)} />}
          {p.bedrooms != null && <Row label="Bedrooms" value={`${p.bedrooms} beds`} />}
          {p.bathrooms != null && <Row label="Bathrooms" value={String(p.bathrooms)} />}
          {p.year_built != null && <Row label="Year built" value={String(p.year_built)} />}
          {p.year_renovated != null && <Row label="Renovated" value={String(p.year_renovated)} />}
          {p.electricity_meter && <Row label="Electricity meter" value={p.electricity_meter} />}
          {p.water_meter && <Row label="Water meter" value={p.water_meter} />}
          {p.furnishing_notes && <Row label="Furnishing" value={p.furnishing_notes} />}
          {p.google_maps_url && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maps</span>
              <a
                href={p.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline text-xs"
              >
                Open in Maps
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {p.certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certificates on record.</p>
          ) : (
            <div className="space-y-4">
              {p.certificates.map((cert) => {
                const status = certStatus(cert.valid_until);
                return (
                  <div key={cert.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{cert.type}</p>
                      <p className="text-xs text-muted-foreground">{cert.label}</p>
                      {cert.valid_until && (
                        <p className="text-xs text-muted-foreground">
                          Until {cert.valid_until}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${certBadgeClass[status]}`}
                      >
                        {status}
                      </span>
                      {cert.rating && (
                        <span className="text-xs text-muted-foreground">
                          Rating: {cert.rating}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Landlord tab ─────────────────────────────────────────────────────────────

function LandlordTab({ p }: { p: PropertyDetail }) {
  const landlord = p.landlords[0] ?? null;
  const agreement = p.management_agreements[0] ?? null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Landlord</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {landlord ? (
            <>
              <p className="font-semibold text-foreground">{landlord.full_name}</p>
              {landlord.email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-foreground">{landlord.email}</span>
                </p>
              )}
              {landlord.phone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-foreground">{landlord.phone}</span>
                </p>
              )}
              {landlord.legal_rep_name && (
                <div className="pt-2 border-t space-y-1">
                  <p className="text-xs text-muted-foreground">Legal Representative</p>
                  <p className="font-medium">{landlord.legal_rep_name}</p>
                  {landlord.legal_rep_phone && (
                    <p className="text-muted-foreground">{landlord.legal_rep_phone}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No landlord on record.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Management Agreement</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {agreement ? (
            <>
              <Row
                label="Type"
                value={contractTypeLabel[agreement.contract_type] ?? agreement.contract_type}
              />
              <Row label="Period" value={`${agreement.start_date} — ${agreement.end_date}`} />
              {agreement.monthly_rent_guaranteed != null && (
                <Row
                  label="Monthly guaranteed"
                  value={`€${agreement.monthly_rent_guaranteed.toLocaleString()}/mo`}
                />
              )}
              {agreement.commission_pct != null && (
                <Row label="Commission" value={`${agreement.commission_pct}%`} />
              )}
              {agreement.management_fee != null && (
                <Row
                  label="Management fee"
                  value={`€${agreement.management_fee.toLocaleString()}/mo`}
                />
              )}
              {agreement.drive_contract_url && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <a
                    href={agreement.drive_contract_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-xs"
                  >
                    View
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No management agreement on record.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tenancies tab ────────────────────────────────────────────────────────────

function TenanciesTab({ p }: { p: PropertyDetail }) {
  const active = p.tenancies.find((t) => t.status === "active") ?? null;
  const future = p.tenancies.find((t) => t.status === "future") ?? null;
  const past = p.tenancies.filter((t) => t.status === "past");
  const current = active ?? future;
  const isFuture = !active && !!future;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isFuture ? "Future Tenancy" : "Current Tenancy"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {current ? (
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{current.tenant.full_name}</p>
              {current.tenant.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {current.tenant.email}
                </p>
              )}
              {current.tenant.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {current.tenant.phone}
                </p>
              )}
              <div className="pt-2 space-y-1">
                <Row label="Rent" value={`€${current.monthly_rent.toLocaleString()}/mo`} />
                <Row label="Period" value={`${current.start_date} — ${current.end_date}`} />
                <Row label="Payment day" value={`Day ${current.rent_payment_day}`} />
                <Row label="CPI indexed" value={current.cpi_indexed ? "Yes" : "No"} />
                {current.bills_included && current.bills_included.length > 0 && (
                  <Row label="Bills included" value={current.bills_included.join(", ")} />
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No current tenant.</p>
          )}
        </CardContent>
      </Card>

      {past.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Previous Tenancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {past.map((t) => (
                <div key={t.id} className="py-3 first:pt-0 last:pb-0 text-sm space-y-0.5">
                  <p className="font-medium text-foreground">{t.tenant.full_name}</p>
                  <p className="text-muted-foreground">
                    {t.start_date} — {t.end_date}
                  </p>
                  <p className="text-muted-foreground">
                    €{t.monthly_rent.toLocaleString()}/mo
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading, isError } = useProperty(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div
          className="mx-auto max-w-5xl px-4 py-8 space-y-4"
          data-testid="property-detail-skeleton"
        >
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive">Failed to load property.</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-lg font-bold text-foreground">{property.address}</h1>
            <span className="text-sm text-muted-foreground">{property.city}</span>
            <Badge variant={property.status === "let" ? "default" : "secondary"}>
              {property.status === "let" ? "Let" : "Vacant"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="home">
          <TabsList className="mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="landlord">Landlord</TabsTrigger>
            <TabsTrigger value="tenancies">Tenancies</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <HomeTab p={property} />
          </TabsContent>
          <TabsContent value="landlord">
            <LandlordTab p={property} />
          </TabsContent>
          <TabsContent value="tenancies">
            <TenanciesTab p={property} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

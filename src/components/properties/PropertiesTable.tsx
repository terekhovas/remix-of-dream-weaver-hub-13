// src/components/properties/PropertiesTable.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useProperties, type PropertyListItem } from "@/hooks/useProperties";

function getActiveTenancy(item: PropertyListItem) {
  return (
    item.tenancies.find((t) => t.status === "active") ??
    item.tenancies.find((t) => t.status === "future") ??
    null
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PropertiesTable() {
  const { data: properties = [], isLoading, isError } = useProperties();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = properties.filter((p) =>
    `${p.address} ${p.city}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div data-testid="properties-skeleton" className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        Failed to load properties. Please refresh the page.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search address or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>PM</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Contract ends</TableHead>
            <TableHead>Rent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                No properties found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((property) => {
              const tenancy = getActiveTenancy(property);
              return (
                <TableRow
                  key={property.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">{property.address}</div>
                    <div className="text-xs text-muted-foreground">
                      {property.city}
                      {property.postcode ? `, ${property.postcode}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.status === "let" ? "default" : "secondary"}>
                      {property.status === "let" ? "Let" : "Vacant"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {property.assigned_pm?.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tenancy ? (
                      tenancy.tenant.full_name
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tenancy ? formatDate(tenancy.end_date) : "—"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {tenancy ? (
                      `€${tenancy.monthly_rent.toLocaleString()}/mo`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

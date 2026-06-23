import React, { useMemo, useState } from "react";
import { Property, getProjectGroups, ProjectGroup, ManagementAgreementType } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronRight, Building, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PayoutTabProps {
  properties: Property[];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mgmtTypeShort: Record<ManagementAgreementType, string> = {
  "sublease-guaranteed": "Sublease (Guar.)",
  "sublease-no-guarantee": "Sublease (Comm.)",
  "mgmt-collect-rent": "Mgmt / Collect",
  "mgmt-owner-collects": "Owner / Comm.",
};

function PayoutCell({ property }: { property: Property }) {
  const now = new Date();
  const currentEntry =
    property.payoutHistory?.find(
      (p) => p.year === now.getFullYear() && months.indexOf(p.month) === now.getMonth() - 1,
    ) || property.payoutHistory?.filter((p) => new Date(p.year, months.indexOf(p.month)) < now).slice(-1)[0];

  if (!currentEntry) return <span className="text-xs text-muted-foreground">—</span>;
  const cls = currentEntry.paid
    ? "bg-success/15 text-success hover:bg-success/25"
    : "bg-destructive/20 text-destructive hover:bg-destructive/30";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${cls}`}>
          €{currentEntry.payout.toLocaleString()} {currentEntry.paid ? "✓" : "✗"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-2">
        <p className="font-semibold text-foreground">
          {currentEntry.month} {currentEntry.year} — {currentEntry.paid ? "Paid to landlord" : "Outstanding"}
        </p>
        <div className="space-y-1 text-muted-foreground">
          <p>
            Collected Rent: <span className="text-foreground">€{currentEntry.collectedRent.toLocaleString()}</span>
          </p>
          <p>
            − Our Fee ({property.pmcFeePercent}%):{" "}
            <span className="text-foreground">€{currentEntry.fee.toLocaleString()}</span>
          </p>
          <p>
            = Payout: <span className="text-foreground font-semibold">€{currentEntry.payout.toLocaleString()}</span>
          </p>
          {currentEntry.paid && currentEntry.paidDate && (
            <p>
              Paid Date: <span className="text-foreground">{currentEntry.paidDate}</span>
            </p>
          )}
          {currentEntry.paid && currentEntry.paymentRef && (
            <>
              <p className="pt-1">Payment Reference:</p>
              <p className="text-foreground font-mono text-[11px] break-all">{currentEntry.paymentRef}</p>
            </>
          )}
          {!currentEntry.paid && <p className="text-destructive pt-1">Awaiting payout to landlord</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PayoutRow({ property, indented }: { property: Property; indented?: boolean }) {
  const fee = property.currentTenancy
    ? Math.round(property.currentTenancy.monthlyRent * (property.pmcFeePercent / 100))
    : 0;
  const collected = property.currentTenancy?.monthlyRent || 0;
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className={indented ? "pl-10" : ""}>
        <p className="text-sm font-medium text-foreground">{property.apartmentLabel || property.address}</p>
        <p className="text-[11px] text-muted-foreground">{property.city}</p>
      </TableCell>
      <TableCell>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">
            {property.propertyManager
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px]">
          {mgmtTypeShort[property.managementAgreement.type]}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-xs font-semibold text-foreground">{property.pmcFeePercent}%</span>
        <span className="text-[10px] text-muted-foreground ml-1">(€{fee.toLocaleString()})</span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-foreground">€{collected.toLocaleString()}</span>
      </TableCell>
      <TableCell>
        <PayoutCell property={property} />
      </TableCell>
    </TableRow>
  );
}

function ProjectRow({
  project,
  isOpen,
  onToggle,
}: {
  project: ProjectGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow className="bg-muted/40 hover:bg-muted/60 cursor-pointer" onClick={onToggle}>
      <TableCell colSpan={6}>
        <div className="flex items-center gap-2 font-bold text-foreground">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Building className="h-4 w-4 text-primary" />
          {project.name}
          <Badge variant="outline" className="ml-2 text-[10px]">
            {project.apartments.length} apts
          </Badge>
          <span className="ml-2 text-xs text-muted-foreground font-normal">{project.city}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PayoutTab({ properties }: PayoutTabProps) {
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const projectGroups = useMemo(() => getProjectGroups(properties), [properties]);
  const standalone = useMemo(
    () => properties.filter((p) => !p.projectId && p.status === "let"),
    [properties],
  );

  const matches = (p: Property) =>
    !search ||
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase());

  const filteredStandalone = standalone.filter(matches);
  const filteredProjects = projectGroups
    .map((pg) => ({ ...pg, apartments: pg.apartments.filter((a) => a.status === "let" && matches(a)) }))
    .filter((pg) => pg.apartments.length > 0);

  function toggleProject(id: string) {
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Payout</h2>
        <p className="text-sm text-muted-foreground">Track landlord payouts after deducting management fees</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Property</TableHead>
              <TableHead className="font-semibold">PM</TableHead>
              <TableHead className="font-semibold">Lease Agreement</TableHead>
              <TableHead className="font-semibold">Fee</TableHead>
              <TableHead className="font-semibold">Collected Rent</TableHead>
              <TableHead className="font-semibold">Payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((pg) => (
              <React.Fragment key={pg.id}>
                <ProjectRow
                  project={pg}
                  isOpen={openProjects.has(pg.id)}
                  onToggle={() => toggleProject(pg.id)}
                />
                {openProjects.has(pg.id) &&
                  pg.apartments.map((apt) => <PayoutRow key={apt.id} property={apt} indented />)}
              </React.Fragment>
            ))}
            {filteredStandalone.map((p) => (
              <PayoutRow key={p.id} property={p} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property, getProjectGroups, ProjectGroup, ManagementAgreementType } from "@/data/mockData";
import { PropertyDetail } from "./PropertyDetail";
import { VacantDetail } from "./VacantDetail";
import {
  Search,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Filter,
  AlertCircle,
  Building,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertiesTableProps {
  properties: Property[];
}

const pmDetails: Record<string, { email: string; phone: string; position: string }> = {
  "Γιάννης Σ.": { email: "giannis.s@propmanager.gr", phone: "6945 123 4567", position: "Senior Property Manager" },
  "Μαρία Α.": { email: "maria.a@propmanager.gr", phone: "6978 234 5678", position: "Property Manager" },
  "Νίκος Π.": { email: "nikos.p@propmanager.gr", phone: "6932 345 6789", position: "Junior Property Manager" },
  "Ελένη Κ.": { email: "eleni.k@propmanager.gr", phone: "6955 456 7890", position: "Property Manager" },
  "Κώστας Δ.": { email: "kostas.d@propmanager.gr", phone: "6910 567 8901", position: "Senior Property Manager" },
};

const mgmtTypeLabels: Record<ManagementAgreementType, string> = {
  "sublease-guaranteed": "Sublease w/ guaranteed income",
  "sublease-no-guarantee": "Sublease w/o guarantee + commission",
  "mgmt-collect-rent": "Management agreement / collect rent",
  "mgmt-owner-collects": "Owner collects rent / commission",
};

const mgmtTypeShort: Record<ManagementAgreementType, string> = {
  "sublease-guaranteed": "Sublease (Guar.)",
  "sublease-no-guarantee": "Sublease (Comm.)",
  "mgmt-collect-rent": "Mgmt / Collect",
  "mgmt-owner-collects": "Owner / Comm.",
};

function PMAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const details = pmDetails[name] || {
    email: "pm@propmanager.gr",
    phone: "6900 000 0000",
    position: "Property Manager",
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{details.position}</p>
          </div>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-foreground">{details.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span className="text-foreground">{details.phone}</span>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MgmtAgreementCell({ property }: { property: Property }) {
  const ma = property.managementAgreement;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left rounded-md px-2 py-1 text-[11px] font-medium bg-accent/10 text-accent-foreground hover:bg-accent/20 transition-colors max-w-[140px]">
          {mgmtTypeShort[ma.type]}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm space-y-2">
        <p className="font-semibold text-foreground">{mgmtTypeLabels[ma.type]}</p>
        <div className="space-y-1 text-muted-foreground">
          <p>
            Period: <span className="text-foreground">{ma.startDate} → {ma.endDate}</span>
          </p>
          <p>
            Landlord: <span className="text-foreground font-medium">{ma.landlord.name}</span>
          </p>
          <p>
            Phone: <span className="text-foreground">{ma.landlord.phone}</span>
          </p>
          <p>
            Email: <span className="text-foreground">{ma.landlord.email}</span>
          </p>
          <p>
            Address: <span className="text-foreground">{ma.landlord.address}</span>
          </p>
          {ma.guaranteedRent !== undefined && (
            <p>
              Guaranteed Rent:{" "}
              <span className="text-foreground font-semibold">€{ma.guaranteedRent.toLocaleString()}/mo</span>
            </p>
          )}
          {ma.ownerPayment !== undefined && (
            <p>
              Owner Payment:{" "}
              <span className="text-foreground font-semibold">€{ma.ownerPayment.toLocaleString()}/mo</span>
            </p>
          )}
          {ma.commissionPercent !== undefined && (
            <p>
              Commission:{" "}
              <span className="text-foreground font-semibold">{ma.commissionPercent}%</span>
            </p>
          )}
        </div>
        {ma.documentAttached && (
          <Button variant="outline" size="sm" className="gap-2 w-full mt-2">
            <FileText className="h-3 w-3" />
            View Management Agreement
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function StatusBadge({ status, onClick }: { status: "let" | "vacant"; onClick?: () => void }) {
  if (status === "vacant") {
    return (
      <button onClick={onClick} className="cursor-pointer">
        <Badge variant="destructive" className="hover:bg-destructive/80 transition-colors">
          Vacant
        </Badge>
      </button>
    );
  }
  return (
    <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">
      Let
    </Badge>
  );
}

function DepositCell({ property }: { property: Property }) {
  const isHeld = property.deposit.status === "held";
  const proofMissing = isHeld && !property.deposit.proofAttached;
  const cls = isHeld
    ? proofMissing
      ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
      : "bg-success/15 text-success hover:bg-success/25"
    : "bg-muted text-muted-foreground hover:bg-muted/80";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${cls}`}>
          {isHeld ? "Held" : "Returned"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-2">
        <p className="font-semibold text-foreground">Deposit Details</p>
        <div className="space-y-1 text-muted-foreground">
          <p>
            Amount: <span className="text-foreground font-medium">€{property.deposit.amount.toLocaleString()}</span>
          </p>
          {property.deposit.datePaid && (
            <p>
              Date Paid: <span className="text-foreground">{property.deposit.datePaid}</span>
            </p>
          )}
          {isHeld && property.deposit.heldAt && (
            <p>
              Held At: <span className="text-foreground">{property.deposit.heldAt}</span>
            </p>
          )}
          {isHeld && property.deposit.paymentRef && (
            <p>
              Payment Reference:{" "}
              <span className="text-foreground font-mono">{property.deposit.paymentRef}</span>
            </p>
          )}
          {isHeld &&
            (proofMissing ? (
              <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-destructive font-semibold">No proof attached</p>
                  <p className="text-muted-foreground">
                    Upload bank screenshot to confirm deposit is held.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2 mt-2 w-full">
                    <FileText className="h-3 w-3" />
                    Upload Proof
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="gap-2 mt-2 w-full">
                <FileText className="h-3 w-3" />
                View Proof of Deposit
              </Button>
            ))}
          {!isHeld && property.deposit.returnDetails && (
            <>
              <p>
                Return Date:{" "}
                <span className="text-foreground">{property.deposit.returnDetails.transferDate}</span>
              </p>
              <p>
                Bank Reference:{" "}
                <span className="text-foreground font-mono">{property.deposit.returnDetails.bankReference}</span>
              </p>
              <p>
                Authorized By:{" "}
                <span className="text-foreground font-medium">{property.deposit.returnDetails.authorizedBy}</span>
              </p>
              {property.deposit.returnDetails.proofAttached && (
                <Button variant="outline" size="sm" className="gap-2 mt-2 w-full">
                  <FileText className="h-3 w-3" />
                  View Bank Transfer Proof
                </Button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type KeyHolder = "tenant" | "landlord" | "agent";

function KeysCell({ property }: { property: Property }) {
  const holders: Array<{ key: KeyHolder; label: string }> = [
    { key: "tenant", label: "T" },
    { key: "landlord", label: "L" },
    { key: "agent", label: "A" },
  ];
  return (
    <div className="flex gap-1">
      {holders.map(({ key, label }) => {
        const hasKey = property.keys[key];
        const givenInfo = property.keys.givenDates.find((g) => g.holder === key);
        return (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <button
                className={`w-7 h-7 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                  hasKey
                    ? "bg-success/15 text-success hover:bg-success/25"
                    : "bg-destructive/10 text-destructive hover:bg-destructive/15"
                }`}
              >
                {label}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 text-sm space-y-1">
              <p className="font-semibold text-foreground capitalize">{key}</p>
              {hasKey && givenInfo ? (
                <div className="text-muted-foreground space-y-0.5">
                  <p>
                    Given: <span className="text-foreground">{givenInfo.date}</span>
                  </p>
                  {givenInfo.location && (
                    <p>
                      Location: <span className="text-foreground">{givenInfo.location}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No keys held</p>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

function UtilitiesCell({ property }: { property: Property }) {
  const items: Array<{ key: "electricity" | "water" | "internet"; label: string }> = [
    { key: "electricity", label: "E" },
    { key: "water", label: "W" },
    { key: "internet", label: "I" },
  ];
  return (
    <div className="flex gap-1">
      {items.map(({ key, label }) => {
        const isTransferred = property.utilities[key] === "transferred";
        const detail = property.utilityDetails.find((u) => u.type === key);
        return (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <button
                className={`w-7 h-7 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                  isTransferred
                    ? "bg-success/15 text-success hover:bg-success/25"
                    : "bg-destructive/10 text-destructive hover:bg-destructive/15"
                }`}
              >
                {label}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm space-y-2">
              <p className="font-semibold text-foreground capitalize">{key}</p>
              {detail && (
                <div className="text-muted-foreground space-y-0.5">
                  <p>
                    Provider: <span className="text-foreground">{detail.provider}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className={isTransferred ? "text-success" : "text-destructive"}>
                      {isTransferred ? "Transferred" : "Not Transferred"}
                    </span>
                  </p>
                  {key === "electricity" && detail.meterNumber && (
                    <p>
                      Electricity Meter:{" "}
                      <span className="text-foreground font-mono">{detail.meterNumber}</span>
                    </p>
                  )}
                  {key === "water" && detail.meterNumber && (
                    <p>
                      Water Meter: <span className="text-foreground font-mono">{detail.meterNumber}</span>
                    </p>
                  )}
                  {key === "internet" && (
                    <>
                      {detail.landlineNumber && (
                        <p>
                          Landline:{" "}
                          <span className="text-foreground font-mono">{detail.landlineNumber}</span>
                        </p>
                      )}
                      {detail.internetNumber && (
                        <p>
                          Internet #:{" "}
                          <span className="text-foreground font-mono">{detail.internetNumber}</span>
                        </p>
                      )}
                    </>
                  )}
                  {detail.transferDate && (
                    <p>
                      Transfer Date: <span className="text-foreground">{detail.transferDate}</span>
                    </p>
                  )}
                  <p>
                    Last Bill: <span className="text-foreground">{detail.lastBillDate}</span>
                  </p>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

function ServiceChargesCell({ property }: { property: Property }) {
  const sc = property.serviceCharges;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const colorClass =
    sc.status === "paid"
      ? "bg-success/15 text-success hover:bg-success/25"
      : sc.status === "outstanding"
        ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
        : "bg-muted text-muted-foreground hover:bg-muted/80";
  const label = sc.status === "n/a" ? "N/A" : sc.status === "paid" ? "Paid" : "Outstanding";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${colorClass}`}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Service Charges</p>
          <span className="text-xs text-muted-foreground font-medium">{currentYear}</span>
        </div>
        {sc.status === "n/a" ? (
          <p className="text-muted-foreground">Not applicable for this property</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              Annual:{" "}
              <span className="text-foreground font-medium">€{sc.annualAmount.toLocaleString()}</span>
            </p>
            {sc.buildingManager && (
              <div className="p-2 rounded bg-muted/40 border border-border/50 space-y-0.5">
                <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Building className="h-3 w-3" />
                  Building Manager
                </p>
                <p className="text-xs text-muted-foreground">{sc.buildingManager.name}</p>
                <p className="text-xs text-muted-foreground">{sc.buildingManager.phone}</p>
                <p className="text-xs text-muted-foreground">{sc.buildingManager.email}</p>
              </div>
            )}
            <div className="grid grid-cols-6 gap-1">
              {sc.payments.map((p, idx) => {
                const isFuture = idx > currentMonth;
                let cellClass = "bg-muted/30 text-muted-foreground/40";
                if (!isFuture) cellClass = p.paid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive";
                const cell = (
                  <div
                    className={`text-center rounded px-1 py-0.5 text-[10px] font-medium ${cellClass} ${p.paid ? "cursor-pointer hover:opacity-80" : ""}`}
                  >
                    {p.month}
                  </div>
                );
                if (p.paid && !isFuture) {
                  return (
                    <Popover key={p.month}>
                      <PopoverTrigger asChild>
                        <button>{cell}</button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 text-xs space-y-2">
                        <p className="font-semibold text-foreground">
                          {p.month} {currentYear} — Paid
                        </p>
                        {p.proofAttached ? (
                          <Button variant="outline" size="sm" className="gap-2 w-full">
                            <FileText className="h-3 w-3" />
                            View Bill / Proof
                          </Button>
                        ) : (
                          <p className="text-destructive">No proof uploaded yet</p>
                        )}
                      </PopoverContent>
                    </Popover>
                  );
                }
                return <div key={p.month}>{cell}</div>;
              })}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function PaymentLight({ status }: { status?: "green" | "yellow" | "red" }) {
  if (!status) return null;
  const cls =
    status === "green" ? "bg-success" : status === "yellow" ? "bg-warning" : "bg-destructive";
  const label =
    status === "green" ? "On time" : status === "yellow" ? "Occasional delays" : "Frequent late payments";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} title={label} />;
}

interface RowProps {
  property: Property;
  indented?: boolean;
  onSelect: (p: Property) => void;
  onVacantSelect: (p: Property) => void;
}

function PropertyRow({ property, indented, onSelect, onVacantSelect }: RowProps) {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <button
          onClick={() => onSelect(property)}
          className={`text-left text-primary hover:text-primary/80 hover:underline font-medium transition-colors ${indented ? "pl-8" : ""}`}
        >
          <span className="flex items-center gap-2">
            {property.apartmentLabel || property.address}
            <PaymentLight status={property.paymentPunctuality} />
          </span>
          <span className="text-xs text-muted-foreground">
            {property.city}, {property.postcode}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <PMAvatar name={property.propertyManager} />
      </TableCell>
      <TableCell>
        <MgmtAgreementCell property={property} />
      </TableCell>
      <TableCell>
        <StatusBadge
          status={property.status}
          onClick={property.status === "vacant" ? () => onVacantSelect(property) : undefined}
        />
      </TableCell>
      <TableCell>
        <DepositCell property={property} />
      </TableCell>
      <TableCell>
        <KeysCell property={property} />
      </TableCell>
      <TableCell>
        <UtilitiesCell property={property} />
      </TableCell>
      <TableCell>
        <ServiceChargesCell property={property} />
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
  const letCount = project.apartments.filter((a) => a.status === "let").length;
  return (
    <TableRow className="bg-muted/40 hover:bg-muted/60 cursor-pointer" onClick={onToggle}>
      <TableCell>
        <div className="flex items-center gap-2 font-bold text-foreground">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Building className="h-4 w-4 text-primary" />
          {project.name}
          <Badge variant="outline" className="ml-2 text-[10px]">
            {project.apartments.length} apts • {letCount} let
          </Badge>
        </div>
      </TableCell>
      <TableCell colSpan={7} className="text-xs text-muted-foreground">
        {project.city} • Click to {isOpen ? "collapse" : "expand"}
      </TableCell>
    </TableRow>
  );
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [vacantProperty, setVacantProperty] = useState<Property | null>(null);
  const [search, setSearch] = useState("");
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());
  const [pmFilter, setPmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [depositFilter, setDepositFilter] = useState<string>("all");
  const [mgmtFilter, setMgmtFilter] = useState<string>("all");

  const projectGroups = useMemo(() => getProjectGroups(properties), [properties]);
  const standalone = useMemo(() => properties.filter((p) => !p.projectId), [properties]);

  function passesFilters(p: Property): boolean {
    if (search) {
      const s = search.toLowerCase();
      if (
        !p.address.toLowerCase().includes(s) &&
        !p.city.toLowerCase().includes(s) &&
        !p.postcode.toLowerCase().includes(s)
      )
        return false;
    }
    if (pmFilter !== "all" && p.propertyManager !== pmFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (depositFilter !== "all" && p.deposit.status !== depositFilter) return false;
    if (mgmtFilter !== "all" && p.managementAgreement.type !== mgmtFilter) return false;
    return true;
  }

  const filteredStandalone = standalone.filter(passesFilters);
  const filteredProjects = projectGroups
    .map((pg) => ({ ...pg, apartments: pg.apartments.filter(passesFilters) }))
    .filter((pg) => pg.apartments.length > 0);

  const allPmNames = useMemo(
    () => Array.from(new Set(properties.map((p) => p.propertyManager))).sort(),
    [properties],
  );

  if (vacantProperty) return <VacantDetail property={vacantProperty} onBack={() => setVacantProperty(null)} />;
  if (selectedProperty) return <PropertyDetail property={selectedProperty} onBack={() => setSelectedProperty(null)} />;

  function toggleProject(id: string) {
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalShown =
    filteredStandalone.length + filteredProjects.reduce((s, pg) => s + pg.apartments.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={pmFilter} onValueChange={setPmFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PMs</SelectItem>
              {allPmNames.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="let">Let</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>
          <Select value={depositFilter} onValueChange={setDepositFilter}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Deposit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deposits</SelectItem>
              <SelectItem value="held">Held</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={mgmtFilter} onValueChange={setMgmtFilter}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Mgmt agreement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agreements</SelectItem>
              {(Object.keys(mgmtTypeLabels) as ManagementAgreementType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {mgmtTypeShort[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Property</TableHead>
              <TableHead className="font-semibold">PM</TableHead>
              <TableHead className="font-semibold">Mgmt Agreement</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Deposit</TableHead>
              <TableHead className="font-semibold">Keys</TableHead>
              <TableHead className="font-semibold">Utilities</TableHead>
              <TableHead className="font-semibold">Service Charges</TableHead>
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
                  pg.apartments.map((apt) => (
                    <PropertyRow
                      key={apt.id}
                      property={apt}
                      indented
                      onSelect={setSelectedProperty}
                      onVacantSelect={setVacantProperty}
                    />
                  ))}
              </React.Fragment>
            ))}
            {filteredStandalone.map((p) => (
              <PropertyRow
                key={p.id}
                property={p}
                onSelect={setSelectedProperty}
                onVacantSelect={setVacantProperty}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {totalShown} of {properties.length} properties • {filteredProjects.length} project
        {filteredProjects.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}

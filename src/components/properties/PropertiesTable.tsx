import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/data/mockData";
import { PropertyDetail } from "./PropertyDetail";
import { VacantDetail } from "./VacantDetail";
import { Search, FileText, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PropertiesTableProps {
  properties: Property[];
}

const pmDetails: Record<string, { email: string; phone: string; position: string; photo?: string }> = {
  "Γιάννης Σ.": { email: "giannis.s@propmanager.gr", phone: "6945 123 4567", position: "Senior Property Manager" },
  "Μαρία Α.": { email: "maria.a@propmanager.gr", phone: "6978 234 5678", position: "Property Manager" },
  "Νίκος Π.": { email: "nikos.p@propmanager.gr", phone: "6932 345 6789", position: "Junior Property Manager" },
  "Ελένη Κ.": { email: "eleni.k@propmanager.gr", phone: "6955 456 7890", position: "Property Manager" },
  "Κώστας Δ.": { email: "kostas.d@propmanager.gr", phone: "6910 567 8901", position: "Senior Property Manager" },
};

function PMAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const details = pmDetails[name] || { email: "pm@propmanager.gr", phone: "6900 000 0000", position: "Property Manager" };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
              {initials}
            </AvatarFallback>
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

function StatusBadge({ status, onClick }: { status: "let" | "vacant"; onClick?: () => void }) {
  if (status === "vacant") {
    return (
      <button onClick={onClick} className="cursor-pointer">
        <Badge variant="destructive" className="hover:bg-destructive/80 transition-colors">Vacant</Badge>
      </button>
    );
  }
  return <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Let</Badge>;
}

function DepositCell({ property }: { property: Property }) {
  const isHeld = property.deposit.status === "held";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${isHeld ? "bg-success/15 text-success hover:bg-success/25" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          {isHeld ? "Held" : "Returned"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-2">
        <p className="font-semibold text-foreground">Deposit Details</p>
        <div className="space-y-1 text-muted-foreground">
          <p>Amount: <span className="text-foreground font-medium">€{property.deposit.amount.toLocaleString()}</span></p>
          {property.deposit.datePaid && <p>Date Paid: <span className="text-foreground">{property.deposit.datePaid}</span></p>}
          {isHeld && property.deposit.heldAt && <p>Held At: <span className="text-foreground">{property.deposit.heldAt}</span></p>}
          {isHeld && property.deposit.schemeRef && <p>Scheme Ref: <span className="text-foreground font-mono">{property.deposit.schemeRef}</span></p>}
          {!isHeld && property.deposit.returnDetails && (
            <>
              <p>Return Date: <span className="text-foreground">{property.deposit.returnDetails.transferDate}</span></p>
              <p>Bank Reference: <span className="text-foreground font-mono">{property.deposit.returnDetails.bankReference}</span></p>
              <p>Authorized By: <span className="text-foreground font-medium">{property.deposit.returnDetails.authorizedBy}</span></p>
              {property.deposit.returnDetails.proofAttached && (
                <Button variant="outline" size="sm" className="gap-2 mt-2 w-full">
                  <FileText className="h-3 w-3" />View Bank Transfer Proof
                </Button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KeysCell({ property }: { property: Property }) {
  const holders: Array<{ key: "tenant" | "landlord" | "agent"; label: string }> = [
    { key: "tenant", label: "T" }, { key: "landlord", label: "L" }, { key: "agent", label: "A" },
  ];
  return (
    <div className="flex gap-1">
      {holders.map(({ key, label }) => {
        const hasKey = property.keys[key];
        const givenInfo = property.keys.givenDates.find(g => g.holder === key);
        return (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <button className={`w-7 h-7 rounded-md text-xs font-bold cursor-pointer transition-colors ${hasKey ? "bg-success/15 text-success hover:bg-success/25" : "bg-destructive/10 text-destructive hover:bg-destructive/15"}`}>{label}</button>
            </PopoverTrigger>
            <PopoverContent className="w-52 text-sm space-y-1">
              <p className="font-semibold text-foreground capitalize">{key}</p>
              {hasKey && givenInfo ? (
                <div className="text-muted-foreground space-y-0.5">
                  <p>Given: <span className="text-foreground">{givenInfo.date}</span></p>
                  {givenInfo.location && <p>Location: <span className="text-foreground">{givenInfo.location}</span></p>}
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
  const items: Array<{ key: "electricity" | "water"; label: string }> = [
    { key: "electricity", label: "E" }, { key: "water", label: "W" },
  ];
  return (
    <div className="flex gap-1">
      {items.map(({ key, label }) => {
        const isTransferred = property.utilities[key] === "transferred";
        const detail = property.utilityDetails.find(u => u.type === key);
        return (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <button className={`w-7 h-7 rounded-md text-xs font-bold cursor-pointer transition-colors ${isTransferred ? "bg-success/15 text-success hover:bg-success/25" : "bg-destructive/10 text-destructive hover:bg-destructive/15"}`}>{label}</button>
            </PopoverTrigger>
            <PopoverContent className="w-60 text-sm space-y-2">
              <p className="font-semibold text-foreground capitalize">{key}</p>
              {detail && (
                <div className="text-muted-foreground space-y-0.5">
                  <p>Provider: <span className="text-foreground">{detail.provider}</span></p>
                  <p>Status: <span className={isTransferred ? "text-success" : "text-destructive"}>{isTransferred ? "Transferred" : "Not Transferred"}</span></p>
                  {detail.transferDate && <p>Transfer Date: <span className="text-foreground">{detail.transferDate}</span></p>}
                  <p>Last Bill: <span className="text-foreground">{detail.lastBillDate}</span></p>
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
  const colorClass = sc.status === "paid"
    ? "bg-success/15 text-success hover:bg-success/25"
    : sc.status === "outstanding"
    ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
    : "bg-muted text-muted-foreground hover:bg-muted/80";
  const label = sc.status === "n/a" ? "N/A" : sc.status === "paid" ? "Paid" : "Outstanding";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${colorClass}`}>{label}</button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Service Charges</p>
          <span className="text-xs text-muted-foreground font-medium">{currentYear}</span>
        </div>
        {sc.status === "n/a" ? (
          <p className="text-muted-foreground">Not applicable for this property</p>
        ) : (
          <>
            <p className="text-muted-foreground">Annual: <span className="text-foreground font-medium">€{sc.annualAmount.toLocaleString()}</span></p>
            <div className="grid grid-cols-6 gap-1">
              {sc.payments.map((p, idx) => {
                const isFuture = idx > currentMonth;
                let cellClass = "bg-muted/30 text-muted-foreground/40"; // future: white/neutral
                if (!isFuture) {
                  cellClass = p.paid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive";
                }
                return (
                  <div key={p.month} className={`text-center rounded px-1 py-0.5 text-[10px] font-medium ${cellClass}`}>{p.month}</div>
                );
              })}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [vacantProperty, setVacantProperty] = useState<Property | null>(null);
  const [search, setSearch] = useState("");

  const filtered = properties.filter(p =>
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.postcode.toLowerCase().includes(search.toLowerCase())
  );

  if (vacantProperty) return <VacantDetail property={vacantProperty} onBack={() => setVacantProperty(null)} />;
  if (selectedProperty) return <PropertyDetail property={selectedProperty} onBack={() => setSelectedProperty(null)} />;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Property</TableHead>
              <TableHead className="font-semibold">PM</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Deposit</TableHead>
              <TableHead className="font-semibold">Keys</TableHead>
              <TableHead className="font-semibold">Utilities</TableHead>
              <TableHead className="font-semibold">Service Charges</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((property) => (
              <TableRow key={property.id} className="hover:bg-muted/30">
                <TableCell>
                  <button onClick={() => setSelectedProperty(property)} className="text-left text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                    <span className="block">{property.address}</span>
                    <span className="text-xs text-muted-foreground">{property.city}, {property.postcode}</span>
                  </button>
                </TableCell>
                <TableCell>
                  <PMAvatar name={property.propertyManager} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={property.status} onClick={property.status === "vacant" ? () => setVacantProperty(property) : undefined} />
                </TableCell>
                <TableCell><DepositCell property={property} /></TableCell>
                <TableCell><KeysCell property={property} /></TableCell>
                <TableCell><UtilitiesCell property={property} /></TableCell>
                <TableCell><ServiceChargesCell property={property} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {properties.length} properties</p>
    </div>
  );
}

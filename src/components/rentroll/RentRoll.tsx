import { Property } from "@/data/mockData";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RentRollProps {
  properties: Property[];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function RentRoll({ properties }: RentRollProps) {
  const letProperties = properties.filter(p => p.status === "let").slice(0, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const years = [2024, 2025, 2026];

  function getCpiMonth(property: Property): number {
    if (property.currentTenancy) {
      const start = new Date(property.currentTenancy.startDate);
      return start.getMonth();
    }
    return 0;
  }

  function getRentForMonth(property: Property, year: number, mIdx: number): number {
    const entry = property.rentHistory.find(r => r.month === months[mIdx] && r.year === year);
    if (entry) return entry.amount;
    const baseRent = property.currentTenancy?.monthlyRent || 1000;
    const cpiMonth = getCpiMonth(property);
    let anniversaries = 0;
    for (let y = 2024; y <= year; y++) {
      for (let m = 0; m < (y === year ? mIdx + 1 : 12); m++) {
        if (y === 2024 && m <= cpiMonth) continue;
        if (m === cpiMonth && !(y === 2024)) anniversaries++;
      }
    }
    return Math.round(baseRent * Math.pow(1.02, anniversaries));
  }

  function isCpiChangeMonth(property: Property, year: number, mIdx: number): boolean {
    if (year === 2024) return false;
    const cpiMonth = getCpiMonth(property);
    return mIdx === cpiMonth;
  }

  function getPaymentReference(property: Property): string {
    const tenant = property.currentTenancy?.tenant;
    if (!tenant) return "N/A";
    const initials = tenant.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const refNum = property.id.replace("prop-", "");
    return `${refNum}${initials}`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Rent Roll</h2>
        <p className="text-sm text-muted-foreground">Monthly rent collection overview with CPI indexation</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {letProperties.length} let properties • <span className="text-success">Green = Paid</span> • <span className="text-destructive">Red = Unpaid</span> • No color = Future
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[1400px]">
            {/* Header */}
            <div className="flex bg-muted/50 border-b border-border sticky top-0 z-10">
              <div className="w-52 shrink-0 p-3 font-semibold text-sm text-foreground border-r border-border sticky left-0 z-20 bg-muted/50">
                Property
              </div>
              <div className="flex">
                {years.map((year) => (
                  <div key={year} className="border-r border-border last:border-r-0">
                    <div className="text-center text-xs font-bold text-foreground py-1 border-b border-border/50 bg-muted/70">
                      {year}
                    </div>
                    <div className="flex">
                      {months.map((month) => (
                        <div key={`${year}-${month}`} className="w-[72px] text-center text-[10px] font-medium text-muted-foreground py-1.5">
                          {month}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {letProperties.map((property) => (
              <div key={property.id} className="flex border-b border-border/50 hover:bg-muted/20 transition-colors">
                <div className="w-52 shrink-0 p-2.5 border-r border-border sticky left-0 z-10 bg-background">
                  <p className="text-xs font-medium text-foreground truncate">{property.address}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{property.city}</p>
                </div>
                <div className="flex">
                  {years.map((year) => (
                    <div key={year} className="flex border-r border-border/30 last:border-r-0">
                      {months.map((month, mIdx) => {
                        const rentEntry = property.rentHistory.find(r => r.month === month && r.year === year);
                        const isFuture = year > currentYear || (year === currentYear && mIdx > currentMonth);
                        const isPaid = rentEntry?.paid;
                        const amount = rentEntry?.amount || getRentForMonth(property, year, mIdx);
                        const cpiChange = isCpiChangeMonth(property, year, mIdx);
                        const baseRef = getPaymentReference(property);
                        const paymentRef = `${baseRef}-${month}${String(year).slice(2)}`;

                        let cellClass = "bg-transparent";
                        let textClass = "text-muted-foreground/30";

                        if (!isFuture) {
                          if (isPaid) {
                            cellClass = "bg-success/12";
                            textClass = "text-success";
                          } else {
                            cellClass = "bg-destructive";
                            textClass = "text-destructive-foreground";
                          }
                        }

                        const cellContent = (
                          <div
                            className={`w-[72px] text-center py-2 text-[10px] font-medium ${cellClass} ${textClass} ${cpiChange ? "ring-1 ring-inset ring-primary/30" : ""}`}
                            title={`${month} ${year}: €${amount.toLocaleString()}${isPaid ? " (Paid)" : isFuture ? "" : " (Unpaid)"}${cpiChange ? " — CPI indexed" : ""}`}
                          >
                            <span className="block">€{amount.toLocaleString()}</span>
                            {cpiChange && (
                              <span className="block text-[8px] font-bold" style={{ color: isPaid ? undefined : "inherit" }}>CPI ↑</span>
                            )}
                          </div>
                        );

                        if (isPaid && !isFuture) {
                          return (
                            <Popover key={`${year}-${month}`}>
                              <PopoverTrigger asChild>
                                <button className="cursor-pointer">
                                  {cellContent}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 text-sm space-y-2">
                                <p className="font-semibold text-foreground">{month} {year} — Paid</p>
                                <div className="space-y-1 text-muted-foreground">
                                  <p>Amount: <span className="text-foreground font-medium">€{amount.toLocaleString()}</span></p>
                                  <p>Reference: <span className="text-foreground font-mono text-xs">{paymentRef}</span></p>
                                  <p>Tenant: <span className="text-foreground">{property.currentTenancy?.tenant.name}</span></p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        }

                        return <div key={`${year}-${month}`}>{cellContent}</div>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

import { Property } from "@/data/mockData";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OccupancyChartProps {
  properties: Property[];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function OccupancyChart({ properties }: OccupancyChartProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const years = [2024, 2025, 2026, 2027];

  const displayProperties = properties.slice(0, 15);

  function getOccupancyForMonth(property: Property, year: number, mIdx: number) {
    return property.occupancy.find(o => o.month === months[mIdx] && o.year === year);
  }

  function isFutureMonth(year: number, mIdx: number) {
    return year > currentYear || (year === currentYear && mIdx > currentMonth);
  }

  function isCurrentMonth(year: number, mIdx: number) {
    return year === currentYear && mIdx === currentMonth;
  }

  function isMonthInRange(year: number, mIdx: number, startDate: string, endDate: string) {
    const monthStart = new Date(year, mIdx, 1);
    const monthEnd = new Date(year, mIdx + 1, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return monthStart <= end && monthEnd >= start;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Occupancy</h2>
        <p className="text-sm text-muted-foreground">Property occupancy timeline — green = occupied, white = vacant/future</p>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-sm bg-success/80 mr-1 align-middle" /> Occupied (past)
        <span className="inline-block w-3 h-3 rounded-sm bg-success/30 mr-1 ml-3 align-middle" /> Occupied (future)
        <span className="inline-block w-3 h-3 rounded-sm border border-border mr-1 ml-3 align-middle" /> Vacant / Future
        <span className="inline-block w-3 h-1.5 rounded-sm mr-1 ml-3 align-middle" style={{ backgroundColor: "hsl(30, 90%, 70%)" }} /> Management Agreement
        <span className="ml-3 text-muted-foreground">Showing {displayProperties.length} properties</span>
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[1800px]">
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
                        <div key={`${year}-${month}`} className="w-[60px] text-center text-[10px] font-medium text-muted-foreground py-1.5 border-r border-border/30 last:border-r-0">
                          {month}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {displayProperties.map((property) => {
              const mgmtStart = property.managementAgreement.startDate;
              const mgmtEnd = property.managementAgreement.endDate;

              return (
                <div key={property.id} className="flex border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <div className="w-52 shrink-0 p-2.5 border-r border-border sticky left-0 z-10 bg-background">
                    <p className="text-xs font-medium text-foreground truncate">{property.address}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{property.city}</p>
                  </div>
                  <div className="flex">
                    {years.map((year) => (
                      <div key={year} className="flex border-r border-border/30 last:border-r-0">
                        {months.map((month, mIdx) => {
                          const entry = getOccupancyForMonth(property, year, mIdx);
                          const occupied = entry?.occupied || false;
                          const future = isFutureMonth(year, mIdx);
                          const current = isCurrentMonth(year, mIdx);
                          const inMgmtRange = isMonthInRange(year, mIdx, mgmtStart, mgmtEnd);

                          // Check for tenancy start this month
                          const hasNewTenancyStart = entry?.tenancyStart && (() => {
                            const startDate = new Date(entry.tenancyStart!);
                            return startDate.getMonth() === mIdx && startDate.getFullYear() === year;
                          })();

                          const startDay = hasNewTenancyStart ? new Date(entry!.tenancyStart!).getDate() : null;
                          const startPercent = startDay ? Math.min((startDay / 30) * 100, 95) : 0;

                          // Determine cell colors - vacant/future = transparent (white)
                          let leftBg = "";
                          let rightBg = "";

                          if (hasNewTenancyStart && occupied) {
                            leftBg = "";
                            rightBg = future ? "bg-success/20" : "bg-success/50";
                          } else if (occupied) {
                            const bg = future ? "bg-success/20" : "bg-success/50";
                            leftBg = bg;
                            rightBg = bg;
                          }

                          return (
                            <Popover key={`${year}-${month}`}>
                              <PopoverTrigger asChild>
                                <button
                                  className={`w-[60px] h-12 relative cursor-pointer transition-colors hover:opacity-80 border-r border-border last:border-r-0 ${current ? "ring-1 ring-inset ring-primary/40" : ""}`}
                                  title={`${month} ${year}: ${occupied ? "Occupied" : "Vacant"}${inMgmtRange ? " | Mgmt Agreement Active" : ""}`}
                                >
                                  {/* Occupancy fill - top portion */}
                                  {hasNewTenancyStart ? (
                                    <>
                                      <div className={`absolute top-0 left-0 bottom-2 ${leftBg}`} style={{ width: `${startPercent}%` }} />
                                      <div className={`absolute top-0 bottom-2 right-0 ${rightBg}`} style={{ left: `${startPercent}%` }} />
                                      <div
                                        className="absolute top-0 bottom-2 w-0.5 bg-primary z-[1]"
                                        style={{ left: `${startPercent}%` }}
                                      />
                                      <span className="absolute bottom-2.5 text-[7px] font-bold text-primary left-1 z-[1]">
                                        {startDay}/{String(mIdx + 1).padStart(2, "0")}
                                      </span>
                                    </>
                                  ) : (
                                    <div className={`absolute top-0 left-0 right-0 bottom-2 ${leftBg}`} />
                                  )}

                                  {/* Management agreement bar - bottom strip, no rounding, extends edge-to-edge */}
                                  {inMgmtRange && (
                                    <div
                                      className="absolute bottom-0 -left-px -right-px h-2"
                                      style={{ backgroundColor: "hsl(30, 90%, 70%)" }}
                                    />
                                  )}
                                </button>
                              </PopoverTrigger>
                              {entry?.tenantName && (
                                <PopoverContent className="w-64 text-sm space-y-2">
                                  <p className="font-semibold text-foreground">{entry.tenantName}</p>
                                  <div className="space-y-0.5 text-muted-foreground">
                                    {entry.tenancyStart && <p>Tenancy: <span className="text-foreground">{entry.tenancyStart} — {entry.tenancyEnd}</span></p>}
                                    {entry.monthlyRent && <p>Rent: <span className="text-foreground font-medium">€{entry.monthlyRent.toLocaleString()}/mo</span></p>}
                                  </div>
                                  <div className="pt-1 border-t border-border">
                                    <p className="text-[11px] text-muted-foreground">
                                      Mgmt Agreement: <span className="text-foreground">{mgmtStart} — {mgmtEnd}</span>
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm" className="gap-2 w-full">
                                    <FileText className="h-3 w-3" />
                                    View Tenancy Agreement
                                  </Button>
                                </PopoverContent>
                              )}
                            </Popover>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

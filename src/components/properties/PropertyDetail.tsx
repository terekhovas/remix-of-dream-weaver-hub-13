import { useState } from "react";
import { ArrowLeft, FileText, MessageCircle, Shield, Zap, TrendingUp, Send, Wrench, ClipboardCheck, Receipt, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Property, CertificateStatus } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
}

function certStatusColor(status: CertificateStatus) {
  if (status === "valid") return "bg-success/15 text-success";
  if (status === "expiring") return "bg-warning/15 text-warning";
  return "bg-destructive/10 text-destructive";
}

const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function TenantDetailsTab({ property }: { property: Property }) {
  const current = property.currentTenancy;
  const future = property.futureTenancy;
  const activeTenancy = current || future;
  const isFuture = !current && !!future;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{isFuture ? "Future Tenancy" : "Current Tenancy"}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTenancy ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{activeTenancy.tenant.name}</p>
                <p className="text-muted-foreground">{activeTenancy.tenant.email}</p>
                <p className="text-muted-foreground">{activeTenancy.tenant.phone}</p>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p>Rent: <span className="text-foreground font-medium">€{activeTenancy.monthlyRent.toLocaleString()}/mo</span></p>
                <p>Period: <span className="text-foreground">{activeTenancy.startDate} — {activeTenancy.endDate}</span></p>
                <p>CPI Indexed: <span className="text-foreground">{activeTenancy.cpiIndexed ? "Yes" : "No"}</span></p>
              </div>
              <div className="flex flex-col gap-2">
                {isFuture ? (
                  <Button variant="default" size="sm" className="gap-2 bg-primary">
                    <Send className="h-3.5 w-3.5" />
                    Send Tenancy Agreement via DocuSign
                  </Button>
                ) : (
                  <>
                    {activeTenancy.agreementAttached && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        View Tenancy Agreement
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      View Check-In Report
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No current tenant</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Previous Tenancies</CardTitle>
        </CardHeader>
        <CardContent>
          {property.previousTenancies.length > 0 ? (
            <div className="space-y-3">
              {property.previousTenancies.map((tenancy, i) => (
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <button className="w-full text-left p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                      <p className="font-medium text-sm text-primary">{tenancy.tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenancy.startDate} — {tenancy.endDate}</p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-sm space-y-2">
                    <p className="font-semibold">{tenancy.tenant.name}</p>
                    <div className="space-y-0.5 text-muted-foreground">
                      <p>{tenancy.tenant.email}</p>
                      <p>{tenancy.tenant.phone}</p>
                      <p>Rent: <span className="text-foreground">€{tenancy.monthlyRent.toLocaleString()}/mo</span></p>
                      <p>CPI Indexed: <span className="text-foreground">{tenancy.cpiIndexed ? "Yes" : "No"}</span></p>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <FileText className="h-3 w-3" />View Tenancy Agreement
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <ClipboardCheck className="h-3 w-3" />Check-In Report
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <ClipboardCheck className="h-3 w-3" />Check-Out Report
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <Receipt className="h-3 w-3" />Deposit Release
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No previous tenancies</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CertificatesTab({ property }: { property: Property }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {property.certificates.map((cert) => (
        <Card key={cert.type} className={`border-l-4 ${cert.status === "valid" ? "border-l-success" : cert.status === "expiring" ? "border-l-warning" : "border-l-destructive"}`}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{cert.type}</p>
                <p className="text-[10px] text-muted-foreground">{cert.label}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${certStatusColor(cert.status)}`}>
                {cert.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Valid Until: <span className="text-foreground">{cert.validUntil}</span></p>
              {cert.rating && <p>Rating: <span className="text-foreground font-semibold">{cert.rating}</span></p>}
            </div>
            {cert.attachmentName && (
              <Button variant="outline" size="sm" className="gap-2 text-xs h-7">
                <FileText className="h-3 w-3" />
                {cert.attachmentName}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UtilitiesTab({ property }: { property: Property }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {property.utilityDetails.map((utility) => {
        const isTransferred = utility.transferStatus === "transferred";
        return (
          <Card key={utility.type} className={`border-l-4 ${isTransferred ? "border-l-success" : "border-l-destructive"}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm capitalize">{utility.type}</p>
                <Badge variant={isTransferred ? "default" : "destructive"} className={isTransferred ? "bg-success text-success-foreground" : ""}>
                  {isTransferred ? "Transferred" : "Not Transferred"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>Provider: <span className="text-foreground">{utility.provider}</span></p>
                {utility.transferDate && <p>Transfer Date: <span className="text-foreground">{utility.transferDate}</span></p>}
                <p>Last Bill: <span className="text-foreground">{utility.lastBillDate}</span></p>
              </div>
              {utility.transferProofAttached && (
                <Button variant="outline" size="sm" className="gap-2 text-xs h-7">
                  <FileText className="h-3 w-3" />
                  View Transfer Proof
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CommunicationTab({ property }: { property: Property }) {
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const typeIcons: Record<string, string> = {
    whatsapp: "💬", phone: "📞", email: "✉️", "in-person": "🤝", maintenance: "🔧",
  };

  const logs = property.communicationLogs;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Left: Communication Log */}
      <div className="space-y-4">
        {property.currentTenancy && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{property.currentTenancy.tenant.name}</p>
                  <p className="text-xs text-muted-foreground">Current Tenant</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <Phone className="h-3.5 w-3.5" />Call
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <Mail className="h-3.5 w-3.5" />Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Communication Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedLog(i)}
                  className="w-full text-left flex gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-lg">{typeIcons[log.type] || "📝"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{log.summary}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{log.date}</span>
                      <span className="text-[10px] text-muted-foreground">• {log.author}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{log.type}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication log detail dialog */}
        <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
          {selectedLog !== null && logs[selectedLog] && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{typeIcons[logs[selectedLog].type] || "📝"}</span>
                  Communication Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{logs[selectedLog].date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <Badge variant="outline" className="capitalize mt-0.5">{logs[selectedLog].type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Author</p>
                    <p className="font-medium text-foreground">{logs[selectedLog].author}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Issue / Subject</p>
                  <p className="text-foreground font-medium">{logs[selectedLog].summary}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{logs[selectedLog].description || "Tenant was contacted regarding the above issue. Situation discussed in detail and next steps agreed upon."}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Agreed Future Steps</p>
                  <p className="text-foreground">{logs[selectedLog].agreedSteps || "Follow up within 7 days to confirm resolution. Tenant to provide update if issue persists."}</p>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Right: WhatsApp chat */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="pb-2 border-b border-border bg-[hsl(142,71%,45%)]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[hsl(142,71%,45%)] flex items-center justify-center text-white font-bold text-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">{property.currentTenancy?.tenant.name || "Tenant"}</CardTitle>
              <p className="text-[10px] text-muted-foreground">WhatsApp • Online</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
          {/* Sample chat messages */}
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg rounded-tl-none px-3 py-1.5 max-w-[80%] text-xs">
              <p>Γεια σας, θα ήθελα να αναφέρω ένα πρόβλημα με τον θερμοσίφωνα.</p>
              <p className="text-[9px] text-muted-foreground mt-1">10:32 AM</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[hsl(142,71%,45%)]/15 border border-[hsl(142,71%,45%)]/20 rounded-lg rounded-tr-none px-3 py-1.5 max-w-[80%] text-xs">
              <p>Καλημέρα! Θα στείλουμε τεχνικό αύριο πρωί. Σας κάνει;</p>
              <p className="text-[9px] text-muted-foreground mt-1">10:45 AM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg rounded-tl-none px-3 py-1.5 max-w-[80%] text-xs">
              <p>Ναι, τέλεια! Ευχαριστώ πολύ.</p>
              <p className="text-[9px] text-muted-foreground mt-1">10:47 AM</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[hsl(142,71%,45%)]/15 border border-[hsl(142,71%,45%)]/20 rounded-lg rounded-tr-none px-3 py-1.5 max-w-[80%] text-xs">
              <p>Ωραία, θα σας ενημερώσουμε. Καλή σας μέρα!</p>
              <p className="text-[9px] text-muted-foreground mt-1">10:48 AM</p>
            </div>
          </div>
        </CardContent>
        <div className="p-2 border-t border-border flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" className="rounded-full h-8 w-8 p-0 bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)]">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InvestmentTab({ property }: { property: Property }) {
  const inv = property.investment;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acquisition & Capital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-1 text-muted-foreground">
            <p>Purchase Price: <span className="text-foreground font-medium">€{inv.purchasePrice.toLocaleString()}</span></p>
            <p>CapEx: <span className="text-foreground font-medium">€{inv.capex.toLocaleString()}</span></p>
            <p>Total Investment: <span className="text-foreground font-medium">€{(inv.purchasePrice + inv.capex).toLocaleString()}</span></p>
          </div>
          <div className="pt-2 border-t border-border space-y-1 text-muted-foreground">
            <p>Debt: <span className={`font-medium ${inv.debt > 0 ? "text-foreground" : "text-success"}`}>{inv.debt > 0 ? `€${inv.debt.toLocaleString()}` : "No debt"}</span></p>
            {inv.debtTerms && <p>Finance Terms: <span className="text-foreground">{inv.debtTerms}</span></p>}
          </div>
          {inv.excelModelUrl && (
            <a href={inv.excelModelUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 mt-2">
                <FileText className="h-3.5 w-3.5" />
                Open Excel Model
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            {[
              { label: "Gross Yield", value: `${inv.grossYield}%` },
              { label: "Net Yield", value: `${inv.netYield}%` },
              { label: "IRR Levered", value: `${inv.irrWithFinance}%` },
              { label: "IRR Unlevered", value: `${inv.irrWithoutFinance}%` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpensesTab({ property }: { property: Property }) {
  const monthlyRent = property.currentTenancy?.monthlyRent || 800;
  const annualRent = monthlyRent * 12;

  // Different percentages for variety
  const insuranceRate = 0.018 + (property.id.charCodeAt(5) % 10) * 0.002;
  const enfiaRate = 0.022 + (property.id.charCodeAt(6) % 8) * 0.002;
  const reserveRate = 0.015 + (property.id.charCodeAt(7) % 12) * 0.001;

  const insuranceAnnual = Math.round(annualRent * insuranceRate);
  const enfiaAnnual = Math.round(annualRent * enfiaRate);
  const reserveAnnual = Math.round(annualRent * reserveRate);

  const insuranceMonthly = Math.round(insuranceAnnual / 12);
  const enfiaMonthly = Math.round(enfiaAnnual / 12);
  const reserveMonthly = Math.round(reserveAnnual / 12);

  const netIncome = annualRent - insuranceAnnual - enfiaAnnual - reserveAnnual;

  const now = new Date();
  const currentMonth = now.getMonth();
  const years = [2025, 2026];

  const expenses = [
    { name: "Insurance", annual: insuranceAnnual, monthly: insuranceMonthly },
    { name: "ENFIA", annual: enfiaAnnual, monthly: enfiaMonthly },
    { name: "Reserve Fund", annual: reserveAnnual, monthly: reserveMonthly },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gross to Net (Annual)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between p-2 rounded bg-muted/50">
            <span className="text-muted-foreground">Gross Rental Income</span>
            <span className="font-bold text-foreground">€{annualRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 rounded">
            <span className="text-muted-foreground">− Insurance</span>
            <span className="text-destructive">−€{insuranceAnnual.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 rounded">
            <span className="text-muted-foreground">− ENFIA</span>
            <span className="text-destructive">−€{enfiaAnnual.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 rounded">
            <span className="text-muted-foreground">− Reserve Fund</span>
            <span className="text-destructive">−€{reserveAnnual.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2.5 rounded bg-primary/10 border border-primary/20">
            <span className="font-semibold text-foreground">Net Income</span>
            <span className="font-bold text-primary">€{netIncome.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {expenses.map((expense) => (
        <Card key={expense.name}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{expense.name}</CardTitle>
              <span className="text-xs text-muted-foreground">Total: €{expense.annual.toLocaleString()}/yr • €{expense.monthly.toLocaleString()}/mo</span>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                {years.map((year) => (
                  <div key={year} className="mb-3">
                    <p className="text-xs font-bold text-foreground mb-1.5">{year}</p>
                    <div className="flex gap-1">
                      {allMonths.map((month, mIdx) => {
                        const isFuture = year > now.getFullYear() || (year === now.getFullYear() && mIdx > currentMonth);
                        const isPast = year < now.getFullYear() || (year === now.getFullYear() && mIdx <= currentMonth);
                        // Use property id to seed deterministic paid status
                        const seed = property.id.charCodeAt(5) + mIdx + year;
                        const isPaid = isPast ? (seed % 7 !== 0) : false;

                        let bgClass = "bg-muted/30 text-muted-foreground/40";
                        if (isPast) {
                          bgClass = isPaid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive";
                        }

                        return (
                          <div key={month} className={`flex-1 text-center rounded py-1.5 text-[10px] font-medium ${bgClass}`}>
                            <span className="block">{month}</span>
                            <span className="block text-[9px]">€{expense.monthly}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MaintenanceTab({ property }: { property: Property }) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const maintenanceItems = property.maintenanceItems || [];

  const avgResolution = maintenanceItems.length > 0
    ? Math.round(maintenanceItems.reduce((s, m) => s + m.resolutionDays, 0) / maintenanceItems.length)
    : 0;
  const totalCost = maintenanceItems.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{maintenanceItems.length}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">€{totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{avgResolution}d</p>
            <p className="text-xs text-muted-foreground">Avg. Resolution</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Maintenance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceItems.length > 0 ? (
            <div className="space-y-2">
              {maintenanceItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedItem(i)}
                  className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reported: {item.reportDate}</p>
                    </div>
                    <Badge variant={item.resolveDate ? "default" : "destructive"} className={item.resolveDate ? "bg-success text-success-foreground" : ""}>
                      {item.resolveDate ? "Resolved" : "Open"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Cost: <span className="text-foreground font-medium">€{item.cost.toLocaleString()}</span></span>
                    <span>Resolution: <span className="text-foreground">{item.resolutionDays} days</span></span>
                    <span>PM: <span className="text-foreground">{item.propertyManager}</span></span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No maintenance items recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance detail dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        {selectedItem !== null && maintenanceItems[selectedItem] && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Report Date</p>
                  <p className="font-medium text-foreground">{maintenanceItems[selectedItem].reportDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution Date</p>
                  <p className="font-medium text-foreground">{maintenanceItems[selectedItem].resolveDate || "Pending"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="font-medium text-foreground">€{maintenanceItems[selectedItem].cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution Time</p>
                  <p className="font-medium text-foreground">{maintenanceItems[selectedItem].resolutionDays} days</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Issue</p>
                <p className="text-foreground font-medium">{maintenanceItems[selectedItem].description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{maintenanceItems[selectedItem].notes || "Contractor was dispatched to the property. Issue was inspected and repair carried out. Tenant was notified of completion."}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Property Manager</p>
                <p className="text-foreground">{maintenanceItems[selectedItem].propertyManager}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={maintenanceItems[selectedItem].resolveDate ? "default" : "destructive"} className={maintenanceItems[selectedItem].resolveDate ? "bg-success text-success-foreground" : ""}>
                  {maintenanceItems[selectedItem].resolveDate ? "Resolved" : "Open"}
                </Badge>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function PeriodicalCheckTab({ property }: { property: Property }) {
  const checks = property.periodicalChecks || [];

  return (
    <div className="space-y-4">
      {checks.length > 0 && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Periodical Check</p>
            <p className="text-lg font-bold text-foreground">{checks[0].nextCheckDate}</p>
            <p className="text-xs text-muted-foreground">Assigned to: {checks[0].propertyManager}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inspection History</CardTitle>
        </CardHeader>
        <CardContent>
          {checks.length > 0 ? (
            <div className="space-y-3">
              {checks.map((check, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{check.date}</p>
                      <p className="text-xs text-muted-foreground">Inspector: {check.propertyManager}</p>
                    </div>
                    <Badge variant={check.status === "completed" ? "default" : "outline"} className={check.status === "completed" ? "bg-success text-success-foreground" : ""}>
                      {check.status === "completed" ? "Completed" : "Scheduled"}
                    </Badge>
                  </div>
                  {check.comments && (
                    <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">{check.comments}</p>
                  )}
                  {check.photos > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">{check.photos} photos attached</p>
                  )}
                  {check.status === "completed" && (
                    <Button variant="outline" size="sm" className="gap-2 mt-2 text-xs h-7">
                      <FileText className="h-3 w-3" />
                      View Inspection Report (PDF)
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No inspections recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{property.address}</h2>
          <p className="text-sm text-muted-foreground">{property.city}, {property.postcode}</p>
        </div>
        <Badge variant={property.status === "let" ? "default" : "destructive"} className={`ml-auto ${property.status === "let" ? "bg-success text-success-foreground" : ""}`}>
          {property.status === "let" ? "Let" : "Vacant"}
        </Badge>
      </div>

      <Tabs defaultValue="tenants">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="tenants" className="gap-1.5">
            <Users2Icon className="h-3.5 w-3.5" />
            Tenant Details
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="utilities" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Utilities
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="investment" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Investment
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="periodical" className="gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Periodical Check
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tenants"><TenantDetailsTab property={property} /></TabsContent>
        <TabsContent value="certificates"><CertificatesTab property={property} /></TabsContent>
        <TabsContent value="utilities"><UtilitiesTab property={property} /></TabsContent>
        <TabsContent value="communication"><CommunicationTab property={property} /></TabsContent>
        <TabsContent value="expenses"><ExpensesTab property={property} /></TabsContent>
        <TabsContent value="investment"><InvestmentTab property={property} /></TabsContent>
        <TabsContent value="maintenance"><MaintenanceTab property={property} /></TabsContent>
        <TabsContent value="periodical"><PeriodicalCheckTab property={property} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Users2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 19a6 6 0 0 0-12 0" /><circle cx="8" cy="9" r="4" /><path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
    </svg>
  );
}

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ArrearsDetailProps {
  properties: Property[];
  onBack: () => void;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ArrearsStageButton({ stage, property }: { stage: Property["arrearsStages"] extends (infer T)[] | undefined ? T : never; property: Property }) {
  const stageColors: Record<string, string> = {
    D1: "bg-warning/15 text-warning hover:bg-warning/25",
    D7: "bg-[hsl(var(--chart-5))]/15 text-[hsl(var(--chart-5))] hover:bg-[hsl(var(--chart-5))]/25",
    D30: "bg-destructive/10 text-destructive hover:bg-destructive/15",
  };
  const inactiveClass = "bg-muted text-muted-foreground/50";

  const messages: Record<string, string> = {
    D1: `We've noticed your rent for this month has not yet been received. Please arrange payment today. Thank you.\n\n— Property Management`,
    D7: `As of today, your rent remains unpaid. Please settle within forty-eight hours to avoid further action.`,
    D30: `Formal notice: Rent remains outstanding for 30+ days. Legal proceedings may be initiated.`,
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${stage.active ? stageColors[stage.stage] : inactiveClass}`}>
          {stage.stage}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm space-y-3">
        <p className="font-semibold text-foreground">Stage {stage.stage}</p>
        {stage.active ? (
          <div className="space-y-2">
            <p className="text-muted-foreground">Expected: <span className="text-foreground">£{property.currentTenancy?.monthlyRent?.toLocaleString()}</span></p>
            <p className="text-muted-foreground">Received: <span className="text-destructive font-medium">£0</span></p>
            <p className="text-muted-foreground">Status: <span className="text-destructive font-medium">Arrear — {stage.stage.replace("D", "")} day(s)</span></p>

            {stage.stage === "D1" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.smsTriggered ? "bg-success" : "bg-muted"}`} />
                  <span className="text-xs">Auto SMS reminder {stage.smsTriggered ? "sent" : "pending"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.emailTriggered ? "bg-success" : "bg-muted"}`} />
                  <span className="text-xs">Auto email reminder {stage.emailTriggered ? "sent" : "pending"}</span>
                </div>
              </div>
            )}

            {stage.stage === "D7" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.callMade ? "bg-success" : "bg-destructive"}`} />
                  <span className="text-xs">Personal call from PM {stage.callMade ? "completed" : "not done"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.formalNotice ? "bg-success" : "bg-muted"}`} />
                  <span className="text-xs">Formal written notice {stage.formalNotice ? "sent" : "pending"}</span>
                </div>
                <Badge variant="destructive" className="text-[10px]">⚠ At Risk</Badge>
              </div>
            )}

            {stage.stage === "D30" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.lawyerNotified ? "bg-success" : "bg-muted"}`} />
                  <span className="text-xs">Lawyer notified {stage.lawyerNotified ? "✓" : "pending"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.evictionInitiated ? "bg-success" : "bg-muted"}`} />
                  <span className="text-xs">Eviction initiation {stage.evictionInitiated ? "started" : "not started"}</span>
                </div>
              </div>
            )}

            <div className="mt-2 p-2 rounded bg-muted text-xs text-muted-foreground italic">
              "{messages[stage.stage]}"
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Not yet reached this stage</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ArrearsDetail({ properties, onBack }: ArrearsDetailProps) {
  const arrearsProperties = properties.filter(p =>
    p.status === "let" && p.arrearsStages && p.arrearsStages.some(s => s.active)
  );

  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Arrears Overview</h2>
          <p className="text-sm text-muted-foreground">{arrearsProperties.length} properties with outstanding rent</p>
        </div>
      </div>

      <div className="space-y-4">
        {arrearsProperties.map((property) => {
          const yearRents = property.rentHistory.filter(r => r.year === 2025);
          const progressPercent = ((currentMonth + currentDay / 30) / 12) * 100;

          return (
            <Card key={property.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{property.address}</p>
                    <p className="text-xs text-muted-foreground">{property.city}, {property.postcode}</p>
                    {property.currentTenancy && (
                      <p className="text-xs text-primary mt-0.5">{property.currentTenancy.tenant.name}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {property.arrearsStages?.map((stage) => (
                      <ArrearsStageButton key={stage.stage} stage={stage} property={property} />
                    ))}
                  </div>
                </div>

                {/* Monthly payment grid */}
                <div>
                  <div className="grid grid-cols-12 gap-1 mb-1">
                    {yearRents.map((r, idx) => {
                      const isPast = idx <= currentMonth;
                      return (
                        <div
                          key={r.month}
                          className={`text-center rounded px-0.5 py-1 text-[10px] font-medium ${
                            !isPast ? "bg-muted/30 text-muted-foreground/40" :
                            r.paid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {r.month}
                        </div>
                      );
                    })}
                  </div>
                  {/* Timeline indicator */}
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/40 rounded-full" style={{ width: `${progressPercent}%` }} />
                    <div
                      className="absolute top-0 w-0.5 h-full bg-primary"
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {arrearsProperties.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No properties currently in arrears</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

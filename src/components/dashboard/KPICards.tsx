import { Building2, Users, TrendingUp, TrendingDown, PoundSterling, Home, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardsProps {
  stats: {
    totalProperties: number;
    occupied: number;
    vacant: number;
    occupancyRate: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    collectionRate: number;
    arrearsRate: number;
    arrearsAmount: number;
    totalExpectedRent: number;
  };
  onArrearsClick?: () => void;
}

export function KPICards({ stats, onArrearsClick }: KPICardsProps) {
  const kpis = [
    {
      label: "Properties Under Management",
      value: stats.totalProperties,
      icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtitle: `${stats.occupied} occupied / ${stats.vacant} vacant`,
      icon: Users,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Rent Collection",
      value: `${stats.collectionRate}%`,
      subtitle: `£${stats.monthlyRevenue.toLocaleString()} collected`,
      icon: TrendingUp,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Arrears",
      value: `${stats.arrearsRate}%`,
      subtitle: `£${stats.arrearsAmount.toLocaleString()} outstanding`,
      icon: TrendingDown,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      onClick: onArrearsClick,
    },
    {
      label: "Monthly Revenue",
      value: `£${stats.monthlyRevenue.toLocaleString()}`,
      subtitle: `Expected: £${stats.totalExpectedRent.toLocaleString()}`,
      icon: PoundSterling,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Yearly Revenue",
      value: `£${stats.yearlyRevenue.toLocaleString()}`,
      icon: PoundSterling,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Occupied Properties",
      value: stats.occupied,
      icon: Home,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Vacant Properties",
      value: stats.vacant,
      icon: AlertTriangle,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className={`border-border/60 shadow-sm hover:shadow-md transition-shadow ${kpi.onClick ? "cursor-pointer hover:border-primary/30" : ""}`}
          onClick={kpi.onClick}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                )}
              </div>
              <div className={`rounded-lg p-2.5 ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

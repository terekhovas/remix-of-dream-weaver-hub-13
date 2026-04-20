import { Property } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MarketAnalysisProps {
  properties: Property[];
}

export function MarketAnalysis({ properties }: MarketAnalysisProps) {
  const letProperties = properties.filter(p => p.status === "let").slice(0, 15);

  const avgActual = letProperties.length > 0
    ? Math.round(letProperties.reduce((s, p) => s + p.marketData.actualRent, 0) / letProperties.length)
    : 0;
  const avgMarket = letProperties.length > 0
    ? Math.round(letProperties.reduce((s, p) => s + p.marketData.marketRent, 0) / letProperties.length)
    : 0;
  const avgDiff = avgActual - avgMarket;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Market Analysis</h2>
        <p className="text-sm text-muted-foreground">Comparing your portfolio rents against market rates from spitogatos.gr • Showing {letProperties.length} properties</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg. Actual Rent</p>
          <p className="text-2xl font-bold text-foreground">€{avgActual.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">per month</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg. Market Rent</p>
          <p className="text-2xl font-bold text-foreground">€{avgMarket.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">per month (spitogatos.gr)</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg. Difference</p>
          <p className={`text-2xl font-bold ${avgDiff >= 0 ? "text-success" : "text-destructive"}`}>
            {avgDiff >= 0 ? "+" : ""}€{avgDiff.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">{avgDiff >= 0 ? "Above market" : "Below market"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <ScrollArea className="w-full max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Property</TableHead>
                <TableHead className="font-semibold text-right">Actual Rent</TableHead>
                <TableHead className="font-semibold text-right">Market Rent</TableHead>
                <TableHead className="font-semibold text-right">Difference</TableHead>
                <TableHead className="font-semibold text-center">Position</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letProperties.map((property) => {
                const diff = property.marketData.actualRent - property.marketData.marketRent;
                const diffPct = ((diff / property.marketData.marketRent) * 100).toFixed(1);
                const isAbove = diff > 0;
                const isBelow = diff < 0;

                return (
                  <TableRow key={property.id} className="hover:bg-muted/30">
                    <TableCell>
                      <span className="block text-sm font-medium text-foreground">{property.address}</span>
                      <span className="text-xs text-muted-foreground">{property.city}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{property.marketData.actualRent.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">€{property.marketData.marketRent.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-medium ${isAbove ? "text-success" : isBelow ? "text-destructive" : "text-muted-foreground"}`}>
                      {diff >= 0 ? "+" : ""}€{diff.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {isAbove ? (
                        <Badge className="bg-success/15 text-success border-0 gap-1">
                          <TrendingUp className="h-3 w-3" />+{diffPct}%
                        </Badge>
                      ) : isBelow ? (
                        <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                          <TrendingDown className="h-3 w-3" />{diffPct}%
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border-0 gap-1">
                          <Minus className="h-3 w-3" />At market
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{property.marketData.source}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICards } from "@/components/dashboard/KPICards";
import { ArrearsDetail } from "@/components/dashboard/ArrearsDetail";
import { PropertyMap } from "@/components/dashboard/PropertyMap";
import { PropertiesTable } from "@/components/properties/PropertiesTable";
import { RentRoll } from "@/components/rentroll/RentRoll";
import { OccupancyChart } from "@/components/occupancy/OccupancyChart";
import { MarketAnalysis } from "@/components/market/MarketAnalysis";
import { properties, getDashboardStats } from "@/data/mockData";
import { LayoutDashboard, Building2, ScrollText, CalendarDays, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const Index = () => {
  const stats = useMemo(() => getDashboardStats(properties), []);
  const [showArrears, setShowArrears] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">PropManager</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">Property Portfolio Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile?.full_name && (
                <span className="text-sm text-muted-foreground">{profile.full_name}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" />Properties
            </TabsTrigger>
            <TabsTrigger value="rentroll" className="gap-2">
              <ScrollText className="h-4 w-4" />Rent Roll
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="gap-2">
              <CalendarDays className="h-4 w-4" />Occupancy
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2">
              <BarChart3 className="h-4 w-4" />Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {showArrears ? (
              <ArrearsDetail properties={properties} onBack={() => setShowArrears(false)} />
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Portfolio Overview</h2>
                  <p className="text-sm text-muted-foreground">Key performance indicators for your property portfolio</p>
                </div>
                <KPICards stats={stats} onArrearsClick={() => setShowArrears(true)} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Property Locations</h3>
                  <PropertyMap properties={properties} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Properties</h2>
                <p className="text-sm text-muted-foreground">Manage your property portfolio</p>
              </div>
              <PropertiesTable />
            </div>
          </TabsContent>

          <TabsContent value="rentroll">
            <RentRoll properties={properties} />
          </TabsContent>

          <TabsContent value="occupancy">
            <OccupancyChart properties={properties} />
          </TabsContent>

          <TabsContent value="market">
            <MarketAnalysis properties={properties} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

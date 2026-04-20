import { ArrowLeft, ExternalLink, FileText, ImagePlus, Plus, User, Eye, Phone, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/data/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VacantDetailProps {
  property: Property;
  onBack: () => void;
}

export function VacantDetail({ property, onBack }: VacantDetailProps) {
  const listing = property.vacantListing;
  const vacantSince = property.vacantSinceDate || "2025-01-15";

  const vacantDays = Math.round((new Date().getTime() - new Date(vacantSince).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{property.address}</h2>
          <p className="text-sm text-muted-foreground">{property.city}, {property.postcode}</p>
        </div>
        <Badge variant="destructive" className="ml-auto">Vacant</Badge>
      </div>

      {/* Listing URL + KPIs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Online Listing</CardTitle>
            {listing?.isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            {listing?.listingUrl ? (
              <a
                href={listing.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 hover:underline text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                {listing.listingUrl}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No listing URL added</p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs font-medium text-warning">Property vacant since <span className="font-bold">{vacantSince}</span> — {vacantDays} days</p>
          </div>

          {listing?.kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{listing.kpis.views.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Views</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <Phone className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{listing.kpis.calls}</p>
                <p className="text-[10px] text-muted-foreground">Calls</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{listing.kpis.viewings}</p>
                <p className="text-[10px] text-muted-foreground">Viewings</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{listing.kpis.inquiries}</p>
                <p className="text-[10px] text-muted-foreground">Inquiries</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Professional Photos</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <ImagePlus className="h-3.5 w-3.5" />
              Add Photos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {listing?.photos && listing.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {listing.photos.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={photo}
                    alt={`Interior photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              ))}
              <button className="aspect-[4/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Plus className="h-6 w-6" />
                <span className="text-xs">Add Photo</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImagePlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No photos uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Assigned Agents</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {listing?.agents && listing.agents.length > 0 ? (
            <div className="space-y-3">
              {listing.agents.map((agent, i) => (
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.company} • Fee: {agent.feePercent}%</p>
                        </div>
                        {agent.contractAttached && (
                          <Badge variant="outline" className="text-[10px]">Contract</Badge>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-sm space-y-3">
                    <p className="font-semibold text-foreground">{agent.name}</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Company: <span className="text-foreground">{agent.company}</span></p>
                      <p>Phone: <span className="text-foreground">{agent.phone}</span></p>
                      <p>Email: <span className="text-foreground">{agent.email}</span></p>
                      <p>Fee: <span className="text-foreground font-medium">{agent.feePercent}%</span></p>
                    </div>
                    {agent.contractAttached && (
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <FileText className="h-3.5 w-3.5" />
                        View Agent Contract (PDF)
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No agents assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/data/mockData";

interface PropertyMapProps {
  properties: Property[];
}

const neighborhoods: { name: string; bounds: L.LatLngBoundsExpression; center: L.LatLngExpression }[] = [
  { name: "Athens Center", bounds: [[37.97, 23.715], [37.985, 23.74]], center: [37.9755, 23.7275] },
  { name: "Kallithea", bounds: [[37.94, 23.685], [37.96, 23.715]], center: [37.95, 23.70] },
  { name: "Glyfada", bounds: [[37.85, 23.74], [37.875, 23.775]], center: [37.862, 23.755] },
  { name: "Kifisia", bounds: [[38.06, 23.80], [38.085, 23.83]], center: [38.073, 23.815] },
  { name: "Marousi", bounds: [[38.04, 23.79], [38.06, 23.815]], center: [38.05, 23.80] },
  { name: "Kolonaki", bounds: [[37.975, 23.735], [37.985, 23.750]], center: [37.98, 23.742] },
  { name: "Pagrati", bounds: [[37.965, 23.740], [37.978, 23.760]], center: [37.97, 23.750] },
  { name: "Piraeus", bounds: [[37.935, 23.635], [37.955, 23.665]], center: [37.945, 23.65] },
  { name: "Chalandri", bounds: [[38.01, 23.79], [38.03, 23.815]], center: [38.02, 23.80] },
  { name: "Voula", bounds: [[37.83, 23.75], [37.85, 23.78]], center: [37.84, 23.765] },
];

const cityCoords: Record<string, [number, number]> = {
  "Athens": [37.9755, 23.7275],
  "Kallithea": [37.95, 23.70],
  "Glyfada": [37.862, 23.755],
  "Kifisia": [38.073, 23.815],
  "Marousi": [38.05, 23.80],
  "Kolonaki": [37.98, 23.742],
  "Pagrati": [37.97, 23.750],
  "Piraeus": [37.945, 23.65],
  "Thessaloniki": [40.63, 22.94],
  "Chalandri": [38.02, 23.80],
  "Voula": [37.84, 23.765],
};

type MapStyle = "map" | "terrain" | "satellite";

const tileLayers: Record<MapStyle, { url: string; attribution: string; maxZoom?: number }> = {
  map: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 18,
  },
};

export function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeStyle, setActiveStyle] = useState<MapStyle>("map");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [37.98, 23.73],
      zoom: 11,
      scrollWheelZoom: true,
    });

    const layer = L.tileLayer(tileLayers.map.url, {
      attribution: tileLayers.map.attribution,
      maxZoom: tileLayers.map.maxZoom,
    }).addTo(map);

    tileLayerRef.current = layer;

    // Neighborhood borders
    neighborhoods.forEach((n) => {
      const rect = L.rectangle(n.bounds, {
        color: "hsl(221, 83%, 53%)",
        weight: 2,
        fillOpacity: 0.08,
        fillColor: "hsl(221, 83%, 53%)",
      }).addTo(map);
      rect.bindTooltip(n.name, { sticky: true, className: "font-semibold" });
    });

    // Property markers
    const letIcon = L.divIcon({
      html: '<div style="background:hsl(142,71%,45%);width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>',
      iconSize: [12, 12],
      className: "",
    });
    const vacantIcon = L.divIcon({
      html: '<div style="background:hsl(0,84%,60%);width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>',
      iconSize: [12, 12],
      className: "",
    });

    properties.forEach((p) => {
      const base = cityCoords[p.city] || [37.98, 23.73];
      const lat = base[0] + (Math.random() - 0.5) * 0.015;
      const lng = base[1] + (Math.random() - 0.5) * 0.015;
      L.marker([lat, lng], { icon: p.status === "let" ? letIcon : vacantIcon })
        .bindPopup(`<b>${p.address}</b><br/>${p.city}<br/><span style="color:${p.status === "let" ? "green" : "red"}">${p.status === "let" ? "Let" : "Vacant"}</span>${p.currentTenancy ? `<br/>€${p.currentTenancy.monthlyRent}/mo` : ""}`)
        .addTo(map);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [properties]);

  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const config = tileLayers[activeStyle];
    tileLayerRef.current.setUrl(config.url);
  }, [activeStyle]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Map style toggle */}
      <div className="flex items-center gap-1 p-2 bg-card border-b border-border">
        {(["map", "terrain", "satellite"] as MapStyle[]).map((style) => (
          <button
            key={style}
            onClick={() => setActiveStyle(style)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              activeStyle === style
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {style}
          </button>
        ))}
      </div>
      <div ref={mapRef} style={{ height: 400, width: "100%" }} />
      <div className="flex items-center gap-4 p-2 bg-muted/30 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Let</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Vacant</span>
        <span>Zoom in to see neighborhood borders</span>
      </div>
    </div>
  );
}

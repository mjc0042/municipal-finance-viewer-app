import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Municipality } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FinanceMapProps {
  selectedMunicipality: Municipality | null;
  setSelectedMunicipality: (municipality: Municipality | null) => void;
  searchQuery: string;
  colorBy: string;
}

export default function FinanceMap({ 
  selectedMunicipality, 
  setSelectedMunicipality, 
  searchQuery,
  colorBy 
}: FinanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const { data: municipalities = [], isLoading } = useQuery({
    queryKey: ["/api/municipalities", { search: searchQuery }],
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !municipalities.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    municipalities.forEach((municipality: Municipality) => {
      if (!municipality.latitude || !municipality.longitude) return;

      const lat = parseFloat(municipality.latitude);
      const lng = parseFloat(municipality.longitude);
      
      // Get color based on colorBy property
      const color = getMarkerColor(municipality, colorBy);
      
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });

      marker.on('click', () => {
        setSelectedMunicipality(municipality);
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [municipalities, colorBy, setSelectedMunicipality]);

  const getMarkerColor = (municipality: Municipality, colorBy: string): string => {
    let value = 0;
    
    switch (colorBy) {
      case 'revenuePerAcre':
        value = municipality.revenuePerAcre ? parseFloat(municipality.revenuePerAcre) : 0;
        if (value > 25000) return '#22c55e'; // green
        if (value > 15000) return '#eab308'; // yellow
        return '#ef4444'; // red
      case 'debtToRevenue':
        value = municipality.debtToRevenue ? parseFloat(municipality.debtToRevenue) : 0;
        if (value < 20) return '#22c55e'; // green - low debt is good
        if (value < 30) return '#eab308'; // yellow
        return '#ef4444'; // red - high debt is concerning
      case 'population':
        value = municipality.population || 0;
        if (value > 500000) return '#22c55e'; // green
        if (value > 100000) return '#eab308'; // yellow
        return '#ef4444'; // red
      default:
        return '#3c6e71'; // teal default
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([39.8283, -98.5795], 4);
    }
  };

  const formatCurrency = (value: string | null): string => {
    if (!value) return '$0';
    const num = parseFloat(value);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatNumber = (value: number | null): string => {
    if (!value) return '0';
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading municipalities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-3 z-10">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-600">Legend:</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Low</span>
          </div>
        </div>
        <Button
          onClick={resetView}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        >
          Reset View
        </Button>
      </div>

      {/* Municipality Info Panel */}
      {selectedMunicipality && (
        <Card className="absolute bottom-4 left-4 max-w-sm z-10">
          <CardContent className="p-4">
            <h4 className="font-semibold text-charcoal mb-2">
              {selectedMunicipality.name}, {selectedMunicipality.state}
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Population:</span>
                <span>{formatNumber(selectedMunicipality.population)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span>{formatCurrency(selectedMunicipality.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue/Acre:</span>
                <span className="text-teal font-medium">
                  {formatCurrency(selectedMunicipality.revenuePerAcre)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Debt Ratio:</span>
                <span>
                  {selectedMunicipality.debtToRevenue ? 
                    `${parseFloat(selectedMunicipality.debtToRevenue).toFixed(1)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-3 w-full bg-teal hover:bg-teal/90 text-white"
              onClick={() => {
                // TODO: Navigate to detailed view
                console.log('View details for:', selectedMunicipality.name);
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

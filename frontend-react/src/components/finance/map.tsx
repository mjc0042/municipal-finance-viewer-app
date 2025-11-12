import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MunicipalBoundaryCollection, MunicipalFeature } from '@/http/financial/types/gis';
import type { MunicipalityFinance } from "@/http/financial/types/types";
import { useFullFinanceStore } from "@/store/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { financialApi } from "@/http/financial/api";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FinanceMapProps {
  municipalBoundaries: MunicipalBoundaryCollection | null;
  selectedMunicipalityFinances: MunicipalityFinance | null;
  selectedMunicipalityFeature: MunicipalFeature | null;
  setSelectedMunicipality: (id: number, mid: string) => void;
  colorBy: string;
}

export default function FinanceMap({
  municipalBoundaries,
  selectedMunicipalityFinances: finData,
  selectedMunicipalityFeature,
  setSelectedMunicipality,
  colorBy 
}: FinanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stateLayerRef = useRef<L.GeoJSON | null>(null);
  const municipalityLayersRef = useRef<L.LayerGroup | null>(null);

  //const { data: stateBoundaries, isLoading: statesLoading } = useQuery({
  //  queryKey: ['states-boundaries'],
  //  queryFn: () => financialApi.getStateBoundaries(),
  //});

  //const { data: municipalities = [], isLoading: municipalitiesLoading } = useQuery({
  //  queryKey: ['municipalities', selectedState],
  //  queryFn: () => financialApi.getMunicipalBoundaries(selectedState!),
  //  enabled: !!selectedState,
  //});

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    municipalityLayersRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add state boundaries
  /*useEffect(() => {
    if (!mapInstanceRef.current || !stateBoundaries || statesLoading) return;

    if (stateLayerRef.current) {
      stateLayerRef.current.remove();
    }

    stateLayerRef.current = L.geoJSON(stateBoundaries, {
      style: (feature) => ({
        color: '#3c6e71',
        weight: 2,
        fillOpacity: 0.1,
        fillColor: '#3c6e71'
      }),
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          const stateCode = feature.properties.STATE;
          setSelectedState(stateCode);
          
          // Zoom to state bounds
          if (mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(layer.getBounds());
          }
        });
      }
    }).addTo(mapInstanceRef.current);
  }, [stateBoundaries, statesLoading]);*/

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !municipalBoundaries?.features.length) return;
  
    if (municipalityLayersRef.current) {
      municipalityLayersRef.current.clearLayers();
    }
  
    const layers = [];
  
    municipalBoundaries.features.forEach((boundary) => {
      if (!boundary.geometry) return;
  
      const layer = L.geoJSON(boundary.geometry, {
        style: () => ({
          color: '#3c6e71',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.3
        })
      });
  
      layer.on('click', () => {
        setSelectedMunicipality(boundary.properties.id, boundary.properties.mid);
      });
  
      layer.bindPopup(boundary.properties.municipal_name);
      layer.addTo(municipalityLayersRef.current!);
      layers.push(layer);
    });
  
    // --- Fit to all polygons
    if (layers.length > 0) {
      // Collect all bounds and combine
      const group = L.featureGroup(layers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }, [municipalBoundaries, colorBy, setSelectedMunicipality]);

  // Zoom to selected municipality
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      selectedMunicipalityFeature &&
      selectedMunicipalityFeature.geometry
    ) {
      const layer = L.geoJSON(selectedMunicipalityFeature.geometry);
      mapInstanceRef.current.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 13 });
    }
  }, [selectedMunicipalityFeature]);

  const getMarkerColor = (municipality: MunicipalityFinance, colorBy: string): string => {
    let value = 0;
    
    // TODO: fix
    switch (colorBy) {
      case 'total_revenues':
        value = municipality.total_revenues ? municipality.total_revenues : 0;
        if (value > 25000) return '#22c55e'; // green
        if (value > 15000) return '#eab308'; // yellow
        return '#ef4444'; // red
      case 'debt':
        value = municipality.debt ? municipality.debt : 0;
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

  const formatCurrency = (value: number | null): string => {
    if (!value) return '$0';
    const num = value;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatNumber = (value: number | null): string => {
    if (!value) return '0';
    return value.toLocaleString();
  };

  /*if (municipalBoundaries === null || municipalBoundaries.features.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }*/

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
      {selectedMunicipalityFeature && finData && (
        <Card className="absolute bottom-4 left-4 max-w-sm z-10">
          <CardContent className="p-4">
            <h4 className="font-semibold text-charcoal mb-2">
              {selectedMunicipalityFeature.properties.municipal_name}, {selectedMunicipalityFeature.properties.state}
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Population:</span>
                <span>{formatNumber(finData.population)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span>{formatCurrency(finData.total_revenues)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Debt:</span>
                <span>
                  {finData.debt ? `${finData.debt}%` : 'N/A'}
                </span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-3 w-full bg-teal hover:bg-teal/90 text-white"
              onClick={() => {
                // TODO: Navigate to detailed view
                console.log('View details for:', selectedMunicipalityFeature.properties.municipal_name);
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

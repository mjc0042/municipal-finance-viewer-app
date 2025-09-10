import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Upload, BarChart3 } from "lucide-react";
import type { MunicipalityFinance } from "@/http/financial/types/types";
import { useFinanceStore } from "@/store/finance";
import type { StateInfo } from "@/store/types";

export interface MunicipalityListItem {
  id: number;
  name: string;
  county: string;
  code: string;
  mid: string;
}

interface FinanceSidebarProps {
  stateNames: StateInfo[];
  selectedState: StateInfo | null;
  setSelectedState: (stateName:StateInfo) => void;
  stateMunicipalities: MunicipalityListItem[];
  setSelectedMunicipality: (id: number, mid: string) => Promise<void>;
  //colorBy: string;
  //setColorBy: (colorBy: string) => void;
  selectedMunicipalityFinances: MunicipalityFinance[] | null;
}

export default function FinanceSidebar({
  stateNames,
  selectedState,
  setSelectedState,
  stateMunicipalities,
  //colorBy,
  //setColorBy,
  setSelectedMunicipality,
  selectedMunicipalityFinances
}: FinanceSidebarProps) {
  const [filters, setFilters] = useState({
    metropolitan: false,
    coastal: false,
    largePop: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  //const selectedState = useFinanceStore((state) => state.selectedState);

  const filteredMunicipalities = stateMunicipalities.filter((muni) =>
    muni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = (filter: keyof typeof filters, checked: boolean) => {
    setFilters(prev => ({ ...prev, [filter]: checked }));
  };

  const handleExportMap = () => {
    // TODO: Implement map export functionality
    console.log('Exporting map...');
  };

  const handleExportCharts = () => {
    // TODO: Implement chart export functionality
    console.log('Exporting charts...');
  };

  const handleUploadParcelData = () => {
    // TODO: Implement uploading parcel data
  };

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          Municipal Search & Filters
        </h2>
        
        {/* State search bar */}
        <div className="mb-6">
          <select
            className="block w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500/20 text-gray-700"
            value={selectedState?.abbr || ""}
            onChange={(e) => {
              const stateInfo = stateNames.find(state => state.abbr === e.target.value);
              if (stateInfo) {
                setSelectedState(stateInfo);
              }
            }}
          >
            <option value="">Select a state</option>
            {stateNames.map((stateInfo) => (
              <option key={stateInfo.code} value={stateInfo.abbr}>
                {stateInfo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Municipality Search Bar */}
        { selectedState  && (
        <div className="mb-6">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2">
            Search Municipality
          </Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Enter city name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <ul className="mt-2 max-h-48 overflow-auto border rounded p-2 bg-gray-50">
            {filteredMunicipalities.map((muni) => (
                <li key={muni.id} 
                className="p-1 cursor-pointer hover:bg-teal-100 rounded"
                onClick={() => setSelectedMunicipality(muni.id, muni.mid)}>
                  {muni.name} <span className="text-sm text-gray-500">({muni.county})</span>
                </li>
              ))}
          </ul>
        </div>)}

        {/* Color Mapping */}
        {/*<div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            Color Map By
          </Label>
          <Select value={colorBy} onValueChange={setColorBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenuePerAcre">Revenue per Acre</SelectItem>
              <SelectItem value="population">Population Density</SelectItem>
              <SelectItem value="netPosition">Net Financial Position</SelectItem>
              <SelectItem value="debtToRevenue">Debt to Revenue Ratio</SelectItem>
              <SelectItem value="capitalAssets">Capital Assets per Capita</SelectItem>
            </SelectContent>
          </Select>
        </div>*/}

        {/* Quick Stats */}
        {/*<Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Municipalities</span>
              <span className="font-medium">19,495</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Revenue/Acre</span>
              <span className="font-medium">$8,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Selected Region</span>
              <span className="font-medium text-teal">All US</span>
            </div>
            {selectedMunicipalityData && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected</span>
                  <span className="font-medium text-urban-orange">
                    {selectedMunicipalityData.name}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>*/}

        {/* Parcel Upload */}
        { selectedMunicipalityFinances && (
        <div className="border-t pt-4 pb-4">
          <Label className="text-sm font-medium text-gray-700 mb-3">
            Add Parcels
          </Label>
          <div className="space-y-2">
            <Button variant="outline" onClick={handleUploadParcelData}
              className="w-full justify-start text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload file
            </Button>
          </div>
        </div>
        )}


        {/* Region Filters */}
        {/*<div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3">
            Region Filters
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metropolitan"
                checked={filters.metropolitan}
                onCheckedChange={(checked) => 
                  handleFilterChange('metropolitan', checked as boolean)
                }
              />
              <Label htmlFor="metropolitan" className="text-sm">
                Metropolitan Areas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="coastal"
                checked={filters.coastal}
                onCheckedChange={(checked) => 
                  handleFilterChange('coastal', checked as boolean)
                }
              />
              <Label htmlFor="coastal" className="text-sm">
                Coastal Regions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="largePop"
                checked={filters.largePop}
                onCheckedChange={(checked) => 
                  handleFilterChange('largePop', checked as boolean)
                }
              />
              <Label htmlFor="largePop" className="text-sm">
                Population {'>'}50k
              </Label>
            </div>
          </div>
        </div>*/}

        {/* Export Options */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium text-gray-700 mb-3">
            Export Options
          </Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleExportMap}
              className="w-full justify-start text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Map (PNG)
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCharts}
              className="w-full justify-start text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Charts (SVG)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

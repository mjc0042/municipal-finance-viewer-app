import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, BarChart3 } from "lucide-react";
import { Municipality } from "@shared/schema";

interface FinanceSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  colorBy: string;
  setColorBy: (colorBy: string) => void;
  selectedMunicipality: Municipality | null;
}

export default function FinanceSidebar({
  searchQuery,
  setSearchQuery,
  colorBy,
  setColorBy,
  selectedMunicipality
}: FinanceSidebarProps) {
  const [filters, setFilters] = useState({
    metropolitan: false,
    coastal: false,
    largePop: false
  });

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

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          Municipal Search & Filters
        </h2>
        
        {/* Search Bar */}
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
        </div>

        {/* Color Mapping */}
        <div className="mb-6">
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
        </div>

        {/* Quick Stats */}
        <Card className="mb-6">
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
            {selectedMunicipality && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected</span>
                  <span className="font-medium text-urban-orange">
                    {selectedMunicipality.name}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Region Filters */}
        <div className="mb-6">
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
        </div>

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

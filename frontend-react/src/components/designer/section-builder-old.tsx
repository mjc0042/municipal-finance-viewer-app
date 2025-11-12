import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, X, Plus } from "lucide-react";
import type { CrossSectionPanel } from "@/lib/designerUtils";

interface SectionBuilderProps {
  panels: CrossSectionPanel[];
  units: string;
  setUnits: (units: string) => void;
  setPanels: (panels: CrossSectionPanel[]) => void;
  selectedTheme: string;
}

export default function SectionBuilder({ panels, units, setUnits, setPanels, selectedTheme }: SectionBuilderProps) {
  //const [advancedOptions, setAdvancedOptions] = useState({
  //  streetTrees: false,
  //  buildingFacades: false,
  //  pedestriansVehicles: false
  //});

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updatePanel = (index: number, field: keyof CrossSectionPanel, value: string | number) => {
    const updatedPanels = panels.map((panel, i) => 
      i === index ? { ...panel, [field]: value } : panel
    );
    setPanels(updatedPanels);
  };

  const removePanel = (index: number) => {
    const updatedPanels = panels.filter((_, i) => i !== index);
    setPanels(updatedPanels);
  };

  const addPanel = () => {
    const newPanel: CrossSectionPanel = {
      id: Date.now().toString(),
      position: 0,
      name: "New Panel",
      width: 8,
      material: "concrete",
      use: "pedestrian",
      category: "pedestrian",
      comments: ""
    };
    setPanels([...panels, newPanel]);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPanels = [...panels];
    const draggedPanel = newPanels[draggedIndex];
    
    // Remove the dragged panel
    newPanels.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newPanels.splice(insertIndex, 0, draggedPanel);
    
    setPanels(newPanels);
    setDraggedIndex(null);
  };

  //const handleAdvancedOptionChange = (option: keyof typeof advancedOptions, checked: boolean) => {
  //  setAdvancedOptions(prev => ({ ...prev, [option]: checked }));
  //};

  const getTotalWidth = () => {
    return panels.reduce((total, panel) => total + panel.width, 0);
  };

  const getPanelColor = (category: string): string => {
    switch (category) {
      case 'pedestrian': return 'bg-gray-300';
      case 'cycling': return 'bg-green-300';
      case 'vehicle': return 'bg-gray-400';
      case 'parking': return 'bg-blue-300';
      case 'green-space': return 'bg-green-400';
      default: return 'bg-gray-300';
    }
  };

  const getPanelAbbreviation = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  //const materialOptions = ["concrete", "asphalt", "brick", "stone", "permeable-pavement", "grass", "planted"];
  //const useOptions = ["pedestrian", "cycling", "vehicle", "parking", "landscaping", "outdoor-dining", "street-furniture"];

  return (
    <div className="w-1/2 bg-gray-50">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-charcoal">Section Builder</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Units:</span>
            <select value={units} 
              onChange={(e) => setUnits(e.target.value)}
              className="border-gray-300 rounded-md text-xs font-medium focus:ring-indigo-500 focus:border-indigo-500">
              <option>Feet</option>
              <option>Meters</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600">Drag and drop panels to define your cross-section</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Panel List */}
        <div>
          <h4 className="font-medium text-charcoal mb-3">Cross-Section Panels</h4>
          <div className="space-y-2">
            {panels.map((panel, index) => (
              <Card
                key={panel.id}
                className="draggable-panel shadow-sm"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <GripVertical className="h-4 w-4 text-gray-400 mr-2 cursor-move" />
                      <Input
                        value={panel.name}
                        onChange={(e) => updatePanel(index, 'name', e.target.value)}
                        className="font-medium text-sm border-none p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePanel(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600">Width (ft)</Label>
                      <Input
                        type="number"
                        value={panel.width}
                        onChange={(e) => updatePanel(index, 'width', parseInt(e.target.value) || 0)}
                        className="text-xs mt-1"
                        min="1"
                        max="50"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Material</Label>
                      <Select
                        value={panel.material}
                        onValueChange={(value) => updatePanel(index, 'material', value)}
                      >
                        <SelectTrigger className="text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material.charAt(0).toUpperCase() + material.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Use</Label>
                      <Select
                        value={panel.use}
                        onValueChange={(value) => updatePanel(index, 'use', value)}
                      >
                        <SelectTrigger className="text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {useOptions.map((use) => (
                            <SelectItem key={use} value={use}>
                              {use.charAt(0).toUpperCase() + use.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={addPanel}
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-6 hover:border-teal hover:text-teal"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Panel
            </Button>
          </div>
        </div>

        {/* Section Preview */}
        <div>
          <h4 className="font-medium text-charcoal mb-3">Section Preview</h4>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-end space-x-1 justify-center min-h-[80px]">
                {panels.map((panel, index) => (
                  <div
                    key={panel.id}
                    className={`${getPanelColor(panel.category)} flex items-center justify-center text-xs font-medium text-gray-700 transition-all hover:shadow-md`}
                    style={{
                      width: `${(panel.width / Math.max(getTotalWidth(), 1)) * 300}px`,
                      height: `${Math.max(20, panel.width * 2)}px`,
                      minWidth: '20px'
                    }}
                    title={`${panel.name}: ${panel.width}ft`}
                  >
                    {getPanelAbbreviation(panel.name)}
                  </div>
                ))}
                {panels.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">Add panels to see preview</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-3 text-xs text-gray-600">
                Total Width: {getTotalWidth()} ft
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Options */}
        {/* <div>
          <h4 className="font-medium text-charcoal mb-3">Advanced Options</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="streetTrees"
                checked={advancedOptions.streetTrees}
                onCheckedChange={(checked) => 
                  handleAdvancedOptionChange('streetTrees', checked as boolean)
                }
              />
              <Label htmlFor="streetTrees" className="text-sm">
                Include street trees
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="buildingFacades"
                checked={advancedOptions.buildingFacades}
                onCheckedChange={(checked) => 
                  handleAdvancedOptionChange('buildingFacades', checked as boolean)
                }
              />
              <Label htmlFor="buildingFacades" className="text-sm">
                Show building facades
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pedestriansVehicles"
                checked={advancedOptions.pedestriansVehicles}
                onCheckedChange={(checked) => 
                  handleAdvancedOptionChange('pedestriansVehicles', checked as boolean)
                }
              />
              <Label htmlFor="pedestriansVehicles" className="text-sm">
                Add pedestrians & vehicles
              </Label>
            </div>
          </div>
        </div>*/}

        {/* Theme Info */}
        <Card className="bg-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Current Theme</p>
                <p className="text-xs text-gray-600 capitalize">{selectedTheme} style</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Panels: {panels.length}</p>
                <p className="text-xs text-gray-600">Width: {getTotalWidth()}ft</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

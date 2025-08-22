import Navbar from "@/components/navbar";
//import ImageGenerator from "@/components/designer/image-generator";
//import SectionBuilder from "@/components/designer/section-builder";
import { useState } from "react";

export interface CrossSectionPanel {
  id: string;
  name: string;
  width: number;
  material: string;
  use: string;
  category: string;
}

export default function Designer() {
  const [panels, setPanels] = useState<CrossSectionPanel[]>([
    {
      id: "1",
      name: "Sidewalk",
      width: 8,
      material: "concrete",
      use: "pedestrian",
      category: "pedestrian"
    },
    {
      id: "2", 
      name: "Bike Lane",
      width: 6,
      material: "asphalt",
      use: "cycling",
      category: "cycling"
    },
    {
      id: "3",
      name: "Travel Lane",
      width: 12,
      material: "asphalt", 
      use: "vehicle",
      category: "vehicle"
    }
  ]);
  
  const [selectedTheme, setSelectedTheme] = useState("modern");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Designer View</h1>
        <p className="text-gray-600">Urban design visualization tools.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Image Generation Panel */}
        <ImageGenerator 
          panels={panels}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />

        {/* Section Builder Panel */}
        <SectionBuilder 
          panels={panels}
          setPanels={setPanels}
          selectedTheme={selectedTheme}
        />
      </div>
    </div>
  );
}

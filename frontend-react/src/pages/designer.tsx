import { useState, useEffect } from "react";
import { useLocation } from 'wouter';
import Navbar from "@/components/navbar";
import ImageGenerator from "@/components/designer/image-generator";
import SectionBuilder from "@/components/designer/section-builder";
import type { CrossSectionPanel } from "@/lib/designerUtils";
import { useAuthStore } from "@/store/auth";

export default function Designer() {

  // Check authentication
  const { isAuthenticated } = useAuthStore();
    const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated]);

  const [units, setUnits] = useState<string>("Feet");
  const [panels, setPanels] = useState<CrossSectionPanel[]>([
    {
      id: "1",
      position: 1,
      name: "Sidewalk",
      width: 8,
      material: "concrete",
      use: "pedestrian",
      category: "pedestrian",
      comments: ""
    },
    {
      id: "2", 
      position: 2,
      name: "Bike Lane",
      width: 6,
      material: "asphalt",
      use: "cycling",
      category: "cycling",
      comments: ""
    },
    {
      id: "3",
      position: 3,
      name: "Travel Lane",
      width: 12,
      material: "asphalt", 
      use: "vehicle",
      category: "vehicle",
      comments: ""
    }
  ]);
  
  const [selectedTheme, setSelectedTheme] = useState("modern");

  /*return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Designer View</h1>
        <p className="text-gray-600">Urban design visualization tools.</p>
      </div>
    </div>
  );*/

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Image Generation Panel */}
        <ImageGenerator 
          panels={panels}
          units={units}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />

        {/* Section Builder Panel */}
        <SectionBuilder 
          panels={panels}
          units={units}
          setUnits={setUnits}
          setPanels={setPanels}
          selectedTheme={selectedTheme}
        />
      </div>
    </div>
  );
}

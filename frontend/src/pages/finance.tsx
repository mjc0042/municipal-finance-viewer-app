import { useState } from "react";
import Navbar from "@/components/navbar";
//import FinanceMap from "@/components/finance/map";
//import FinanceSidebar from "@/components/finance/sidebar";
//import FinanceCharts from "@/components/finance/charts";
//import { Municipality } from "@shared/schema";

export default function Finance() {
  //const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorBy, setColorBy] = useState("revenuePerAcre");


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-charcoal mb-4">Finance View</h1>
        <p className="text-gray-600">Municipal finance analysis and mapping interface.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <FinanceSidebar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          colorBy={colorBy}
          setColorBy={setColorBy}
          selectedMunicipality={selectedMunicipality}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="flex-1 relative">
            <FinanceMap 
              selectedMunicipality={selectedMunicipality}
              setSelectedMunicipality={setSelectedMunicipality}
              searchQuery={searchQuery}
              colorBy={colorBy}
            />
          </div>

          {/* Charts */}
          <div className="h-80 bg-white border-t border-gray-200">
            <FinanceCharts selectedMunicipality={selectedMunicipality} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useLocation } from 'wouter';
import Navbar from "@/components/navbar";
import FinanceMap from "@/components/finance/map";
import FinanceData from "@/components/finance/data";
import FinanceSidebar from "@/components/finance/sidebar";
import FinanceCharts from "@/components/finance/charts";
import type { MunicipalityListItem } from "@/components/finance/sidebar";
import { useAuthStore } from "@/store/auth";
import { useFullFinanceStore } from "@/store/finance";
import type { StateInfo } from "@/store/types";
import { financialApi } from "@/http/financial/api";
import type { StateBoundary } from "@/http/financial/types/gis";

export default function Finance() {

  // Check authentication
  const { isAuthenticated } = useAuthStore();
    const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated]);

  //const [stateBoundaries, setStateBoundaries] = useState<StateBoundary[]>([]);
  const [stateNames, setStateNames] = useState<StateInfo[]>([]);
  const [stateMunicipalities, setStateMunicipalities] = useState<MunicipalityListItem[]>([]);
  const [showFinancialData, setShowFinancialData] = useState<boolean>(true);

  const { 
    selectedState, setSelectedState, municipalBoundaries, 
    selectedMunicipalityFinances, setSelectedMunicipality, 
    selectedMunicipalityFeature } = useFullFinanceStore();

  // Get most recent data for municipality
  const recentYearMunicipalityFinancialData = useMemo(() => {
      if (!selectedMunicipalityFinances || selectedMunicipalityFinances.length === 0) return null;
      // Get the finance with the latest year
      return selectedMunicipalityFinances.reduce((latest, curr) =>
        curr.year > latest.year ? curr : latest,
        selectedMunicipalityFinances[0]
      );
    }, [selectedMunicipalityFinances]);

  //const [colorBy, setColorBy] = useState("revenuePerAcre");

  // Get initial state boundary GIS data
  useEffect(() => {
    async function fetchStateBoundaries() {
      try {
        const result = await financialApi.getStateBoundaries();
        //setStateBoundaries(result);

        // Extract names from the list
        const stateNames = result.map(boundary => (
          { name: boundary.name, abbr: boundary.stusps, code: boundary.statefp })).sort(
            (a, b) => a.name.localeCompare(b.name));;
        setStateNames(stateNames);
      } catch (error) {
        console.error("Failed to fetch state boundaries", error);
      }
    }
    fetchStateBoundaries();
  }, []);

  // Update municipality data on state selection
  useEffect(() => {
    if (municipalBoundaries && Array.isArray(municipalBoundaries.features) && municipalBoundaries.features.length > 0) {
      const municipalityList = municipalBoundaries.features.map(m => ({
        id: m.id,
        name: m.properties.municipal_name,
        county: m.properties.county_name,
        code: m.properties.fips_code,
        mid: m.properties.mid
      })).sort((a,b) => a.name.localeCompare(b.name))
      setStateMunicipalities(municipalityList);
    } else {
      setStateMunicipalities([]); // Clear if empty or undefined
    }
  }, [municipalBoundaries]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">

        {/* Sidebar */}
        <FinanceSidebar
          stateNames={stateNames}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          stateMunicipalities={stateMunicipalities}
          setSelectedMunicipality={setSelectedMunicipality}
          //colorBy={colorBy}
          //setColorBy={setColorBy}
          selectedMunicipalityFinances={selectedMunicipalityFinances}
        />

        {/* Middle column with toggle view */}
        { selectedMunicipalityFinances && selectedMunicipalityFinances?.length > 0 && (
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <h3 className="p-3 flex text-lg font-bold text-gray-900">
            {selectedMunicipalityFeature?.properties.municipal_name ?? recentYearMunicipalityFinancialData?.name}
            {selectedMunicipalityFeature?.properties.state ? `, ${selectedMunicipalityFeature.properties.state}` : null}
            <span className="text-gray-500 font-normal ml-2">({recentYearMunicipalityFinancialData?.year})</span>
          </h3>
          {/* Simple toggle buttons */}
          <div className="p-3 bg-white flex space-x-4 ">
            <button
              className={`px-3 py-2 font-bold rounded cursor-pointer ${showFinancialData ? 'text-teal-500' : 'text-gray-400'}`}
              onClick={() => setShowFinancialData(true)}
            >
              Data
            </button>
            <button
              className={`px-3 py-2 font-bold rounded cursor-pointer ${!showFinancialData ? 'text-teal-500' : 'text-gray-400'}`}
              onClick={() => setShowFinancialData(false)}
            >
              Charts
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-white">
            {showFinancialData && recentYearMunicipalityFinancialData && (
              <FinanceData
                selectedMunicipalityFeature={selectedMunicipalityFeature}
                selectedMunicipalityFinances={recentYearMunicipalityFinancialData}
              />
            )}
            {!showFinancialData && selectedMunicipalityFinances && (
              <FinanceCharts
                selectedMunicipalityFinances={selectedMunicipalityFinances}
                name={selectedMunicipalityFeature?.properties.municipal_name}
                state={selectedMunicipalityFeature?.properties.state}
              />
            )}
          </div>
        </div>
        )}


        {/* Main Content */}
        <div className="flex-2 flex flex-col">
          {/* Map */}
          <div className="flex-1 relative">
            <FinanceMap 
              municipalBoundaries={municipalBoundaries}
              setSelectedMunicipality={setSelectedMunicipality}
              selectedMunicipalityFinances={recentYearMunicipalityFinancialData}
              selectedMunicipalityFeature={selectedMunicipalityFeature}
              //searchQuery={searchQuery}
              //colorBy={colorBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

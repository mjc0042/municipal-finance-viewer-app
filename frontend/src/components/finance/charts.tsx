import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, GitCompare } from "lucide-react";
import type { MunicipalityFinance } from "@/http/financial/types/types";
import LineChart from "@/components/finance/linechart";

interface FinanceChartsProps {
  selectedMunicipalityFinances: MunicipalityFinance[] | null;
  name: string | undefined;
  state: string | undefined;
}

interface ChartData {
  years: number[];
  netPositionData: number[];
  financialAssetsLiabilitiesData: number[];
  totalAssetsLiabilitiesData: number[];
  debtRevenueData: number[];
  interestRevenueData: number[];
  bookValueCapitalAssets: number[];
  govTransfersRevData: number[];
}

export default function FinanceCharts({ 
  selectedMunicipalityFinances: finances, name, state }: FinanceChartsProps) {

    const [chartData, setChartData] = useState<ChartData>({
      years: [],
      netPositionData: [],
      financialAssetsLiabilitiesData: [],
      totalAssetsLiabilitiesData: [],
      debtRevenueData: [],
      interestRevenueData: [],
      bookValueCapitalAssets: [],
      govTransfersRevData: []
    });

  // Update charts when municipality changes
  useEffect(() => {
    if (!finances || finances.length === 0) {
      // Show default/placeholder charts
      updateCharts(null);
      return;
    }

    updateCharts(finances);
  }, [finances]);

  // Element-wise subtraction of arrays
  const subtractArrays = (a: number[], b: number[]): number[] =>
    a.map((val, i) => val - (b[i] ?? 0));

  // Element-wise addition of arrays
  const addArrays = (a: number[], b: number[]): number[] =>
    a.map((val, i) => val + (b[i] ?? 0));
  
  // Element-wise division of arrays
  const divideArrays = function (numArr:number[], denArr:number[]) {
    if (!numArr || !denArr || numArr.length !== denArr.length) {
      throw new Error("Arrays must be defined and have the same length");
    }
    return numArr.map((num:number, i:number) => {
      if (denArr[i] === 0) {
        return 0;
      }
      return num / denArr[i];
    });
  }

  // Assets over time as a line chart
  const updateCharts = (finances: MunicipalityFinance[] | null) => {

    if (!finances || finances.length === 0) return;

    const sorted = [...finances].sort((a, b) => a.year - b.year);
    const years = sorted.map((f) => f.year);

    const currentAssets = sorted.map((f) => Number(f.current_assets) || 0);
    const liabilities = sorted.map((f) => Number(f.liabilities) || 0);
    const deferredInflows = sorted.map((f) => Number(f.deferred_inflows) || 0);
    const totalLiabilities = addArrays(liabilities, deferredInflows);
    const totalRevenues = sorted.map((f) => Number(f.total_revenues) || 0);

    // netPositionData = current assets - total liabilities
    const netPositionData = subtractArrays(currentAssets, totalLiabilities);

    // financialAssetsLiabilitiesData = current_assets / total liabilities (avoid zero div)
    const financialAssetsLiabilitiesData = divideArrays(currentAssets, totalLiabilities);

    // totalAssetsLiabilitiesData = (total assets + deferred outflows) / total liabilities
    const totalAssets = sorted.map((f) => (Number(f.total_assets) || 0) / 1e9);
    const deferredOutflows = sorted.map((f) => (Number(f.deferred_outflows) || 0) / 1e9);
    const totalAssetsPlusOutflows = addArrays(totalAssets, deferredOutflows);
    const totalAssetsLiabilitiesData = divideArrays(totalAssetsPlusOutflows, totalLiabilities);

    // debtRevenueData = if netPosition < 0 then netPosition / total revenues else 0
    const debtRevenueData = netPositionData.map((val, i) =>
      val < 0 && totalRevenues[i] !== 0 ? val / totalRevenues[i] : 0
    );
    
    // interestRevenueData = interest charges / total revenues
    const interestCharges = sorted.map((f) => Number(f.interest_charges) || 0);
    const interestRevenueData = divideArrays(interestCharges, totalRevenues);

    // Total cost of capital Assets
    const govAssetsNotDep = sorted.map((f) => Number(f.government_assets_not_being_depreciated) || 0);
    const govAssetsDep = sorted.map((f) => Number(f.government_assets_being_depreciated) || 0);
    const govAssetsOther = sorted.map((f) => Number(f.government_assets_other) || 0);
    const busAssetsNotDep = sorted.map((f) => Number(f.business_type_assets_not_being_depreciated_total) || 0);
    const busAssetsDep = sorted.map((f) => Number(f.business_type_assets_being_depreciated_total) || 0);
    const totalCostCapitalAssets = addArrays(
      addArrays(
        addArrays(govAssetsNotDep, govAssetsDep),
        addArrays(govAssetsOther, busAssetsNotDep)
      ),
      busAssetsDep
    );

    // bookValueCapitalAssets = capital assets / total cost of capital assets
    const capitalAssets = sorted.map((f) => Number(f.capital_assets) || 0);
    const bookValueCapitalAssets = divideArrays(capitalAssets, totalCostCapitalAssets);

    // govTransfersRevData = total govt transfers / total revenues
    const operatingGrants = sorted.map((f) => Number(f.operating_grants) || 0);
    const capitalGrants = sorted.map((f) => Number(f.capital_grants) || 0);
    const totalGovernmentTransfers = addArrays(operatingGrants, capitalGrants);
    const govTransfersRevData = divideArrays(totalGovernmentTransfers, totalRevenues);
    
    // Update all chart data at once
    setChartData({
      years,
      netPositionData,
      financialAssetsLiabilitiesData,
      totalAssetsLiabilitiesData,
      debtRevenueData,
      interestRevenueData,
      bookValueCapitalAssets,
      govTransfersRevData
    });
  };

  const handleDownload = () => {
    // TODO: Implement chart download functionality
    console.log('Downloading charts...');
  };

  return (
    <div className="relative w-full h-full bg-white/90 p-3 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={handleDownload}
            className="text-sm border text-gray-200"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <div className="">
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.netPositionData} title="Net Financial Position" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.financialAssetsLiabilitiesData} title="Financial Assets to Liabilities" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.totalAssetsLiabilitiesData} title="Total Assets to Liabilities" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.debtRevenueData} title="Debt to Revenue" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.interestRevenueData} title="Interest to Revenue" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.bookValueCapitalAssets} title="Net Book Value to Cost of Capital Assets" />
        </div>
        <div className="w-full h-64">
          <LineChart xDataSeries={chartData.years} yDataSeries={chartData.govTransfersRevData} title="Government Transfers to Revenue" />
        </div>
      </div>
    </div>
  );
}

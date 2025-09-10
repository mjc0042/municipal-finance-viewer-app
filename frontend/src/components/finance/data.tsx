import { useEffect } from "react";
import type { MunicipalityFinance } from "@/http/financial/types/types";
import type { MunicipalFeature } from "@/http/financial/types/gis";

interface FinanceDataProps {
  selectedMunicipalityFinances: MunicipalityFinance | null;
  selectedMunicipalityFeature: MunicipalFeature | null;
}

export default function FinanceData({
  selectedMunicipalityFinances: finances,
  selectedMunicipalityFeature: feature,
}: FinanceDataProps) {
  

  if (!finances) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="text-gray-500">No finance data.</span>
      </div>
    );
  }

  useEffect(() => {}, []);

  

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

  // Helper to show label/value with default when no value is present
  const DataRow = ({
    label,
    value,
    formatter = (v: any) => v ?? "N/A",
  }: {
    label: string;
    value: any;
    formatter?: (v: any) => string;
  }) => (
    <div className="flex justify-between py-0.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium text-sm">{formatter(value)}</span>
    </div>
  );
 
  return (
    <div className="relative w-full h-full bg-white/90 p-3 max-w-lg mx-auto">
      <div className="mb-4">
        <DataRow label="Population" value={finances.population} formatter={formatNumber} />
        <DataRow label="Per Capita Income" value={finances.per_capita_income} formatter={formatCurrency} />
        {/*<DataRow label="Housing Units" value={""} formatter={formatNumber} />*/}
        <DataRow label="Population Density" value={finances.population/feature.properties.sq_mi ?? -1} formatter={formatNumber} />
        {/*<DataRow label="% Working Age" value={f.percent_working_age} />
        <DataRow label="% School Age" value={f.percent_school_age} />
        <DataRow label="Schools" value={f.sc} />*/}
        <DataRow label="Park Facilities" value={finances.parks} />
        <DataRow label="Land Area (sq mi)" value={feature?.properties.sq_mi} formatter={formatNumber}/>
        {/*<DataRow label="Road Density" value={f.road_density} />*/}
      </div>

      <div className="border-t border-gray-200 my-3"></div>
      <div className="mb-4">
        <h4 className="font-semibold mb-1 text-gray-700">Net Position</h4>
        <DataRow label="Current Assets" value={finances.current_assets} formatter={formatCurrency} />
        <DataRow label="Capital Assets" value={finances.capital_assets} formatter={formatCurrency} />
        <DataRow label="Total Assets" value={finances.total_assets} formatter={formatCurrency} />
        <DataRow label="Deferred Outflows" value={finances.deferred_outflows} formatter={formatCurrency} />
        <DataRow label="Liabilities" value={finances.liabilities} formatter={formatCurrency} />
        <DataRow label="Deferred Outflows" value={finances.deferred_inflows} formatter={formatCurrency} />
        <div className="flex justify-between py-0.5"></div>
        <DataRow label="Total Revenues" value={finances.total_revenues} formatter={formatCurrency} />
        <DataRow label="Operating Grants" value={finances.operating_grants} formatter={formatCurrency} />
        <DataRow label="Capital Grants" value={finances.capital_grants} formatter={formatCurrency} />
        <DataRow label="Interest Charges" value={finances.interest_charges} formatter={formatCurrency} />
        <div className="flex justify-between py-0.5"></div>
        <DataRow label="Taxable Assessed Value" value={finances.taxable_assessed_value} formatter={formatCurrency} />
        <DataRow label="Property Tax Revenue" value={finances.property_taxes_levied} formatter={formatCurrency} />

        <h4 className="font-semibold mb-1 text-gray-700">Debt</h4>
        <DataRow label="Debt (General)" value={finances.debt} formatter={formatCurrency} />
        <DataRow label="Debt (Total Primary Government)" value={finances.debt_total_primary_government} formatter={formatCurrency} />
      </div>

      <div className="border-t border-gray-200 my-3"></div>
      <div className="mb-4">
        <h4 className="font-semibold mb-1 text-gray-700">Infrastructure</h4>
        <DataRow label="Street Miles" value={finances.street_miles} formatter={formatNumber} />
        <DataRow label="Sewer Miles" value={finances.sewer_miles} formatter={formatNumber} />
        <DataRow label="Water Main Miles" value={finances.water_main_miles} formatter={formatNumber} />
        {/*<DataRow label="Cul de sacs" value={} formatter={formatNumber} />
        <DataRow label="Estimated Annual Road Maintenance Costs" value={""} formatter={formatCurrency} />
        <DataRow label="Estimated Annualized Debt Service (roads)" value={""} formatter={formatCurrency} />*/}
      </div>
      <div className="border-t border-gray-200 my-3"></div>
      <div className="mb-4">
        <h4 className="font-semibold mb-1 text-gray-700">Staffing</h4>
        <DataRow label="Police (Civilian/Non-civilian)" value={finances.police_force} formatter={formatNumber} />
        <DataRow label="Fire Dept." value={finances.fire_dept} formatter={formatNumber} />
        <DataRow label="Total Employees" value={finances.total_employees} formatter={formatNumber} />
        {/*<DataRow label="Officers Demanded" value={f.officers_demanded} formatter={formatNumber} />
        <DataRow label="Officers per Acre" value={f.officers_per_acre} formatter={formatNumber} />
        <DataRow label="Total Crime Index" value={f.total_crime_index} formatter={formatNumber} />*/}
      </div>
      <div className="border-t border-gray-200 my-3"></div>
      <div className="mb-4">
        <h4 className="font-semibold mb-1 text-gray-700">Principal Employers</h4>
        {finances.principal_employers?.split('+').map((employer, idx) => (
          <span key={idx} className="flex text-sm text-gray-600">{employer}</span>
        ))}
      </div>

      {/* Add more fields as desired using above pattern, grouped as makes sense */}
    </div>
  );
}

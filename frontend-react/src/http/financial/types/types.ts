export interface MunicipalityFinance {
  mid: string; // UUID string
  name: string;
  year: number;

  current_assets: number;
  capital_assets: number;
  total_assets: number;
  deferred_outflows: number;
  debt: number;
  liabilities: number;
  deferred_inflows: number;
  total_revenues: number;
  operating_grants: number;
  capital_grants: number;
  interest_charges: number;

  component_units?: string;

  government_assets_not_being_depreciated: number;
  government_assets_being_depreciated: number;
  government_assets_other: number;
  business_type_assets_not_being_depreciated_total: number;
  business_type_assets_being_depreciated_total: number;
  component_unit_assets_not_being_depreciated: number;
  component_unit_assets_being_depreciated: number;
  component_unit_assets_other: number;

  net_book_total_capital_assets: number;

  de_general: number;
  de_infrastructure: number;
  de_public_safety: number;
  de_health: number;
  de_housing: number;
  de_recreation: number;
  de_utilities: number;
  de_airport: number;
  de_other: number;

  taxable_assessed_value: number;
  property_taxes_levied: number;

  pension_bonds: number;
  water_revenue_bonds: number;
  total_utility_bonds: number;
  airport_bonds: number;
  debt_governmental_activities: number;
  debt_business_activities: number;
  debt_total_primary_government: number;
  general_obligation_bonds: number;
  population: number;
  per_capita_income: number;

  principal_employers: string;

  police_force: number;
  fire_dept: number;
  total_employees: number;
  street_repair_miles: number;
  water_main_breaks: number;
  water_daily_pumpage_gallons_million: number;
  sewer_repairs: number;

  parks: number;
  street_miles: number;
  sewer_miles: number;
  water_main_miles: number;

  modifier: string;
  created_at: string; // ISO timestamp
}
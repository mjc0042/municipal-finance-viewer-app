import random
import uuid
import datetime
from decimal import Decimal, ROUND_HALF_UP
from copy import deepcopy

SAMPLE_FINANCIAL_DATA = {
    "mid": uuid.uuid4(),
    "year": 2025,
    "current_assets": Decimal("1234567.89"),
    "capital_assets": Decimal("2345678.90"),
    "total_assets": Decimal("3580246.79"),
    "deferred_outflows": Decimal("12345.67"),
    "debt": Decimal("765432.10"),
    "liabilities": Decimal("456789.12"),
    "deferred_inflows": Decimal("23456.78"),
    "total_revenues": Decimal("9876543.21"),
    "operating_grants": Decimal("345678.90"),
    "capital_grants": Decimal("456789.12"),
    "interest_charges": Decimal("12345.67"),
    "component_units": "Sample Component Units",
    "government_assets_not_being_depreciated": Decimal("1000000.00"),
    "government_assets_being_depreciated": Decimal("500000.00"),
    "government_assets_other": Decimal("200000.00"),
    "business_type_assets_not_being_depreciated_total": Decimal("150000.00"),
    "business_type_assets_being_depreciated_total": Decimal("350000.00"),
    "component_unit_assets_not_being_depreciated": Decimal("250000.00"),
    "component_unit_assets_being_depreciated": Decimal("150000.00"),
    "component_unit_assets_other": Decimal("100000.00"),
    "net_book_total_capital_assets": Decimal("1750000.00"),
    "de_general": Decimal("10000.00"),
    "de_infrastructure": Decimal("15000.00"),
    "de_public_safety": Decimal("12000.00"),
    "de_health": Decimal("8000.00"),
    "de_housing": Decimal("7000.00"),
    "de_recreation": Decimal("6000.00"),
    "de_utilities": Decimal("9000.00"),
    "de_airport": Decimal("4000.00"),
    "de_other": Decimal("3000.00"),
    "taxable_assessed_value": Decimal("20000000.00"),
    "property_taxes_levied": Decimal("1500000.00"),
    "pension_bonds": Decimal("500000.00"),
    "water_revenue_bonds": Decimal("300000.00"),
    "total_utility_bonds": Decimal("200000.00"),
    "airport_bonds": Decimal("250000.00"),
    "debt_governmental_activities": Decimal("400000.00"),
    "debt_business_activities": Decimal("350000.00"),
    "debt_total_primary_government": Decimal("750000.00"),
    "general_obligation_bonds": Decimal("600000.00"),
    "population": Decimal("100000"),
    "per_capita_income": Decimal("45000.00"),
    "principal_employers": "Acme Corp, Beta LLC, Gamma Inc.",
    "police_force": 200,
    "fire_dept": 150,
    "total_employees": 5000,
    "street_repair_miles": Decimal("120.5"),
    "water_main_breaks": 12,
    "water_daily_pumpage_gallons_million": Decimal("50.5"),
    "sewer_repairs": Decimal("700.25"),
    "parks": 45,
    "street_miles": Decimal("350.5"),
    "sewer_miles": Decimal("600.5"),
    "water_main_miles": Decimal("400.5"),
    "modifier": "auto",
    "created_at": datetime.datetime.now(),
}

def randomize_value(val):
    """Randomly adjust a numeric value by ±8%."""
    if isinstance(val, Decimal):
        pct = Decimal(str(random.uniform(-0.08, 0.08)))
        newval = val + val * pct
        # Round to 2 decimal places for money, 4 for other
        return newval.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    elif isinstance(val, int):
        pct = random.uniform(-0.08, 0.08)
        return max(int(val + val * pct), 0)
    elif isinstance(val, float):
        pct = random.uniform(-0.08, 0.08)
        return val + val * pct
    else:
        return val  # Non-numerics left as is

def generate_historic_financials(start_year=2025, num_years=10) -> list:
    data = []
    last = deepcopy(SAMPLE_FINANCIAL_DATA)
    for year in range(start_year, start_year - num_years, -1):
        entry = {}
        for k, v in last.items():
            if k == "year":
                entry[k] = year
            elif k == "mid":
                entry[k] = uuid.uuid4()
            elif k == "created_at":
                entry[k] = datetime.datetime.now()
            else:
                entry[k] = randomize_value(v)
        data.append(entry)
        last = entry
    return data


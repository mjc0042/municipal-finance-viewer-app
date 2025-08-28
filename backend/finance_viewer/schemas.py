""" Schemas for financial API rest calls """
import datetime

from decimal import Decimal
from typing import Optional
from uuid import UUID

from ninja import Schema
#from djantic import ModelSchema # isn't update for pydantic v2


class StateBoundaryResponse(Schema):
    id: int
    statefp: Optional[str]
    statens: Optional[str]
    geoidfq: Optional[str]
    geoid: Optional[str]
    stusps: Optional[str]
    name: Optional[str]
    lsad: Optional[str]
    aland: Optional[int]
    awater: Optional[int]
    geometry: dict

class MunicipalBoundaryResponse(Schema):
    id: int
    municipal_name: str
    municipal_code: Optional[str]
    municipal_type: Optional[str]
    county_name: Optional[str]
    state: str
    gnis_id: Optional[str]
    fips_code: Optional[str]
    fips_name: Optional[str]
    pop_1990: Optional[int]
    pop_2000: Optional[int]
    pop_2010: Optional[int]
    pop_2020: Optional[int]
    sq_mi: Optional[float]

class MunicipalityFinance(Schema):
    mid: UUID
    year: int

    # Base Financial Fields
    current_assets: Decimal
    capital_assets: Decimal
    total_assets: Decimal
    deferred_outflows: Decimal
    debt: Decimal
    liabilities: Decimal
    deferred_inflows: Decimal
    total_revenues: Decimal
    operating_grants: Decimal
    capital_grants: Decimal
    interest_charges: Decimal

    component_units: Optional[str]

    # Asset Breakdown Fields
    government_assets_not_being_depreciated: Decimal
    government_assets_being_depreciated: Decimal
    government_assets_other: Decimal
    business_type_assets_not_being_depreciated_total: Decimal
    business_type_assets_being_depreciated_total: Decimal
    component_unit_assets_not_being_depreciated: Decimal
    component_unit_assets_being_depreciated: Decimal
    component_unit_assets_other: Decimal

    net_book_total_capital_assets: Decimal

    # Depreciating Assets
    de_general: Decimal
    de_infrastructure: Decimal
    de_public_safety: Decimal
    de_health: Decimal
    de_housing: Decimal
    de_recreation: Decimal
    de_utilities: Decimal
    de_airport: Decimal
    de_other: Decimal

    # Statistical Section values
    taxable_assessed_value: Decimal
    property_taxes_levied: Decimal

    pension_bonds: Decimal
    water_revenue_bonds: Decimal
    total_utility_bonds: Decimal
    airport_bonds: Decimal
    debt_governmental_activities: Decimal
    debt_business_activities: Decimal
    debt_total_primary_government: Decimal
    general_obligation_bonds: Decimal
    population: Decimal
    per_capita_income: Decimal

    principal_employers: Optional[str]

    police_force: int
    fire_dept: int
    total_employees: int
    street_repair_miles: Decimal
    water_main_breaks: int
    water_daily_pumpage_gallons_million: Decimal
    sewer_repairs: Decimal
    parks: int
    street_miles: Decimal
    sewer_miles: Decimal
    water_main_miles: Decimal

    modifier: str
    created_at: datetime.datetime
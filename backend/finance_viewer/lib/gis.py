""" Module for handling GIS data queries """

import json

from django.core.serializers import serialize
from django.db.models import Q
from django.db.models.functions import Substr

from finance_viewer.models.municipal_finance import Municipalities
from finance_viewer.models.gis_boundaries import MunicipalBoundaries

def query_state_municipalities(state_abbr:str):
    """ Get state's municipal boundaries
    
    Args:
        state_abbr (str): State abbreviation
    Returns:
        Municipal Boundaries
    """
    return Municipalities.objects.using('municipal_finance').filter(
        state=state_abbr.upper()
    ).values_list('county_fips', 'name', 'mid')

def query_state_municipal_boundaries(state_abbr:str, state_municipalities) -> object:
    """ Get state's municipal boundaries
    
    Args:
        state_abbr (str): State abbreviation
    Returns:
        Municipal Boundaries
    """

    # Create filter conditions
    condition1 = Q(state=state_abbr.upper())
    condition2 = Q()
    for county_fips, name, _ in state_municipalities:
        condition2 |= Q(county_fips5=county_fips, municipal_name=name)

    # Query boundaries using combined conditions
    qs = MunicipalBoundaries.objects.using('gis_boundaries').annotate(
        county_fips5=Substr('fips_code', 1, 5)
    ).filter(condition1 & condition2)

    # Serialize boundaries
    geojson = serialize("geojson", qs, geometry_field="geometry", fields=[
        "id",
        "municipal_name",
        "municipal_code",
        "municipal_type",
        "county_name",
        "state",
        "gnis_id",
        "fips_code",
        "fips_name",
        "pop_1990",
        "pop_2000",
        "pop_2010",
        "pop_2020",
        "sq_mi"
    ])
    return json.loads(geojson)

def query_municipality_boundary(mid):
    """ Get municipality boundary GeoJSON by mid 
    
    Args:
        mid (str): Municipal ID
    Returns:
        (object) : Municipal boundary spatial data
    """

    municipality = Municipalities.objects.using('municipal_finance').filter(mid=mid).first()

    if not municipality:
        return None

    name = municipality.name
    state_abbr = municipality.state
    county_fips = municipality.county_fips

    qs = MunicipalBoundaries.objects.using('gis_boundaries').annotate(
        county_fips5=Substr('fips_code', 1, 5)
    ).filter(
        state=state_abbr,
        county_fips5=county_fips,
        municipal_name=name
    )

    geojson = serialize("geojson", qs, geometry_field="geometry", fields=[
        "id",
        "municipal_name",
        "municipal_code",
        "municipal_type",
        "county_name",
        "state",
        "gnis_id",
        "fips_code",
        "fips_name",
        "pop_1990",
        "pop_2000",
        "pop_2010",
        "pop_2020",
        "sq_mi"
    ])
    return json.loads(geojson)

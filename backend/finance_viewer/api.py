""" API calls for all financial viewer requests """
#

import datetime
import json
import uuid

from decimal import Decimal
from uuid import uuid4

from django.core.serializers import serialize
from django.db import connections
from django.db.models import Q
from django.db.models.functions import Substr
from django.http import JsonResponse
from ninja import Router
from ninja_jwt.authentication import JWTAuth

from .lib.state_utils import get_state_abreviation
from .models.municipal_finance import Municipalities, MunicipalFinances
from .models.gis_boundaries import MunicipalBoundaries, StateBoundaries
from .schemas import MunicipalityFinance, MunicipalBoundaryResponse, StateBoundaryResponse

from .fake_finance_modeller import generate_historic_financials

router = Router()

@router.get("/gis/states", response=list[StateBoundaryResponse], auth=JWTAuth())
def get_states(request):
    """ API call for retrieving state boundaries """

    qs = StateBoundaries.objects.using('gis_boundaries').all()
    geojson = serialize("geojson", qs, geometry_field="geometry", fields=[
        "id", "statefp", "statens", "geoidfq", "geoid", "stusps", "name", "lsad", "aland", "awater"
    ])
    return JsonResponse(geojson, safe=False)

@router.get("/gis/municipalities", response=list[MunicipalBoundaryResponse], auth=JWTAuth())
def get_state_municipalities(request, state_name:str, state_abbr:str, state_code:str):
    """ API call for retrieving municipal boundaries for a state 
    
        Args:
            state_name (str): State Name
            state_abbr (str): 2-letter State Abbreviation i.e. CA
            state_code (str): 2-digit state FIPS code
    """
    print("HERe1")
    # TODO: Optimize DB query
     # Get state abbreviation
    state_lookup = state_abbr if len(state_abbr) <= 2 else get_state_abreviation(state_name)
    if state_lookup is None:
        return JsonResponse({"success": False, "message": "State not available"}, status=500)
    print("Here2")

    # Get state-county FIPS, name and mid for the available municipalities
    available_munis_qs = Municipalities.objects.using('municipal_finance').filter(
        state=state_lookup.upper()
    ).values_list('county_fips', 'name', 'mid')
    muni_lookup = {(county_fips, name): mid for county_fips, name, mid in available_munis_qs}

    print(muni_lookup)

    # Create filter conditions
    condition1 = Q(state=state_lookup.upper())
    condition2 = Q()
    for county_fips, name, _ in available_munis_qs:
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
    data = json.loads(geojson)

    # Attach the correct mid to each feature record
    for feature in data['features']:
        props = feature['properties']
        county_fips5 = props.get('county_fips', '')[:5] or props.get('fips_code', '')[:5]
        mun_name = props['municipal_name']
        mid = muni_lookup.get((county_fips5, mun_name))
        props['mid'] = mid

    return JsonResponse(data, safe=False, status=200)

@router.get("/municipality/finances", response=list[MunicipalityFinance], auth=JWTAuth())
def get_municipality_finances(request, mid:str):
    """Get financial data for a municipality"""

    # For now, return sample data
    #return generate_historic_financials()

    qs = MunicipalFinances.objects.using('municipal_finance').filter(mid=mid)
    data = list(qs.values()) #serialize('json', qs)
    return JsonResponse(data, safe=False, status=200)


@router.post("/municipality/finances/add/year")
def add_municipality_yearly_finances(request):
    """ API call for adding finances for a municipality """

    data = json.loads(request.body)
    municipality_name = data.pop("municipality_name", None)
    state = data.pop("state", None)
    state_abbr = get_state_abreviation(state)
    county_fips = data.pop("county_fips", None)
    year = data.get("year")

    if not all([municipality_name, state_abbr, county_fips, year]):
        return JsonResponse({"success": False, "error": "Missing required fields"}, status=400)

    with connections['municipal_finances'].cursor() as cursor:
        # Check if municipality exists
        cursor.execute("""
            SELECT mid FROM municipalities
            WHERE name = %s AND state = %s AND county_fips = %s
        """, [municipality_name, state_abbr, county_fips])
        row = cursor.fetchone()

    if row:
        mid = row[0]

        # Check if finance record for that year exists
        exists = MunicipalFinances.objects.filter(mid=mid, year=year).exists()

        if exists:
            return JsonResponse({"success": False, "error": "Record for municipality and year already exists"}, status=400)

    else:
        # Municipality does not exist, create new mid and insert municipality
        mid = str(uuid.uuid5(uuid.NAMESPACE_URL, state_abbr + municipality_name))

        with connections['municipal_finances'].cursor() as cursor:
            cursor.execute("""
                INSERT INTO municipalities (mid, name, state, county_fips)
                VALUES (%s, %s, %s, %s)
            """, [mid, municipality_name, state_abbr, county_fips])

    # Now create the MunicipalFinanceRecord entry
    # Add mid to data to associate finance record with municipality
    data["mid"] = mid
    data["modifier"] = "user"

    # Create new finance record
    record = MunicipalFinances.objects.create(**data)

    return JsonResponse({"success": True, "message": "Record created successfully"}, status=200)

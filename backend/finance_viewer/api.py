""" API calls for all financial viewer requests """
#pylint: disable=C0301,W0718,W0613


import json
import uuid

from django.core.serializers import serialize
from django.http import JsonResponse
from ninja import Router, File
from ninja.files import UploadedFile
from ninja_jwt.authentication import JWTAuth

from .lib.finance import (
    add_municipality,
    query_all_municipalities,
    query_finances_for_municipality,
    query_mid
)
from .lib.gis import (
    query_municipality_boundary,
    query_state_municipalities,
    query_state_municipal_boundaries
)
from .lib.parcels import handle_shapefile_upload
from .lib.state_utils import get_state_abreviation
from .models.municipal_finance import MunicipalFinances
from .models.gis_boundaries import StateBoundaries
from .schemas import (
    MunicipalityFinance,
    MunicipalityInfo,
    MunicipalBoundaryResponse,
    ParcelUploadResponse,
    StateBoundaryResponse
)

# TODO: Remove
#from .fake_finance_modeller import generate_historic_financials

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

    # TODO: Optimize DB query
    # Get state abbreviation
    state_lookup = state_abbr if len(state_abbr) <= 2 else get_state_abreviation(state_name)
    if state_lookup is None:
        return JsonResponse({"success": False, "message": "State not available"}, status=500)

    # Get state-county FIPS, name and mid for the available municipalities
    available_munis_qs = query_state_municipalities(state_lookup)
    muni_lookup = {(county_fips, name): mid for county_fips, name, mid in available_munis_qs}

    data = query_state_municipal_boundaries(state_lookup, available_munis_qs)

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

    try:

        data = query_finances_for_municipality(mid)
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        print(e)
        return JsonResponse({"success": False, "error": "Unable to retrieve finances"}, status=400)


@router.get("/municipality/list", response=list[MunicipalityInfo], auth=JWTAuth())
def get_municipality_list(request):
    """Get list of all municipalities"""

    try:
        data = query_all_municipalities()
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        print(e)
        return JsonResponse({"success": False, "error": "Unable to fetch municipalities"}, status=400)


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

    mid = query_mid(municipality_name, state_abbr, county_fips)

    if mid:

        # Check if finance record for that year exists
        exists = MunicipalFinances.objects.filter(mid=mid, year=year).exists()

        if exists:
            return JsonResponse(
                {
                    "success": False,
                    "error": "Record for municipality and year already exists"
                },
                status=400)
    else:
        # Municipality does not exist, create new mid and insert municipality
        mid = str(uuid.uuid5(uuid.NAMESPACE_URL, state_abbr + municipality_name))
        add_municipality(mid, municipality_name, state_abbr, county_fips)

    # Now create the MunicipalFinanceRecord entry
    # Add mid to data to associate finance record with municipality
    data["mid"] = mid
    data["modifier"] = "user"

    # Create new finance record
    MunicipalFinances.objects.create(**data)

    return JsonResponse({"success": True, "message": "Record created successfully"}, status=200)

@router.post("/gis/municipality/parcels", response=ParcelUploadResponse, auth=JWTAuth())
def upload_parcel_data(request, file:File[UploadedFile], mid:str):
    """ Upload and process parcel shapefile """

    if not file or not file.file:
        return JsonResponse({ "success": False, "error": "No upload was received."}, status=400)

    if not mid or mid == "":
        return JsonResponse({ "success": False, "error": "Error processing parcel file upload." })

    try:
        municipal_boundary = query_municipality_boundary(mid)

        extracted = handle_shapefile_upload(
            file.file,
            municipal_boundary)

        return JsonResponse(extracted, status=200)
    except Exception as e:
        return JsonResponse(
            {
                "success": False,
                "error": str(e)
            },
            status=400)

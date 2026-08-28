""" Module for handling finance data queries """

from django.db import connections

from .common import DatabaseName
from finance_viewer.models.municipal_finance import Municipalities, MunicipalFinances
from finance_viewer.schemas import MunicipalityInfo, MunicipalityFinance

def query_all_municipalities() -> list[MunicipalityInfo]:
    """
    Get list of all municipalities
    
    Returns:
        (list) : List of all municipalities
    """
    qs = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).all().values(
        'mid', 'name', 'state', 'county_fips'
    )
    data = []
    for row in qs:
        fips = row['county_fips'] or ''
        data.append({
            'mid': str(row['mid']),
            'name': row['name'],
            'state': row['state'],
            'county_fips': fips
        })
    return data

def query_mid(name, state_abbr:str, county_fips:str) -> str | None:
    """
    Query municipality mid

    Args:
        name (str): Municipality name
        state_abbr (str): State abbreviation
        county_fips (str): County 5-digit FIPS code
    Returns:
        (Municipalities): Municipality info
    """

    if not all([name, state_abbr, county_fips]):
        raise ValueError("")

    with connections[DatabaseName.MUNICIPAL_FINANCES].cursor() as cursor:
        # Check if municipality exists
        cursor.execute("""
            SELECT mid FROM municipalities
            WHERE name = %s AND state = %s AND county_fips = %s
        """, [name, state_abbr, county_fips])
        row = cursor.fetchone()

        if row:
            return row[0]

    return None

def query_finances_for_municipality(mid:str) -> list[MunicipalityFinance]:
    """ Get financial data for municipality
    
    Args:
        mid (str): Municipality ID
    Returns:
        (list): List of financial data sorted by year
    """
    if not mid or mid == '':
        raise ValueError("Unable to get finances for municipality. No mid provided.")

    qs = MunicipalFinances.objects.using(DatabaseName.MUNICIPAL_FINANCES).filter(mid=mid).order_by('year')
    return list(qs.values()) #serialize('json', qs)

def query_state_finances(state_abbr:str) -> dict[str, list[dict]]:
    """ Get all financial data for a state's municipalities

    Args:
        state_abbr (str): 2-letter State Abbreviation i.e. CA
    Returns:
        (dict): Map of mid to list of financial data sorted by year
    """
    if not state_abbr or state_abbr == '':
        raise ValueError("Unable to get finances for state. No state abbreviation provided.")

    qs = MunicipalFinances.objects.using(DatabaseName.MUNICIPAL_FINANCES).filter(
        mid__state=state_abbr.upper()
    ).order_by('mid', 'year').values()

    finances_by_mid: dict[str, list[dict]] = {}
    for row in qs:
        mid = str(row['mid_id'])
        finances_by_mid.setdefault(mid, []).append(row)
    return finances_by_mid

def add_municipality(mid:str, municipality_name:str, state_abbr:str, county_fips:str):
    """
    Add municipality information
    
    Args:
        mid (str): Municipality ID
        municipality_name (str): Municipality name
        state_abbr (str): State abbreviation
        county_fips (str): 5-digit county FIPS code
    """
    with connections[DatabaseName.MUNICIPAL_FINANCES].cursor() as cursor:
        cursor.execute("""
            INSERT INTO municipalities (mid, name, state, county_fips)
            VALUES (%s, %s, %s, %s)
        """, [mid, municipality_name, state_abbr, county_fips])

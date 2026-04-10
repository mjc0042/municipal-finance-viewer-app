""" Module for handling finance data queries """

from django.db import connections

from finance_viewer.models.municipal_finance import Municipalities, MunicipalFinances
from finance_viewer.schemas import MunicipalityInfo, MunicipalityFinance

def query_all_municipalities() -> list[MunicipalityInfo]:
    """
    Get list of all municipalities
    
    Returns:
        (list) : List of all municipalities
    """
    qs = Municipalities.objects.using('municipal_finance').all().values(
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

    with connections['municipal_finances'].cursor() as cursor:
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

    qs = MunicipalFinances.objects.using('municipal_finance').filter(mid=mid).order_by('year')
    return list(qs.values()) #serialize('json', qs)

def add_municipality(mid:str, municipality_name:str, state_abbr:str, county_fips:str):
    """
    Add municipality information
    
    Args:
        mid (str): Municipality ID
        municipality_name (str): Municipality name
        state_abbr (str): State abbreviation
        county_fips (str): 5-digit county FIPS code
    """
    with connections['municipal_finances'].cursor() as cursor:
        cursor.execute("""
            INSERT INTO municipalities (mid, name, state, county_fips)
            VALUES (%s, %s, %s, %s)
        """, [mid, municipality_name, state_abbr, county_fips])

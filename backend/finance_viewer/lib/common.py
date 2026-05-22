""" Module listing common variables """

from django.conf import settings

def get_db_name(index:int) -> str:
    """ Get Database connection name from settings """
    db_keys = list(settings.DATABASES.keys())
    return db_keys[index]

class DatabaseName:
    """ Names of databases """

    MUNICIPAL_FINANCES = get_db_name(1)
    GIS_BOUNDARIES = get_db_name(2)

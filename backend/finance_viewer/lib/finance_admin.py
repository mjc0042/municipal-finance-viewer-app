""" Module to process finance API tasks requiring admin permissions """

from datetime import datetime, timezone

from pypdf import PdfReader

from .common import DatabaseName
from finance_viewer.models.municipal_finance import MissingData, MunicipalFinances, Municipalities
from finance_viewer.models.user_updates import UserFinanceUpdatesLog

from common.database.models.missing_data import GapStatus
#from common.database.models.municipal_finances import ModifierType
from common.pdf.file_manager import get_pdf_path, get_staging_dir
from pdf_parser.parse.partial_parser import extract_text_from_pages

def update_missing_data_by_value(user_id: str, mid:str, year:int, field_name:str, gap_id:str, new_value:str) -> None:
    """
    Update missing data with new user submitted value
    
    Args:
        user_id (str): Municipality ID
        mid (str): Municipality name
        year (str): State abbreviation
        data_point (str): 5-digit county FIPS code
    """

    # Update municipal finance table for data point and and modifier column to 'user'
    finance_record = MunicipalFinances.objects.using(
        DatabaseName.MUNICIPAL_FINANCES
    ).get(mid=mid, year=year)
    old_value = getattr(finance_record, field_name, None)
    setattr(finance_record, field_name, new_value)
    finance_record.modifier = 'user'
    finance_record.save(using=DatabaseName.MUNICIPAL_FINANCES)

    update_missing_data_status(gap_id, GapStatus.CLOSED)

    # Log update by user
    UserFinanceUpdatesLog.objects.create(
        user_id=user_id,
        mid=mid,
        year=year,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        modification_time=datetime.now(timezone.utc)
    )

def update_missing_data_status(gap_id:str, status:GapStatus) -> None:

    missing_record = MissingData.objects.using(
        DatabaseName.MUNICIPAL_FINANCES
    ).get(gap_id=gap_id)
    missing_record.status = status
    missing_record.save(using=DatabaseName.MUNICIPAL_FINANCES)


def update_missing_data_by_pages(user_id:str, mid:str, year:int, field_name:str, gap_id:str, pages:str) -> str:
    """ Update missing data by """
    muncipalities = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).get(mid=mid)

    # Get PDF text
    import os
    reader = PdfReader(get_pdf_path(muncipalities.county_fips, muncipalities.name, year, directory=os.getenv("DOWNLOADS_DIR")))

    start_index = int(pages.split(",")[0])-1
    end_index = int(pages.split(",")[1])-1

    text = extract_text_from_pages(
        reader,
        str(get_staging_dir()),
        start_index,
        end_index
    )

    print(text)
    # Analyze
    #new_value = analyze()


    # Update
    #obj = MunicipalFinances.objects.get(mid=mid)
    #old_value = getattr(obj, field_name)
    #setattr(obj, field_name, new_value)
    #obj.modifier = ModifierType.USER.value

    # Update missing data table
    #missing_record = MissingData.objects.using(
    #    DatabaseName.MUNICIPAL_FINANCES
    #).get(gap_id=gap_id)
    #missing_record.status = GapStatus.IN_PROGRESS
    #missing_record.save(using=DatabaseName.MUNICIPAL_FINANCES)

    # Log update by user
    #UserFinanceUpdatesLog.objects.create(
    #    user_id=user_id,
    #    mid=mid,
    #    year=year,
    #    field_name=field_name,
    #    old_value=old_value,
    #    new_value=new_value,
    #    modification_time=datetime.now(timezone.utc)
    #)


    return None
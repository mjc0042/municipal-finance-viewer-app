""" Module to process finance API tasks requiring admin permissions """

import ast
import os
import markdown

from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from pypdf import PdfReader

from .common import DatabaseName
from finance_viewer.models.municipal_finance import MissingData, MunicipalFinances, Municipalities
from finance_viewer.models.user_updates import UserFinanceUpdatesLog

from common.database.models.missing_data import GapStatus
from common.pdf.document_processor import DocumentProcessor
from common.pdf.file_manager import get_pdf_path
from common.pdf.pdf_reader import PdfDocumentReader
from common.pdf.rotator import PDFRotator
from common.pdf.split import split_pdf_pages
from pdf_parser.extraction.text_extractor import PDFTextExtractor
from pdf_parser.parse.partial_parser import analyze_field_from_pages

def get_missing_data_gaps() -> list:
    """
    Get list of missing data records 
    
    Returns:
        (list): Missing data gap records
    """
    queryset = MissingData.objects.using(DatabaseName.MUNICIPAL_FINANCES).all()

    # Manually join since municipality_id is not a proper ForeignKey
    municipality_ids = [record.municipality_id for record in queryset]
    municipalities = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).filter(
        mid__in=municipality_ids
    )
    muni_map = {str(m.mid): m for m in municipalities}

    data = []
    for record in queryset:
        muni = muni_map.get(str(record.municipality_id))
        data.append({
            "gap_id": str(record.gap_id),
            "municipality_id": str(record.municipality_id),
            "municipality_name": muni.name if muni else None,
            "county_fips": muni.county_fips if muni else None,
            "state": muni.state if muni else None,
            "year": record.year,
            "table_name": record.table_name,
            "data_point": record.data_point,
            "section_name": record.section_name,
            "priority": record.priority,
            "optional": record.optional,
            "status": record.status,
            "pdf_page_indices": ast.literal_eval(record.pdf_page_indices),
            "markdown_context": record.markdown_context,
            "timestamp": record.timestamp.isoformat() if record.timestamp else None,
            "retry_count": record.retry_count,
            "error_message": record.error_message,
        })
    return data

def get_markdown_from_pdf_segment(mid:str, year:int, page_indices:str) -> str:
    """ Get PDF segment as simple markdown (pymupdf4llm)

    Args:
        mid (str): Municipality ID
        year (int): PDF year
        page_indices (str): Comma-joined page indices i.e. 1,2
    Returns:
        str : PDF segment markdown rendered as HTML
    Raises:
        FileNotFoundError: If PDF does not exist.
    """
    load_dotenv()

    pdf_path = _resolve_pdf_path(mid, year)

    start_page, end_page = _parse_page_indices(page_indices)

    temp_pdf_file = split_pdf_pages(PdfReader(pdf_path), os.getenv("STAGING_DIR"), start_page, end_page)
    temp_pdf_file = PDFRotator().orient_pdf(temp_pdf_file, remove_old_file=True)

    extractor = PDFTextExtractor()
    markdown_result = extractor.extract_simple_markdown(temp_pdf_file, 0, (end_page - start_page))

    if os.path.exists(temp_pdf_file):
        os.remove(temp_pdf_file)

    return markdown.markdown(markdown_result, extensions=['extra'])


def get_alt_markdown_from_pdf_segment(mid:str, year:int, page_indices:str) -> str:
    """ Get PDF segment as markdown using Docling (alternative extractor)

    Args:
        mid (str): Municipality ID
        year (int): PDF year
        page_indices (str): Comma-joined page indices i.e. 1,2
    Returns:
        str : PDF segment markdown rendered as HTML
    Raises:
        FileNotFoundError: If PDF does not exist.
    """
    load_dotenv()

    pdf_path = _resolve_pdf_path(mid, year)

    start_page, end_page = _parse_page_indices(page_indices)

    temp_pdf_file = split_pdf_pages(PdfReader(pdf_path), os.getenv("STAGING_DIR"), start_page, end_page)
    temp_pdf_file = PDFRotator().orient_pdf(temp_pdf_file, remove_old_file=True)

    processor = DocumentProcessor()
    result = processor.execute_parse_pdf(temp_pdf_file)
    markdown_result = processor.extract_text_from_output(result)

    if os.path.exists(temp_pdf_file):
        os.remove(temp_pdf_file)

    return markdown_result


def _resolve_pdf_path(mid:str, year:int) -> Path:
    """
    Resolve the PDF path for a municipality/year, raising if missing.
    
    Args:
        mid (str): Municipality ID
        year (int): Year
    Returns:
        (Path): Path to PDF
    """
    muni = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).get(mid=mid)

    pdf_path = get_pdf_path(
        muni.county_fips,
        muni.name,
        year,
        os.getenv("DOWNLOADS_DIR"))

    if not pdf_path.exists():
        raise FileNotFoundError("PDF not found")

    return pdf_path


def _parse_page_indices(page_indices:str) -> tuple[int, int]:
    """ Parse a comma-joined page index string into (start, end). """
    page_parts = page_indices.split(',')
    start_page = int(page_parts[0])
    end_page = int(page_parts[1]) if len(page_parts) > 1 else start_page
    return start_page, end_page


def update_missing_data_by_value(
        user_id: str,
        mid:str,
        year:int,
        field_name:str,
        gap_id:str,
        new_value:str) -> None:
    """
    Update missing data with new user submitted value
    
    Args:
        user_id (str): Municipality ID
        mid (str): Municipality name
        year (str): State abbreviation
        field_name (str): Database column/field name
        gap_id (str): Missing data gap ID
        new_value (str): New value to update in database for field
    Returns:
        None
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

def update_missing_data_status(gap_id:str, status:GapStatus) -> MissingData:
    """
    Update missing data gap status

    Args:
        gap_id (str): ID for missing data gap
        status (GapStatus): New status
    Returns:
        MissingData DB object
    """
    missing_record = MissingData.objects.using(
        DatabaseName.MUNICIPAL_FINANCES
    ).get(gap_id=gap_id)
    missing_record.status = status.value
    missing_record.save(using=DatabaseName.MUNICIPAL_FINANCES)
    return missing_record


def update_missing_data_by_pages(mid:str, year:int, field_name:str, gap_id:str, pages:str) -> str:
    """
    Process missing data page indices update
    
    Args:
        mid (str): Municipality ID
        year (int): PDF year
        field_name (str): Database column/field name
        gap_id (str): Missing Data gap ID
        pages (str): Comma-separated page numbers - not indices
    Returns:
        str: New value from processing
    """

    split_pages = pages.split(",")
    if len(split_pages) != 2:
        raise ValueError("Pages not specified correctly.")

    start_index = int(pages.split(",")[0])-1
    end_index = int(pages.split(",")[1])-1

    muncipalities = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).get(mid=mid)

    pdf_path = get_pdf_path(muncipalities.county_fips, muncipalities.name, year, directory=os.getenv("DOWNLOADS_DIR"))

    reader = PdfDocumentReader(pdf_path)
    if start_index >= reader.get_num_pages()-1 or end_index >= reader.get_num_pages()-1:
        raise ValueError("Pages not specified correctly.")

    new_value = analyze_field_from_pages(
        field_name,
        muncipalities.state,
        muncipalities.name,
        year,
        pdf_path,
        start_index,
        end_index
    )

    # Update missing data table
    record = update_missing_data_status(gap_id, GapStatus.IN_PROGRESS)
    if record:
        record.pdf_page_indices = [start_index, end_index]
        record.save(using=DatabaseName.MUNICIPAL_FINANCES)

    return new_value[1]

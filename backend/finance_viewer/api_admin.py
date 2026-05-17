""" Module for Finance Viewer API, admin endpoints """

import ast
import os

from pathlib import Path

from django.http import FileResponse, JsonResponse
from django.conf import settings
from django.views.decorators.clickjacking import xframe_options_sameorigin

from dotenv import load_dotenv
from ninja import Router
from ninja_jwt.authentication import JWTAuth
from pypdf import PdfReader

from .permissions import admin_required
from .models.municipal_finance import MissingData, Municipalities

from common.pdf.document_processor import DocumentProcessor
from common.pdf.rotator import PDFRotator
from common.pdf.split import split_pdf_pages

admin_router = Router()

@admin_router.get("/missing-data", auth=JWTAuth())
@admin_required
def get_missing_data(request):
    """Get all missing data records from the missing_data table"""

    try:
        queryset = MissingData.objects.using('municipal_finance').all()

        # Manually join since municipality_id is not a proper ForeignKey
        municipality_ids = [record.municipality_id for record in queryset]
        municipalities = Municipalities.objects.using('municipal_finance').filter(
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
                "status": record.status,
                "pdf_page_indices": ast.literal_eval(record.pdf_page_indices),
                "markdown_context": record.markdown_context,
                "timestamp": record.timestamp.isoformat() if record.timestamp else None,
                "retry_count": record.retry_count,
                "error_message": record.error_message,
            })

        return JsonResponse(data, safe=False, status=200)

    except Exception as e:
        print("Error fetching missing data")
        import traceback
        traceback.print_exception(e)
        return JsonResponse({"success": False, "error": "Unable to get missing financial data"}, status=400)

@admin_router.get("/missing-data/pdf-segment", auth=JWTAuth())
@admin_required
def get_missing_data_pdf_segment(request, mid: str, year: int, pages: str):
    """ Get PDF part for the missing data """

    try:
        load_dotenv()

        # Get municipality info to build PDF path
        muni = Municipalities.objects.using('municipal_finance').get(mid=mid)
        fips = muni.county_fips
        name = muni.name.lower().replace(' ', '_').title()

        pdf_path = Path(os.getenv("DOWNLOADS_DIR")) / f"acfr_{fips}_{name}_{year}.pdf"

        if not pdf_path.exists():
            return JsonResponse({"success": False, "error": "PDF not found"}, status=404)

        page_parts = pages.split(',')
        start_page = int(page_parts[0])
        end_page = int(page_parts[1]) if len(page_parts) > 1 else start_page

        temp_pdf_file = split_pdf_pages(PdfReader(str(pdf_path)), os.getenv("STAGING_DIR"), start_page, end_page)

        temp_pdf_file = PDFRotator().orient_pdf(temp_pdf_file, remove_old_file=True)

        processor = DocumentProcessor()
        result = processor.execute_parse_pdf(temp_pdf_file)
        md = processor.extract_text_from_output(result)

        if os.path.exists(temp_pdf_file):
            os.remove(temp_pdf_file)

        return JsonResponse(md, safe=False, status=200)
    except Exception as e:
        print("Error getting markup for PDF.", str(e))
        return JsonResponse({
            "success": False,
            "error": "Unable to retrieve PDF segment for the data point"
        }, status=400)

@admin_router.get("/missing-data/pdf-full", auth=JWTAuth())
@admin_required
@xframe_options_sameorigin
def get_missing_data_pdf_full(request, mid: str, year: int, ):
    """ Get PDF part for the missing data """

    try:
        load_dotenv()

        # Get municipality info to build PDF path
        muni = Municipalities.objects.using('municipal_finance').get(mid=mid)
        fips = muni.county_fips
        name = muni.name.lower().replace(' ', '_').title()

        filename = f"acfr_{fips}_{name}_{year}.pdf"
        pdf_path = Path(os.getenv("DOWNLOADS_DIR")) / filename

        if not pdf_path.exists():
            return JsonResponse({"success": False, "error": "PDF not found"}, status=404)

        #response = JsonResponse({
        #    "url": settings.MEDIA_URL + filename,
        #    "filename": filename
        #    }, safe=False, status=200)
        #del response['X-Frame-Options']
        #return response
        return FileResponse(open(pdf_path, 'rb'), filename=filename, as_attachment=False)
    except Exception as e:
        print("Error getting markup for PDF.", str(e))
        return JsonResponse({ "success": False, "error": "Unable to retrieve full PDF"}, status=400)

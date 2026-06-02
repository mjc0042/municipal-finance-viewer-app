""" Module for Finance Viewer API, admin endpoints """
#pylint: disable=C0301,W0613,W0718

import json
import os

from pathlib import Path

from django.http import FileResponse, JsonResponse
from django.views.decorators.clickjacking import xframe_options_sameorigin

from dotenv import load_dotenv
from ninja import Router
from ninja_jwt.authentication import JWTAuth

from .permissions import admin_required
from .lib import finance_admin as fa
from .lib.common import DatabaseName
from .models.municipal_finance import MissingData, Municipalities, MunicipalFinances

from common.database.models.missing_data import GapStatus

admin_router = Router()

@admin_router.get("/missing-data", auth=JWTAuth())
@admin_required
def get_missing_data(request):
    """Get all missing data records from the missing_data table"""

    try:
        return JsonResponse(fa.get_missing_data_gaps(), safe=False, status=200)

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
        return JsonResponse(
            fa.get_markdown_from_pdf_segment(mid, year, pages),
            safe=False,
            status=200)
    except FileNotFoundError as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=404)
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
        muni = Municipalities.objects.using(DatabaseName.MUNICIPAL_FINANCES).get(mid=mid)
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


@admin_router.post("/missing-data/update/value", auth=JWTAuth())
@admin_required
def update_missing_data_value(request):
    """ Update missing data field in finance data """

    data = json.loads(request.body)
    field = data.pop("field", None)
    value = data.pop("value", None)

    try:
        user_id = str(request.user.id) if hasattr(request.user, 'id') else 'unknown'

        fa.update_missing_data_by_value(
            user_id,
            data.pop("mid", None),
            int(data.pop("year", None)),
            field,
            data.pop("gapid", None),
            value)

        return JsonResponse({"success": True, "message": "Updated successful"}, status=200)
    except MunicipalFinances.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Municipality record not found"},
            status=404
        )
    except MissingData.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Missing data record not found"},
            status=404
        )
    except Exception as e:
        print(f"Error updating missing data ({field}) value to ({value}).", str(e))
        return JsonResponse({ "success": False, "error": "Unable to update value"}, status=400)

@admin_router.post("/missing-data/close", auth=JWTAuth())
@admin_required
def close_missing_data_record(request):
    """ Close missing data record """

    try:
        data = json.loads(request.body)
        fa.update_missing_data_status(data.pop("gapid"), GapStatus.CLOSED)

    except Exception as e:
        print("Error closing missing data record).", str(e))
        return JsonResponse({ "success": False, "error": "Unable to close"}, status=400)

@admin_router.post("/missing-data/update/pages", auth=JWTAuth())
@admin_required
def update_missing_data_page_indices(request):
    """ Process update missing data by adding PDF page indices """

    try:
        data = json.loads(request.body)

        value = fa.update_missing_data_by_pages(
            data.pop("mid", None),
            int(data.pop("year", None)),
            data.pop("field", None),
            data.pop("gapid", None),
            data.pop("pages", None))
        return JsonResponse({"value": value, "success": True, "message": "Updated successful"}, status=200)
    except MunicipalFinances.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Municipality record not found"},
            status=404)
    except MissingData.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Missing data record not found"},
            status=404)
    except Exception as e:
        import traceback
        print("Error processing missing data page update.", str(e))
        traceback.print_exc()
        return JsonResponse({ "success": False, "error": "Unable to process page update"}, status=400)

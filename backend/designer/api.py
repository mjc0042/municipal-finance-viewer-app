from ninja import Router
from typing import Any, Dict

router = Router()

@router.get("/")
def get_design(request):
    return "Design Page"


@router.get("/templates")
def get_design_templates(request) -> Dict[str, Any]:
    """Get available design templates"""
    return {
        "templates": [
            {"id": 1, "name": "Urban Core"},
            {"id": 2, "name": "Suburban Development"}
        ]
    }

from ninja import Router
from typing import Dict, Any

router = Router()

# Sample data for testing
SAMPLE_FINANCIAL_DATA = {
    "New York": {
        "revenue": 100000000,
        "expenses": 95000000,
        "debt": 50000000,
        "fiscal_year": 2023
    }
}

@router.get("/municipality/finances")
def municpality_finances(request, name:str, state:str) -> Dict[str, Any]:
    """Get financial data for a municipality"""
    # For now, return sample data
    return SAMPLE_FINANCIAL_DATA.get(name, {})


@router.post("/init-sample-data")
def init_sample_data(request) -> Dict[str, str]:
    """Initialize sample data"""
    return {"message": "Sample data initialized"}

from django.db import IntegrityError
from ninja.errors import ValidationError
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI

from . import schemas
from .models import CustomUser as User
from finance_viewer.api import router as finance_router
from designer.api import router as designer_router

api = NinjaExtraAPI(csrf=False)
api.register_controllers(NinjaJWTDefaultController)

@api.post("/register", response=schemas.RegisterUserResponseSchema, auth=None)
def register(request, payload: schemas.RegisterUserSchema):
    try:
        user = User.objects.create_user(
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name,
            organization=payload.organization,
            subscription_tier="none"
            )
        return api.create_response(
            user,
            {"success": True, "message": "Success"},
            status=200
        )
    except IntegrityError:
        return api.create_response(
            request,
            {"success": False, "message": "User with this email already exists"},
            status=400
        )
    except ValidationError as e:
        # Send back the validation error messages
        return api.create_response(
            request,
            {"success": False, "message": "Validation error", "errors": e.errors()},
            status=422,
        )
    except Exception as e:
        return api.create_response(
            request,
            {"success": False, "message": str(e)},
            status=400
        )

#auth_router = Router()

#@auth_router.get("/get-csrf-token", auth=None)
#def get_csrf_token(request):
#    return {"csrftoken": get_token(request)}


@api.get("/user", auth=JWTAuth())
def get_user(request):
    return {
        "id": request.user.id,
        "email": request.user.email,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "organization": request.user.organization
    }





# Add routers with prefixes
api.add_router("/financial/", finance_router)
api.add_router("/design/", designer_router)

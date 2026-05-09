""" Module defining middleware permission checking for routes """

from functools import wraps
from django.http import JsonResponse

from main.models import CustomUser

def admin_required(func):
    """ Middleware: Validate admin privileges """

    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Not authenticated"}, status=401)
        if not request.user.is_staff and not request.user.is_superuser:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        user = CustomUser.objects.get(email=request.user.email)
        if not user.is_staff and not user.is_superuser:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        return func(request, *args, **kwargs)
    return wrapper

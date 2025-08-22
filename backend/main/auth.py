import jwt

from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timezone, timedelta
from ninja.security import HttpBearer

User = get_user_model()

def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(tz=timezone.utc) + timedelta(days=5),
        "iat": datetime.now(tz=timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])
            return user
        except (jwt.PyJWTError, User.DoesNotExist):
            return None
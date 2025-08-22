import re

from ninja import Schema
from pydantic import field_validator, model_validator
from typing import Optional

class TokenSchema(Schema):
    access: str
    refresh: str

class AuthSchema(Schema):
    email: str
    password: str

class RegisterUserSchema(Schema):
    email: str
    password: str
    first_name: str
    last_name: Optional[str] = None
    organization: Optional[str] = None
    password_confirmation: str

    @model_validator(mode='after')
    def check_passwords_match(self):
        if self.password != self.password_confirmation:
            raise ValueError("Passwords do not match")
        return self

    @field_validator('email', mode='after')
    @classmethod
    def validate_email_format(cls, v:str):
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email")
        return v


class RegisterUserResponseSchema(Schema):
    id: int
    email: str
    first_name: str
    last_name: str
    organization: Optional[str]
    created_at: str
    subscription_tier: str

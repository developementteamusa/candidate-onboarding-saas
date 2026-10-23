from pydantic import BaseModel, EmailStr, Field

from app.modules.users.schemas import UserPublic


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginResponse(BaseModel):
    message: str
    user: UserPublic


class CsrfResponse(BaseModel):
    csrf_token: str


class LogoutResponse(BaseModel):
    message: str
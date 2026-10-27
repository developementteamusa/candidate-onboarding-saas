from pydantic import BaseModel, EmailStr, Field

from app.modules.users.schemas import UserPublic

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)



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


class CompanyRegisterRequest(
    BaseModel
):
    company_name: str = Field(
        min_length=2,
        max_length=150,
    )

    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class CompanyRegisterPublic(
    BaseModel
):
    company_id: str

    user_id: str

    company_name: str

    company_slug: str

    email: str

    role: str

    message: str
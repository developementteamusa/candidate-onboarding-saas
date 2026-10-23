from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)

from app.modules.candidates.schemas import (
    CandidatePublic,
)


class CandidateRegisterRequest(BaseModel):
    company_slug: str = Field(
        min_length=2,
        max_length=100,
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
        min_length=12,
        max_length=128,
    )


class CandidateLoginRequest(BaseModel):
    company_slug: str
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class CandidateAuthResponse(BaseModel):
    message: str
    candidate: CandidatePublic


class CandidateCsrfResponse(BaseModel):
    csrf_token: str


class CandidateLogoutResponse(BaseModel):
    message: str
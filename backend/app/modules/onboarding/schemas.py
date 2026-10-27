from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)

from datetime import datetime

from pydantic import BaseModel

class InvitationStatus(str, Enum):
    PENDING_EMAIL = "PENDING_EMAIL"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    EMAIL_FAILED = "EMAIL_FAILED"


class InvitationSentResponse(BaseModel):
    message: str
    application_id: str
    status: str


class AcceptInvitationRequest(BaseModel):
    token: str = Field(
        min_length=20,
        max_length=500,
    )


class AcceptInvitationResponse(BaseModel):
    message: str
    application_id: str
    status: str


class CandidateOnboardingStatus(BaseModel):
    application_id: str
    status: str


class CompanyDocumentPublic(
    BaseModel
):
    id: str

    candidate_id: str

    application_id: str | None = None

    candidate_name: str

    candidate_email: str

    section: str

    original_filename: str

    content_type: str

    verified_size: int | None = None

    status: str

    created_at: datetime | None = None


class CompanyDocumentViewPublic(
    BaseModel
):
    url: str

    expires_in: int

    filename: str

    content_type: str
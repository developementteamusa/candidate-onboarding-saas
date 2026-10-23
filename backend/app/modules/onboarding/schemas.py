from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


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
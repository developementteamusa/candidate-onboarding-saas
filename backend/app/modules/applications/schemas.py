from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


class ApplicationStatus(str, Enum):
    APPLICATION_DRAFT = (
        "APPLICATION_DRAFT"
    )

    APPLICATION_SUBMITTED = (
        "APPLICATION_SUBMITTED"
    )

    UNDER_REVIEW = (
        "UNDER_REVIEW"
    )

    APPROVED = (
        "APPROVED"
    )

    ONBOARDING_INVITED = (
        "ONBOARDING_INVITED"
    )

    ONBOARDING_IN_PROGRESS = (
        "ONBOARDING_IN_PROGRESS"
    )

    ONBOARDING_COMPLETE = (
        "ONBOARDING_COMPLETE"
    )


class ApplicationDraftUpdate(BaseModel):
    phone: str = Field(
        min_length=7,
        max_length=30,
    )

    street_address: str = Field(
        min_length=2,
        max_length=200,
    )

    city: str = Field(
        min_length=2,
        max_length=100,
    )

    state: str = Field(
        min_length=2,
        max_length=50,
    )

    postal_code: str = Field(
        min_length=3,
        max_length=20,
    )


class ApplicationPublic(BaseModel):
    id: str
    candidate_id: str
    company_id: str

    status: ApplicationStatus

    first_name: str
    last_name: str
    email: str

    phone: str | None = None
    street_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None

    created_at: str
    updated_at: str

    submitted_at: str | None = None
    review_started_at: str | None = None
    approved_at: str | None = None

    onboarding_invited_at: str | None = None
    onboarding_started_at: str | None = None
from enum import Enum

from pydantic import BaseModel


class BackgroundCheckStatus(
    str,
    Enum,
):
    NOT_STARTED = "NOT_STARTED"
    REQUESTED = "REQUESTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class BackgroundCheckEligibilityPublic(
    BaseModel
):
    eligible: bool

    application_status_ok: bool
    profile_completed: bool
    driver_license_verified: bool
    authorization_completed: bool

    reason: str | None = None


class BackgroundCheckPublic(
    BaseModel
):
    id: str | None = None

    application_id: str
    candidate_id: str

    status: BackgroundCheckStatus

    provider: str | None = None
    provider_reference: str | None = None

    requested_at: str | None = None
    completed_at: str | None = None

    error_message: str | None = None


class CompanyBackgroundCheckPublic(
    BaseModel
):
    application_id: str

    candidate_id: str

    candidate_name: str

    candidate_email: str

    eligibility: (
        BackgroundCheckEligibilityPublic
    )

    background_check: (
        BackgroundCheckPublic | None
    ) = None
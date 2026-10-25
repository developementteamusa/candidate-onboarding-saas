from enum import Enum

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class DriversLicenseStatus(
    str,
    Enum,
):
    NOT_STARTED = (
        "NOT_STARTED"
    )

    FRONT_UPLOADED = (
        "FRONT_UPLOADED"
    )

    READY_FOR_OCR = (
        "READY_FOR_OCR"
    )

    OCR_IN_PROGRESS = (
        "OCR_IN_PROGRESS"
    )

    OCR_COMPLETE = (
        "OCR_COMPLETE"
    )

    OCR_FAILED = (
        "OCR_FAILED"
    )

    MATCH = (
        "MATCH"
    )

    REVIEW_REQUIRED = (
        "REVIEW_REQUIRED"
    )

    VERIFIED = (
        "VERIFIED"
    )


class DriversLicenseSide(
    str,
    Enum,
):
    FRONT = "FRONT"
    BACK = "BACK"

class IdentityResolutionChoice(
    str,
    Enum,
):
    USE_CANDIDATE_VALUE = (
        "USE_CANDIDATE_VALUE"
    )

    USE_LICENSE_VALUE = (
        "USE_LICENSE_VALUE"
    )


class IdentityFieldResolutionRequest(
    BaseModel
):
    field_name: str = Field(
        min_length=1,
        max_length=100,
    )

    resolution: (
        IdentityResolutionChoice
    )


class ResolveIdentityMismatchRequest(
    BaseModel
):
    resolutions: list[
        IdentityFieldResolutionRequest
    ] = Field(
        min_length=1
    )

class IdentityFieldResolutionPublic(
    BaseModel
):
    candidate_value: str | None = None

    extracted_value: str | None = None

    selected_value: str | None = None

    source: str

    resolution: str

    reviewed_by: str

    reviewed_at: str | None = None

class LinkDriversLicenseUploadRequest(
    BaseModel
):
    upload_id: str = Field(
        min_length=24,
        max_length=24,
    )

    side: DriversLicenseSide


class ExtractedIdentityField(
    BaseModel
):
    value: str | None = None

    raw_text: str | None = None

    confidence: float | None = None

    document_index: int | None = None


class IdentityFieldComparison(
    BaseModel
):
    candidate_value: str | None = None

    extracted_value: str | None = None

    normalized_candidate: str | None = None

    normalized_extracted: str | None = None

    result: str

    confidence: float | None = None


class DriversLicenseVerificationPublic(
    BaseModel
):
    id: str | None = None

    status: DriversLicenseStatus

    front_file_id: str | None = None

    back_file_id: str | None = None

    front_uploaded: bool = False

    back_uploaded: bool = False

    ready_for_ocr: bool = False

    extracted_data: dict[
        str,
        ExtractedIdentityField
    ] | None = None

    textract_model_version: (
        str | None
    ) = None

    ocr_error: str | None = None

    comparison_result: dict[
        str,
        IdentityFieldComparison
    ] | None = None

    review_resolution: dict[
        str,
        IdentityFieldResolutionPublic
    ] | None = None

    verified_identity: dict[
        str,
        str | None
    ] | None = None

    overall_match: str | None = None


class CompanyDriversLicenseReviewPublic(
    BaseModel
):
    application_id: str

    candidate_id: str

    candidate_name: str

    candidate_email: EmailStr

    verification: (
        DriversLicenseVerificationPublic
    )
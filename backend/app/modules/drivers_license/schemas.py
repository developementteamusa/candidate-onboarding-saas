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
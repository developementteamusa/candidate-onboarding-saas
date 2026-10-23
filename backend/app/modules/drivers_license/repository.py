from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from pymongo import (
    ReturnDocument,
)

from app.db.mongodb import (
    get_database,
)


def get_verification(
    candidate_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(
        candidate_id
    ):
        return None

    if not ObjectId.is_valid(
        company_id
    ):
        return None

    db = get_database()

    return (
        db.driver_license_verifications
        .find_one(
            {
                "candidate_id": ObjectId(
                    candidate_id
                ),

                "company_id": ObjectId(
                    company_id
                ),
            }
        )
    )


def create_verification(
    candidate_id: str,
    company_id: str,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    document = {
        "candidate_id": ObjectId(
            candidate_id
        ),

        "company_id": ObjectId(
            company_id
        ),

        "status": "NOT_STARTED",

        "front_file_id": None,

        "back_file_id": None,

        "created_at": now,

        "updated_at": now,

        "ocr_started_at": None,

        "ocr_completed_at": None,

        "ocr_error": None,

        "textract_model_version": None,

        "extracted_data": None,

        "comparison_result": None,
    }

    result = (
        db.driver_license_verifications
        .insert_one(
            document
        )
    )

    document["_id"] = (
        result.inserted_id
    )

    return document


def update_license_file(
    verification_id,
    side: str,
    file_id,
    status: str,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    field_name = (
        "front_file_id"
        if side == "FRONT"
        else "back_file_id"
    )

    return (
        db.driver_license_verifications
        .find_one_and_update(
            {
                "_id": verification_id,
            },

            {
                "$set": {
                    field_name: file_id,

                    "status": status,

                    "updated_at": now,

                    "ocr_error": None,
                }
            },

            return_document=(
                ReturnDocument.AFTER
            ),
        )
    )


def mark_ocr_in_progress(
    verification_id,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    return (
        db.driver_license_verifications
        .find_one_and_update(
            {
                "_id": verification_id,

                "status": {
                    "$in": [
                        "READY_FOR_OCR",
                        "OCR_FAILED",
                    ]
                },
            },

            {
                "$set": {
                    "status": (
                        "OCR_IN_PROGRESS"
                    ),

                    "ocr_started_at": now,

                    "ocr_completed_at": None,

                    "ocr_error": None,

                    "updated_at": now,
                }
            },

            return_document=(
                ReturnDocument.AFTER
            ),
        )
    )


def mark_ocr_complete(
    verification_id,
    extracted_data,
    model_version,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    return (
        db.driver_license_verifications
        .find_one_and_update(
            {
                "_id": verification_id,

                "status": (
                    "OCR_IN_PROGRESS"
                ),
            },

            {
                "$set": {
                    "status": (
                        "OCR_COMPLETE"
                    ),

                    "extracted_data": (
                        extracted_data
                    ),

                    "textract_model_version": (
                        model_version
                    ),

                    "ocr_completed_at": now,

                    "ocr_error": None,

                    "updated_at": now,
                }
            },

            return_document=(
                ReturnDocument.AFTER
            ),
        )
    )


def mark_ocr_failed(
    verification_id,
    error_message: str,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    return (
        db.driver_license_verifications
        .find_one_and_update(
            {
                "_id": verification_id,
            },

            {
                "$set": {
                    "status": (
                        "OCR_FAILED"
                    ),

                    "ocr_error": (
                        error_message
                    ),

                    "ocr_completed_at": now,

                    "updated_at": now,
                }
            },

            return_document=(
                ReturnDocument.AFTER
            ),
        )
    )
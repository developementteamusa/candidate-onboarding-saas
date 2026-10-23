from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import get_database

from app.modules.applications.schemas import (
    ApplicationStatus,
)


def update_application_draft(
    application_id,
    candidate_id,
    company_id,
    payload,
):
    db = get_database()

    now = datetime.now(timezone.utc)

    result = db.applications.update_one(
        {
            "_id": application_id,
            "candidate_id": candidate_id,
            "company_id": company_id,
            "status": (
                ApplicationStatus
                .APPLICATION_DRAFT
                .value
            ),
        },
        {
            "$set": {
                "phone": payload.phone,
                "street_address": (
                    payload.street_address
                ),
                "city": payload.city,
                "state": payload.state,
                "postal_code": (
                    payload.postal_code
                ),
                "updated_at": now,
            }
        },
    )

    return result.modified_count == 1


def submit_application(
    application_id,
    candidate_id,
    company_id,
):
    db = get_database()

    application = db.applications.find_one(
        {
            "_id": application_id,
            "candidate_id": candidate_id,
            "company_id": company_id,
            "status": (
                ApplicationStatus
                .APPLICATION_DRAFT
                .value
            ),
        }
    )

    if application is None:
        return False

    required_fields = [
        "phone",
        "street_address",
        "city",
        "state",
        "postal_code",
    ]

    for field in required_fields:
        if not application.get(field):
            return False

    now = datetime.now(timezone.utc)

    result = db.applications.update_one(
        {
            "_id": application_id,
            "candidate_id": candidate_id,
            "company_id": company_id,
            "status": (
                ApplicationStatus
                .APPLICATION_DRAFT
                .value
            ),
        },
        {
            "$set": {
                "status": (
                    ApplicationStatus
                    .APPLICATION_SUBMITTED
                    .value
                ),
                "submitted_at": now,
                "updated_at": now,
            }
        },
    )

    return result.modified_count == 1


def begin_review(
    application_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(
        application_id
    ):
        return False

    if not ObjectId.is_valid(
        company_id
    ):
        return False

    db = get_database()

    now = datetime.now(timezone.utc)

    result = db.applications.update_one(
        {
            "_id": ObjectId(
                application_id
            ),
            "company_id": ObjectId(
                company_id
            ),
            "status": (
                ApplicationStatus
                .APPLICATION_SUBMITTED
                .value
            ),
        },
        {
            "$set": {
                "status": (
                    ApplicationStatus
                    .UNDER_REVIEW
                    .value
                ),
                "review_started_at": now,
                "updated_at": now,
            }
        },
    )

    return result.modified_count == 1


def approve_application(
    application_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(
        application_id
    ):
        return False

    if not ObjectId.is_valid(
        company_id
    ):
        return False

    db = get_database()

    now = datetime.now(timezone.utc)

    result = db.applications.update_one(
        {
            "_id": ObjectId(
                application_id
            ),
            "company_id": ObjectId(
                company_id
            ),
            "status": (
                ApplicationStatus
                .UNDER_REVIEW
                .value
            ),
        },
        {
            "$set": {
                "status": (
                    ApplicationStatus
                    .APPROVED
                    .value
                ),
                "approved_at": now,
                "updated_at": now,
            }
        },
    )

    return result.modified_count == 1
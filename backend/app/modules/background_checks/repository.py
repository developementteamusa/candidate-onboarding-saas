from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from app.db.mongodb import get_database


def get_background_check(
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
        db.background_checks
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


def create_background_check(
    *,
    candidate_id: str,
    company_id: str,
    application_id: str,
    provider: str,
    provider_reference: str,
    status: str,
    requested_by: str,
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

        "application_id": ObjectId(
            application_id
        ),

        "provider": provider,

        "provider_reference": (
            provider_reference
        ),

        "status": status,

        "requested_by": ObjectId(
            requested_by
        )
        if ObjectId.is_valid(
            requested_by
        )
        else requested_by,

        "requested_at": now,

        "completed_at": None,

        "error_message": None,

        "created_at": now,

        "updated_at": now,
    }

    result = (
        db.background_checks
        .insert_one(
            document
        )
    )

    document["_id"] = (
        result.inserted_id
    )

    return document
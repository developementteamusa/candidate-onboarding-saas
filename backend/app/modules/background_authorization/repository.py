from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from app.db.mongodb import (
    get_database,
)


def get_authorization(
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
        db.background_check_authorizations
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


def create_authorization(
    candidate_id: str,
    company_id: str,
    application_id: str,
    typed_name: str,
    disclosure_version: str,
    authorization_version: str,
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

        "authorized": True,

        "typed_name": (
            typed_name
        ),

        "disclosure_version": (
            disclosure_version
        ),

        "authorization_version": (
            authorization_version
        ),

        "authorized_at": now,

        "created_at": now,

        "updated_at": now,
    }

    result = (
        db.background_check_authorizations
        .insert_one(
            document
        )
    )

    document["_id"] = (
        result.inserted_id
    )

    return document
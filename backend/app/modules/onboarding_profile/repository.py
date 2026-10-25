from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from pymongo import ReturnDocument

from app.db.mongodb import get_database


def get_candidate_application(
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

    return db.applications.find_one(
        {
            "candidate_id": ObjectId(
                candidate_id
            ),

            "company_id": ObjectId(
                company_id
            ),
        }
    )


def get_profile(
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
        db.candidate_onboarding_profiles
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


def upsert_profile(
    candidate_id: str,
    company_id: str,
    application_id: str,
    profile_data: dict,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )

    update_data = {
        **profile_data,

        "candidate_id": ObjectId(
            candidate_id
        ),

        "company_id": ObjectId(
            company_id
        ),

        "application_id": ObjectId(
            application_id
        ),

        "completed": True,

        "updated_at": now,
    }

    return (
        db.candidate_onboarding_profiles
        .find_one_and_update(
            {
                "candidate_id": ObjectId(
                    candidate_id
                ),

                "company_id": ObjectId(
                    company_id
                ),
            },

            {
                "$set": update_data,

                "$setOnInsert": {
                    "created_at": now,
                },
            },

            upsert=True,

            return_document=(
                ReturnDocument.AFTER
            ),
        )
    )
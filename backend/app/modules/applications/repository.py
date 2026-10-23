from bson import ObjectId

from app.db.mongodb import get_database


def get_candidate_application(
    candidate_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(candidate_id):
        return None

    if not ObjectId.is_valid(company_id):
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


def get_company_application(
    application_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(
        application_id
    ):
        return None

    if not ObjectId.is_valid(
        company_id
    ):
        return None

    db = get_database()

    return db.applications.find_one(
        {
            "_id": ObjectId(
                application_id
            ),
            "company_id": ObjectId(
                company_id
            ),
        }
    )


def list_company_applications(
    company_id: str,
):
    if not ObjectId.is_valid(
        company_id
    ):
        return []

    db = get_database()

    return list(
        db.applications.find(
            {
                "company_id": ObjectId(
                    company_id
                ),
            }
        ).sort(
            "created_at",
            -1,
        )
    )
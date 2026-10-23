from bson import ObjectId

from app.db.mongodb import get_database


def get_candidate_by_id(
    candidate_id: str,
):
    if not ObjectId.is_valid(
        candidate_id
    ):
        return None

    db = get_database()

    return db.candidates.find_one(
        {
            "_id": ObjectId(
                candidate_id
            ),
        }
    )


def get_candidate_by_email(
    company_id,
    email: str,
):
    db = get_database()

    return db.candidates.find_one(
        {
            "company_id": company_id,
            "email": email.lower().strip(),
        }
    )


def increment_candidate_token_version(
    candidate_id: str,
):
    if not ObjectId.is_valid(
        candidate_id
    ):
        return False

    db = get_database()

    result = db.candidates.update_one(
        {
            "_id": ObjectId(
                candidate_id
            ),
        },
        {
            "$inc": {
                "token_version": 1,
            }
        },
    )

    return result.modified_count == 1
from bson import ObjectId

from app.db.mongodb import get_database


def create_upload_record(
    document,
):
    db = get_database()

    return db.onboarding_files.insert_one(
        document
    )


def get_upload_by_id(
    upload_id: str,
    candidate_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(upload_id):
        return None

    if not ObjectId.is_valid(candidate_id):
        return None

    if not ObjectId.is_valid(company_id):
        return None

    db = get_database()

    return db.onboarding_files.find_one(
        {
            "_id": ObjectId(upload_id),

            "candidate_id": ObjectId(
                candidate_id
            ),

            "company_id": ObjectId(
                company_id
            ),
        }
    )


def mark_upload_complete(
    upload_id,
    size: int,
    etag: str | None,
):
    db = get_database()

    return db.onboarding_files.update_one(
        {
            "_id": upload_id,
            "status": "PENDING_UPLOAD",
        },

        {
            "$set": {
                "status": "UPLOADED",
                "verified_size": size,
                "etag": etag,
            }
        },
    )


def list_candidate_files(
    candidate_id: str,
    company_id: str,
):
    if not ObjectId.is_valid(candidate_id):
        return []

    if not ObjectId.is_valid(company_id):
        return []

    db = get_database()

    return list(
        db.onboarding_files.find(
            {
                "candidate_id": ObjectId(
                    candidate_id
                ),

                "company_id": ObjectId(
                    company_id
                ),

                "status": "UPLOADED",
            }
        ).sort(
            "created_at",
            -1,
        )
    )
from bson import ObjectId

from app.db.mongodb import get_database


def create_invitation(
    invitation_document,
):
    db = get_database()

    return db.onboarding_invitations.insert_one(
        invitation_document
    )


def get_invitation_by_token_hash(
    token_hash: str,
):
    db = get_database()

    return db.onboarding_invitations.find_one(
        {
            "token_hash": token_hash,
        }
    )


def update_invitation(
    invitation_id,
    update_fields,
):
    db = get_database()

    return db.onboarding_invitations.update_one(
        {
            "_id": invitation_id,
        },
        {
            "$set": update_fields,
        },
    )


def revoke_existing_sent_invitations(
    application_id,
):
    db = get_database()

    return db.onboarding_invitations.update_many(
        {
            "application_id": application_id,
            "status": "SENT",
        },
        {
            "$set": {
                "status": "REVOKED",
            }
        },
    )


def get_candidate_onboarding_application(
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
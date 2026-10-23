from bson import ObjectId

from app.db.mongodb import get_database


def get_user_by_email(email: str):
    db = get_database()

    return db.users.find_one(
        {
            "email": email.lower().strip(),
        }
    )


def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None

    db = get_database()

    return db.users.find_one(
        {
            "_id": ObjectId(user_id),
        }
    )


def increment_token_version(user_id: str):
    if not ObjectId.is_valid(user_id):
        return False

    db = get_database()

    result = db.users.update_one(
        {
            "_id": ObjectId(user_id),
        },
        {
            "$inc": {
                "token_version": 1,
            }
        },
    )

    return result.modified_count == 1
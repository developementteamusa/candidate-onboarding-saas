from bson import ObjectId

from app.db.mongodb import get_database


def get_company_by_id(company_id: str):
    if not ObjectId.is_valid(company_id):
        return None

    db = get_database()

    return db.companies.find_one(
        {
            "_id": ObjectId(company_id),
        }
    )


def get_company_by_slug(slug: str):
    db = get_database()

    return db.companies.find_one(
        {
            "slug": slug.lower().strip(),
        }
    )
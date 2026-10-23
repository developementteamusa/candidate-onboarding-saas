from datetime import datetime, timezone
from getpass import getpass

from pymongo.errors import DuplicateKeyError

from app.core.security import hash_password

from app.db.indexes import create_database_indexes

from app.db.mongodb import (
    close_mongodb_connection,
    connect_to_mongodb,
    get_database,
)


def prompt_required(label):
    while True:
        value = input(label).strip()

        if value:
            return value


def main():
    print()
    print("Candidate Onboarding SaaS")
    print("Company Bootstrap")
    print("-------------------------")
    print()

    company_name = prompt_required(
        "Company name: "
    )

    company_slug = prompt_required(
        "Company slug: "
    ).lower()

    first_name = prompt_required(
        "Owner first name: "
    )

    last_name = prompt_required(
        "Owner last name: "
    )

    email = prompt_required(
        "Owner email: "
    ).lower()

    # password = prompt_required(
    #     "Temporary owner password: "
    # )
    password = getpass(
    "Temporary owner password: "
    )

    if len(password) < 12:
        print()
        print(
            "Password must contain at least "
            "12 characters."
        )
        return

    connect_to_mongodb()

    try:
        create_database_indexes()

        db = get_database()

        now = datetime.now(timezone.utc)

        company_document = {
            "name": company_name,
            "slug": company_slug,
            "status": "ACTIVE",
            "created_at": now,
            "updated_at": now,
        }

        company_result = (
            db.companies.insert_one(
                company_document
            )
        )

        try:
            user_document = {
                "company_id": (
                    company_result.inserted_id
                ),
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "password_hash": (
                    hash_password(password)
                ),
                "role": "COMPANY_OWNER",
                "status": "ACTIVE",
                "token_version": 1,
                "created_at": now,
                "updated_at": now,
            }

            db.users.insert_one(
                user_document
            )

        except Exception:
            db.companies.delete_one(
                {
                    "_id": (
                        company_result.inserted_id
                    )
                }
            )

            raise

        print()
        print("Bootstrap successful.")
        print()
        print(
            f"Company: {company_name}"
        )
        print(
            f"Slug: {company_slug}"
        )
        print(
            f"Owner: {email}"
        )
        print()

    except DuplicateKeyError:
        print()
        print(
            "Bootstrap failed because the "
            "company slug or email already exists."
        )
        print()

    finally:
        close_mongodb_connection()


if __name__ == "__main__":
    main()
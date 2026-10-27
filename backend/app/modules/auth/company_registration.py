import re

from datetime import (
    datetime,
    timezone,
)

from pymongo.errors import (
    DuplicateKeyError,
)

from app.db.mongodb import (
    get_database,
)

#
# IMPORTANT:
# Replace this import only if your project uses
# a different existing password hashing helper.
#
from app.core.security import (
    hash_password,
)


def make_company_slug(
    company_name: str,
) -> str:
    slug = (
        company_name
        .strip()
        .lower()
    )

    slug = re.sub(
        r"[^a-z0-9]+",
        "-",
        slug,
    )

    slug = slug.strip("-")

    return slug


def register_company(
    payload,
):
    db = get_database()

    now = datetime.now(
        timezone.utc
    )


    company_name = (
        payload.company_name
        .strip()
    )

    first_name = (
        payload.first_name
        .strip()
    )

    last_name = (
        payload.last_name
        .strip()
    )

    email = (
        str(payload.email)
        .strip()
        .lower()
    )


    #
    # Check email globally.
    #
    existing_user = (
        db.users.find_one(
            {
                "email": email,
            }
        )
    )

    if existing_user:
        return (
            None,
            "EMAIL_ALREADY_EXISTS",
        )


    base_slug = make_company_slug(
        company_name
    )

    if not base_slug:
        return (
            None,
            "INVALID_COMPANY_NAME",
        )


    slug = base_slug
    counter = 2


    #
    # Create a unique company slug.
    #
    while db.companies.find_one(
        {
            "slug": slug,
        }
    ):
        slug = (
            f"{base_slug}-{counter}"
        )

        counter += 1


    company_document = {
        "name": company_name,

        "slug": slug,

        "status": "ACTIVE",

        "created_at": now,

        "updated_at": now,
    }


    try:
        company_result = (
            db.companies
            .insert_one(
                company_document
            )
        )

    except DuplicateKeyError:
        return (
            None,
            "COMPANY_ALREADY_EXISTS",
        )


    company_id = (
        company_result.inserted_id
    )


    try:
        password_hash = (
            hash_password(
                payload.password
            )
        )


        user_document = {
            "company_id": (
                company_id
            ),

            "first_name": (
                first_name
            ),

            "last_name": (
                last_name
            ),

            "email": email,

            "password_hash": (
                password_hash
            ),

            "role": (
                "COMPANY_OWNER"
            ),

            "status": (
                "ACTIVE"
            ),

            "created_at": now,

            "updated_at": now,
        }


        user_result = (
            db.users.insert_one(
                user_document
            )
        )


    except Exception:
        #
        # Development rollback:
        #
        # Do not leave an orphan company if
        # user creation fails.
        #
        db.companies.delete_one(
            {
                "_id": company_id,
            }
        )

        raise


    return {
        "company_id": str(
            company_id
        ),

        "user_id": str(
            user_result.inserted_id
        ),

        "company_name": (
            company_name
        ),

        "company_slug": (
            slug
        ),

        "email": email,

        "role": (
            "COMPANY_OWNER"
        ),

        "message": (
            "Company account created successfully."
        ),
    }, None
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.core.config import get_settings

from app.core.security import (
    create_access_token,
    hash_password,
    password_hash,
    verify_password,
)

from app.db.mongodb import get_database

from app.modules.candidates.repository import (
    get_candidate_by_email,
)

from app.modules.companies.repository import (
    get_company_by_slug,
)


settings = get_settings()


DUMMY_PASSWORD_HASH = password_hash.hash(
    "candidate-password-not-used"
)


def register_candidate(payload):
    company = get_company_by_slug(
        payload.company_slug
    )

    if company is None:
        return None, "COMPANY_NOT_FOUND"

    if company.get("status") != "ACTIVE":
        return None, "COMPANY_INACTIVE"

    db = get_database()

    now = datetime.now(timezone.utc)

    candidate_document = {
        "company_id": company["_id"],
        "email": (
            payload.email.lower().strip()
        ),
        "first_name": (
            payload.first_name.strip()
        ),
        "last_name": (
            payload.last_name.strip()
        ),
        "password_hash": hash_password(
            payload.password
        ),
        "status": "ACTIVE",
        "token_version": 1,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = db.candidates.insert_one(
            candidate_document
        )

    except DuplicateKeyError:
        return None, "EMAIL_EXISTS"

    try:
        application_document = {
            "candidate_id": (
                result.inserted_id
            ),
            "company_id": company["_id"],
            "status": (
                "APPLICATION_DRAFT"
            ),
            "first_name": (
                payload.first_name.strip()
            ),
            "last_name": (
                payload.last_name.strip()
            ),
            "email": (
                payload.email.lower().strip()
            ),
            "phone": None,
            "street_address": None,
            "city": None,
            "state": None,
            "postal_code": None,
            "created_at": now,
            "updated_at": now,
            "submitted_at": None,
            "review_started_at": None,
            "approved_at": None,
        }

        db.applications.insert_one(
            application_document
        )

    except Exception:
        db.candidates.delete_one(
            {
                "_id": result.inserted_id,
            }
        )

        raise

    candidate_document["_id"] = (
        result.inserted_id
    )

    return candidate_document, None


def authenticate_candidate(
    company_slug: str,
    email: str,
    password: str,
):
    company = get_company_by_slug(
        company_slug
    )

    if company is None:
        verify_password(
            password,
            DUMMY_PASSWORD_HASH,
        )

        return None

    candidate = get_candidate_by_email(
        company["_id"],
        email,
    )

    if candidate is None:
        verify_password(
            password,
            DUMMY_PASSWORD_HASH,
        )

        return None

    if not verify_password(
        password,
        candidate["password_hash"],
    ):
        return None

    if candidate.get("status") != "ACTIVE":
        return None

    return candidate


def issue_candidate_access_token(
    candidate,
):
    return create_access_token(
        subject_id=str(
            candidate["_id"]
        ),
        token_version=candidate.get(
            "token_version",
            1,
        ),
        token_type="candidate_access",
        expire_minutes=(
            settings
            .candidate_access_token_expire_minutes
        ),
    )
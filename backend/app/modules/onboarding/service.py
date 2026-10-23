import hashlib
import secrets

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from urllib.parse import quote

from bson import ObjectId

from app.core.config import get_settings

from app.db.mongodb import get_database

from app.integrations.aws.ses import (
    send_onboarding_invitation_email,
)

from app.modules.applications.repository import (
    get_company_application,
)

from app.modules.companies.repository import (
    get_company_by_id,
)

from app.modules.onboarding.repository import (
    create_invitation,
    get_invitation_by_token_hash,
    revoke_existing_sent_invitations,
    update_invitation,
)


settings = get_settings()


def hash_invitation_token(
    token: str,
):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def generate_invitation_token():
    return secrets.token_urlsafe(48)


def send_onboarding_invitation(
    application_id: str,
    company_id: str,
    created_by_user_id: str,
):
    application = get_company_application(
        application_id,
        company_id,
    )

    if application is None:
        return None, "NOT_FOUND"

    if application.get(
        "status"
    ) != "APPROVED":
        return None, "INVALID_STATUS"

    company = get_company_by_id(
        company_id
    )

    if company is None:
        return None, "COMPANY_NOT_FOUND"

    raw_token = (
        generate_invitation_token()
    )

    token_hash = (
        hash_invitation_token(
            raw_token
        )
    )

    now = datetime.now(
        timezone.utc
    )

    expires_at = now + timedelta(
        hours=(
            settings
            .onboarding_invitation_expire_hours
        )
    )

    revoke_existing_sent_invitations(
        application["_id"]
    )

    invitation_document = {
        "company_id": application[
            "company_id"
        ],

        "candidate_id": application[
            "candidate_id"
        ],

        "application_id": application[
            "_id"
        ],

        "token_hash": token_hash,

        "status": "PENDING_EMAIL",

        "expires_at": expires_at,

        "created_by_user_id": ObjectId(
            created_by_user_id
        ),

        "created_at": now,

        "sent_at": None,
        "accepted_at": None,

        "ses_message_id": None,
    }

    invitation_result = (
        create_invitation(
            invitation_document
        )
    )

    invitation_url = (
        f"{settings.frontend_public_url}"
        f"/apply/"
        f"{quote(company['slug'])}"
        f"/onboarding"
        f"?token="
        f"{quote(raw_token)}"
    )

    candidate_name = (
        f"{application['first_name']} "
        f"{application['last_name']}"
    ).strip()

    try:
        message_id = (
            send_onboarding_invitation_email(
                to_email=application[
                    "email"
                ],
                candidate_name=(
                    candidate_name
                ),
                company_name=(
                    company["name"]
                ),
                invitation_url=(
                    invitation_url
                ),
            )
        )

    except RuntimeError:
        update_invitation(
            invitation_result.inserted_id,
            {
                "status": "EMAIL_FAILED",
            },
        )

        return None, "EMAIL_FAILED"

    db = get_database()

    transition_result = (
        db.applications.update_one(
            {
                "_id": application["_id"],
                "company_id": application[
                    "company_id"
                ],
                "status": "APPROVED",
            },
            {
                "$set": {
                    "status": (
                        "ONBOARDING_INVITED"
                    ),
                    "onboarding_invited_at": (
                        now
                    ),
                    "updated_at": now,
                }
            },
        )
    )

    if transition_result.modified_count != 1:
        update_invitation(
            invitation_result.inserted_id,
            {
                "status": "REVOKED",
            },
        )

        return None, "INVALID_STATUS"

    update_invitation(
        invitation_result.inserted_id,
        {
            "status": "SENT",
            "sent_at": now,
            "ses_message_id": (
                message_id
            ),
        },
    )

    return {
        "application_id": str(
            application["_id"]
        ),
        "status": (
            "ONBOARDING_INVITED"
        ),
    }, None


def accept_onboarding_invitation(
    token: str,
    candidate,
):
    token_hash = (
        hash_invitation_token(
            token
        )
    )

    invitation = (
        get_invitation_by_token_hash(
            token_hash
        )
    )

    if invitation is None:
        return None, "INVALID_INVITATION"

    if invitation.get(
        "status"
    ) != "SENT":
        return None, "INVALID_INVITATION"

    expires_at = invitation[
        "expires_at"
    ]

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    now = datetime.now(
        timezone.utc
    )

    if expires_at <= now:
        update_invitation(
            invitation["_id"],
            {
                "status": "EXPIRED",
            },
        )

        return None, "EXPIRED"

    if str(
        invitation["candidate_id"]
    ) != candidate.id:
        return None, "INVALID_INVITATION"

    if str(
        invitation["company_id"]
    ) != candidate.company_id:
        return None, "INVALID_INVITATION"

    db = get_database()

    transition_result = (
        db.applications.update_one(
            {
                "_id": invitation[
                    "application_id"
                ],

                "candidate_id": invitation[
                    "candidate_id"
                ],

                "company_id": invitation[
                    "company_id"
                ],

                "status": (
                    "ONBOARDING_INVITED"
                ),
            },
            {
                "$set": {
                    "status": (
                        "ONBOARDING_IN_PROGRESS"
                    ),

                    "onboarding_started_at": (
                        now
                    ),

                    "updated_at": now,
                }
            },
        )
    )

    if transition_result.modified_count != 1:
        return None, "INVALID_STATUS"

    update_invitation(
        invitation["_id"],
        {
            "status": "ACCEPTED",
            "accepted_at": now,
        },
    )

    return {
        "application_id": str(
            invitation["application_id"]
        ),
        "status": (
            "ONBOARDING_IN_PROGRESS"
        ),
    }, None
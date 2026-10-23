from pymongo import ASCENDING

from app.db.mongodb import get_database


def create_database_indexes():
    db = get_database()

    db.driver_license_verifications.create_index(
        [
            ("company_id", ASCENDING),
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_driver_license_company_candidate"
        ),
    )


    db.driver_license_verifications.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name=(
            "ix_driver_license_company_status"
        ),
    )

    db.companies.create_index(
        [
            ("slug", ASCENDING),
        ],
        unique=True,
        name="uq_companies_slug",
    )

    db.users.create_index(
        [
            ("email", ASCENDING),
        ],
        unique=True,
        name="uq_users_email",
    )

    db.users.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name="ix_users_company_status",
    )

    db.users.create_index(
        [
            ("company_id", ASCENDING),
            ("role", ASCENDING),
        ],
        name="ix_users_company_role",
    )

    db.candidates.create_index(
        [
            ("company_id", ASCENDING),
            ("email", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_candidates_company_email"
        ),
    )

    db.candidates.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name=(
            "ix_candidates_company_status"
        ),
    )

    db.applications.create_index(
        [
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_applications_candidate"
        ),
    )

    db.applications.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name=(
            "ix_applications_company_status"
        ),
    )

    db.onboarding_invitations.create_index(
        [
            ("token_hash", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_onboarding_invitation_token"
        ),
    )

    db.onboarding_invitations.create_index(
        [
            ("application_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name=(
            "ix_onboarding_application_status"
        ),
    )

    db.onboarding_invitations.create_index(
        [
            ("expires_at", ASCENDING),
        ],
        name=(
            "ix_onboarding_invitation_expiration"
        ),
    )

    db.onboarding_files.create_index(
    [
        ("company_id", ASCENDING),
        ("candidate_id", ASCENDING),
        ("section", ASCENDING),
    ],
    name=(
        "ix_onboarding_files_tenant_candidate_section"
    ),
)


    db.onboarding_files.create_index(
    [
        ("object_key", ASCENDING),
    ],
    unique=True,
    name="uq_onboarding_files_object_key",
)


    db.onboarding_files.create_index(
    [
        ("candidate_id", ASCENDING),
        ("status", ASCENDING),
    ],
    name=(
        "ix_onboarding_files_candidate_status"
    ),
)
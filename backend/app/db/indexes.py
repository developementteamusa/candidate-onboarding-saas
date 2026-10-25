from pymongo import ASCENDING

from app.db.mongodb import (
    get_database,
)


def create_database_indexes():
    db = get_database()

    # =====================================================
    # COMPANIES
    # =====================================================

    db.companies.create_index(
        [
            ("slug", ASCENDING),
        ],
        unique=True,
        name="uq_companies_slug",
    )


    # =====================================================
    # USERS
    # =====================================================

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


    # =====================================================
    # CANDIDATES
    # =====================================================

    db.candidates.create_index(
        [
            ("company_id", ASCENDING),
            ("email", ASCENDING),
        ],
        unique=True,
        name="uq_candidates_company_email",
    )

    db.candidates.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name="ix_candidates_company_status",
    )


    # =====================================================
    # APPLICATIONS
    # =====================================================

    db.applications.create_index(
        [
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name="uq_applications_candidate",
    )

    db.applications.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name="ix_applications_company_status",
    )


    # =====================================================
    # ONBOARDING FILES
    # =====================================================

    #
    # This compound index already covers:
    #
    # company_id
    # company_id + candidate_id
    # company_id + candidate_id + section
    #
    # Keep the existing MongoDB index name
    # to avoid IndexOptionsConflict.
    #
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


    # =====================================================
    # DRIVER'S LICENSE VERIFICATIONS
    # =====================================================

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


    # =====================================================
    # CANDIDATE ONBOARDING PROFILES
    # =====================================================

    db.candidate_onboarding_profiles.create_index(
        [
            ("company_id", ASCENDING),
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_onboarding_profile_company_candidate"
        ),
    )

    db.candidate_onboarding_profiles.create_index(
        [
            ("company_id", ASCENDING),
            ("application_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_onboarding_profile_company_application"
        ),
    )


    # =====================================================
    # BACKGROUND CHECK AUTHORIZATIONS
    # =====================================================

    db.background_check_authorizations.create_index(
        [
            ("company_id", ASCENDING),
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_background_auth_company_candidate"
        ),
    )

    db.background_check_authorizations.create_index(
        [
            ("company_id", ASCENDING),
            ("application_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_background_auth_company_application"
        ),
    )


    # =====================================================
    # BACKGROUND CHECKS
    # =====================================================

    db.background_checks.create_index(
        [
            ("company_id", ASCENDING),
            ("candidate_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_background_check_company_candidate"
        ),
    )

    db.background_checks.create_index(
        [
            ("company_id", ASCENDING),
            ("application_id", ASCENDING),
        ],
        unique=True,
        name=(
            "uq_background_check_company_application"
        ),
    )

    db.background_checks.create_index(
        [
            ("provider_reference", ASCENDING),
        ],
        unique=True,
        sparse=True,
        name=(
            "uq_background_check_provider_reference"
        ),
    )

    db.background_checks.create_index(
        [
            ("company_id", ASCENDING),
            ("status", ASCENDING),
        ],
        name=(
            "ix_background_check_company_status"
        ),
    )
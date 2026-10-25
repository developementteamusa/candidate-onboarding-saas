from app.integrations.background_checks.provider import (
    start_background_check,
)

from app.modules.applications.repository import (
    get_company_application,
)

from app.modules.background_authorization.repository import (
    get_authorization,
)

from app.modules.background_checks.repository import (
    create_background_check,
    get_background_check,
)

from app.modules.drivers_license.repository import (
    get_verification,
)

from app.modules.onboarding_profile.repository import (
    get_profile,
)


def serialize_background_check(
    background_check,
):
    if background_check is None:
        return None

    requested_at = (
        background_check.get(
            "requested_at"
        )
    )

    completed_at = (
        background_check.get(
            "completed_at"
        )
    )

    return {
        "id": str(
            background_check["_id"]
        ),

        "application_id": str(
            background_check[
                "application_id"
            ]
        ),

        "candidate_id": str(
            background_check[
                "candidate_id"
            ]
        ),

        "status": (
            background_check.get(
                "status",
                "NOT_STARTED",
            )
        ),

        "provider": (
            background_check.get(
                "provider"
            )
        ),

        "provider_reference": (
            background_check.get(
                "provider_reference"
            )
        ),

        "requested_at": (
            requested_at.isoformat()
            if requested_at
            else None
        ),

        "completed_at": (
            completed_at.isoformat()
            if completed_at
            else None
        ),

        "error_message": (
            background_check.get(
                "error_message"
            )
        ),
    }


def get_background_check_eligibility(
    *,
    application,
    candidate_id: str,
    company_id: str,
):
    application_status_ok = (
        application.get(
            "status"
        )
        == "ONBOARDING_IN_PROGRESS"
    )

    profile = get_profile(
        candidate_id,
        company_id,
    )

    profile_completed = bool(
        profile
        and profile.get(
            "completed"
        )
    )

    verification = get_verification(
        candidate_id,
        company_id,
    )

    driver_license_verified = bool(
        verification
        and verification.get(
            "status"
        )
        == "VERIFIED"
    )

    authorization = get_authorization(
        candidate_id,
        company_id,
    )

    authorization_completed = bool(
        authorization
        and authorization.get(
            "authorized"
        )
        is True
    )


    eligible = all(
        [
            application_status_ok,
            profile_completed,
            driver_license_verified,
            authorization_completed,
        ]
    )


    reason = None

    if not application_status_ok:
        reason = (
            "Candidate onboarding is not "
            "currently in progress."
        )

    elif not profile_completed:
        reason = (
            "Candidate information has "
            "not been completed."
        )

    elif not driver_license_verified:
        reason = (
            "Driver's license has not "
            "been verified."
        )

    elif not authorization_completed:
        reason = (
            "Background check authorization "
            "has not been completed."
        )


    return {
        "eligible": eligible,

        "application_status_ok": (
            application_status_ok
        ),

        "profile_completed": (
            profile_completed
        ),

        "driver_license_verified": (
            driver_license_verified
        ),

        "authorization_completed": (
            authorization_completed
        ),

        "reason": reason,
    }


def get_company_background_check(
    *,
    application_id: str,
    company_id: str,
):
    application = (
        get_company_application(
            application_id,
            company_id,
        )
    )

    if application is None:
        return (
            None,
            "APPLICATION_NOT_FOUND",
        )


    candidate_id = str(
        application[
            "candidate_id"
        ]
    )


    eligibility = (
        get_background_check_eligibility(
            application=application,

            candidate_id=candidate_id,

            company_id=company_id,
        )
    )


    background_check = (
        get_background_check(
            candidate_id,
            company_id,
        )
    )


    return {
        "application": application,

        "candidate_id": (
            candidate_id
        ),

        "eligibility": (
            eligibility
        ),

        "background_check": (
            background_check
        ),
    }, None


def start_company_background_check(
    *,
    application_id: str,
    company_id: str,
    requested_by: str,
):
    context, error = (
        get_company_background_check(
            application_id=(
                application_id
            ),

            company_id=(
                company_id
            ),
        )
    )

    if error:
        return (
            None,
            error,
        )


    application = (
        context[
            "application"
        ]
    )

    candidate_id = (
        context[
            "candidate_id"
        ]
    )

    eligibility = (
        context[
            "eligibility"
        ]
    )


    if not eligibility[
        "eligible"
    ]:
        return (
            None,
            "NOT_ELIGIBLE",
        )


    existing = (
        context[
            "background_check"
        ]
    )


    if existing is not None:
        return (
            existing,
            "ALREADY_EXISTS",
        )


    verification = get_verification(
        candidate_id,
        company_id,
    )

    verified_identity = (
        verification.get(
            "verified_identity"
        )
    )


    if not verified_identity:
        return (
            None,
            "VERIFIED_IDENTITY_NOT_FOUND",
        )


    profile = get_profile(
        candidate_id,
        company_id,
    )


    provider_result = (
        start_background_check(
            candidate_id=(
                candidate_id
            ),

            application_id=(
                application_id
            ),

            verified_identity=(
                verified_identity
            ),

            profile=profile,
        )
    )


    background_check = (
        create_background_check(
            candidate_id=(
                candidate_id
            ),

            company_id=(
                company_id
            ),

            application_id=(
                application_id
            ),

            provider=(
                provider_result[
                    "provider"
                ]
            ),

            provider_reference=(
                provider_result[
                    "provider_reference"
                ]
            ),

            status=(
                provider_result[
                    "status"
                ]
            ),

            requested_by=(
                requested_by
            ),
        )
    )


    return (
        background_check,
        None,
    )
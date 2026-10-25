from app.modules.background_authorization.repository import (
    create_authorization,
    get_authorization,
)

from app.modules.onboarding_profile.repository import (
    get_candidate_application,
    get_profile,
)


def serialize_authorization(
    authorization,
):
    if authorization is None:
        return {
            "id": None,

            "application_id": None,

            "authorized": False,

            "typed_name": None,

            "disclosure_version": None,

            "authorization_version": None,

            "authorized_at": None,

            "created_at": None,
        }


    authorized_at = (
        authorization.get(
            "authorized_at"
        )
    )

    created_at = (
        authorization.get(
            "created_at"
        )
    )


    return {
        "id": str(
            authorization["_id"]
        ),

        "application_id": (
            str(
                authorization[
                    "application_id"
                ]
            )
            if authorization.get(
                "application_id"
            )
            else None
        ),

        "authorized": bool(
            authorization.get(
                "authorized"
            )
        ),

        "typed_name": (
            authorization.get(
                "typed_name"
            )
        ),

        "disclosure_version": (
            authorization.get(
                "disclosure_version"
            )
        ),

        "authorization_version": (
            authorization.get(
                "authorization_version"
            )
        ),

        "authorized_at": (
            authorized_at.isoformat()
            if authorized_at
            else None
        ),

        "created_at": (
            created_at.isoformat()
            if created_at
            else None
        ),
    }


def authorize_background_check(
    candidate,
    payload,
):
    application = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )


    if application is None:
        return (
            None,
            "APPLICATION_NOT_FOUND",
        )


    if application.get(
        "status"
    ) != "ONBOARDING_IN_PROGRESS":
        return (
            None,
            "ONBOARDING_NOT_STARTED",
        )


    profile = get_profile(
        candidate.id,
        candidate.company_id,
    )


    if (
        profile is None
        or not profile.get(
            "completed"
        )
    ):
        return (
            None,
            "PROFILE_NOT_COMPLETED",
        )


    existing = get_authorization(
        candidate.id,
        candidate.company_id,
    )


    if existing is not None:
        return (
            existing,
            "ALREADY_AUTHORIZED",
        )


    if payload.authorized is not True:
        return (
            None,
            "AUTHORIZATION_REQUIRED",
        )


    typed_name = (
        payload.typed_name
        .strip()
    )


    expected_first = (
        profile.get(
            "legal_first_name",
            ""
        )
        .strip()
        .lower()
    )


    expected_last = (
        profile.get(
            "legal_last_name",
            ""
        )
        .strip()
        .lower()
    )


    normalized_typed_name = (
        typed_name.lower()
    )


    if (
        expected_first
        not in normalized_typed_name
        or expected_last
        not in normalized_typed_name
    ):
        return (
            None,
            "NAME_MISMATCH",
        )


    authorization = (
        create_authorization(
            candidate_id=(
                candidate.id
            ),

            company_id=(
                candidate.company_id
            ),

            application_id=str(
                application["_id"]
            ),

            typed_name=(
                typed_name
            ),

            disclosure_version=(
                payload.disclosure_version
            ),

            authorization_version=(
                payload.authorization_version
            ),
        )
    )


    return authorization, None


def get_candidate_authorization(
    candidate,
):
    return get_authorization(
        candidate.id,
        candidate.company_id,
    )
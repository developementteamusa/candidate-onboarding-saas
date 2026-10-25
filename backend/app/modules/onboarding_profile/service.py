from app.modules.onboarding_profile.repository import (
    get_candidate_application,
    get_profile,
    upsert_profile,
)


def serialize_profile(
    profile,
):
    if profile is None:
        return {
            "id": None,

            "application_id": None,

            "legal_first_name": None,
            "legal_middle_name": None,
            "legal_last_name": None,

            "date_of_birth": None,

            "driver_license_number": None,
            "driver_license_state": None,

            "phone": None,

            "street_address": None,
            "city": None,
            "state": None,
            "postal_code": None,

            "completed": False,
        }

    dob = profile.get(
        "date_of_birth"
    )

    return {
        "id": str(
            profile["_id"]
        ),

        "application_id": (
            str(
                profile[
                    "application_id"
                ]
            )
            if profile.get(
                "application_id"
            )
            else None
        ),

        "legal_first_name": (
            profile.get(
                "legal_first_name"
            )
        ),

        "legal_middle_name": (
            profile.get(
                "legal_middle_name"
            )
        ),

        "legal_last_name": (
            profile.get(
                "legal_last_name"
            )
        ),

        "date_of_birth": (
            dob.isoformat()
            if hasattr(
                dob,
                "isoformat"
            )
            else dob
        ),

        "driver_license_number": (
            profile.get(
                "driver_license_number"
            )
        ),

        "driver_license_state": (
            profile.get(
                "driver_license_state"
            )
        ),

        "phone": profile.get(
            "phone"
        ),

        "street_address": (
            profile.get(
                "street_address"
            )
        ),

        "city": profile.get(
            "city"
        ),

        "state": profile.get(
            "state"
        ),

        "postal_code": (
            profile.get(
                "postal_code"
            )
        ),

        "completed": bool(
            profile.get(
                "completed"
            )
        ),
    }


def save_candidate_profile(
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

    profile_data = {
        "legal_first_name": (
            payload.legal_first_name.strip()
        ),

        "legal_middle_name": (
            payload.legal_middle_name.strip()
            if payload.legal_middle_name
            else None
        ),

        "legal_last_name": (
            payload.legal_last_name.strip()
        ),

        "date_of_birth": (
            payload.date_of_birth.isoformat()
        ),

        "driver_license_number": (
            payload.driver_license_number
            .strip()
            .upper()
        ),

        "driver_license_state": (
            payload.driver_license_state
            .strip()
            .upper()
        ),

        "phone": (
            payload.phone.strip()
        ),

        "street_address": (
            payload.street_address.strip()
        ),

        "city": (
            payload.city.strip()
        ),

        "state": (
            payload.state.strip()
        ),

        "postal_code": (
            payload.postal_code.strip()
        ),
    }

    profile = upsert_profile(
        candidate_id=candidate.id,

        company_id=candidate.company_id,

        application_id=str(
            application["_id"]
        ),

        profile_data=profile_data,
    )

    return profile, None


def get_candidate_profile(
    candidate,
):
    return get_profile(
        candidate.id,
        candidate.company_id,
    )
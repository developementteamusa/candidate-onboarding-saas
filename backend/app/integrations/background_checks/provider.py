from uuid import uuid4


def start_background_check(
    *,
    candidate_id: str,
    application_id: str,
    verified_identity: dict,
    profile: dict,
):
    """
    Development provider adapter.

    This intentionally does NOT contact
    Checkr yet.

    Phase 7C will replace this implementation
    with the production Checkr adapter.
    """

    provider_reference = (
        f"dev-bg-{uuid4()}"
    )

    return {
        "provider": "DEVELOPMENT_MOCK",

        "provider_reference": (
            provider_reference
        ),

        "status": "REQUESTED",
    }
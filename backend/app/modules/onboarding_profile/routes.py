from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.onboarding_profile.schemas import (
    CandidateOnboardingProfilePublic,
    CandidateOnboardingProfileUpsert,
)

from app.modules.onboarding_profile.service import (
    get_candidate_profile,
    save_candidate_profile,
    serialize_profile,
)


router = APIRouter(
    prefix="/onboarding-profile"
)


@router.get(
    "/candidate/current",
    response_model=(
        CandidateOnboardingProfilePublic
    ),
)
def get_current_profile(
    candidate=Depends(
        get_current_candidate
    ),
):
    profile = get_candidate_profile(
        candidate
    )

    return (
        CandidateOnboardingProfilePublic(
            **serialize_profile(
                profile
            )
        )
    )


@router.put(
    "/candidate/current",
    response_model=(
        CandidateOnboardingProfilePublic
    ),
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def save_current_profile(
    payload: (
        CandidateOnboardingProfileUpsert
    ),

    candidate=Depends(
        get_current_candidate
    ),
):
    profile, error = (
        save_candidate_profile(
            candidate,
            payload,
        )
    )

    if error == "APPLICATION_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail=(
                "Candidate application "
                "not found"
            ),
        )

    if error == "ONBOARDING_NOT_STARTED":
        raise HTTPException(
            status_code=409,
            detail=(
                "Onboarding has not started"
            ),
        )

    return (
        CandidateOnboardingProfilePublic(
            **serialize_profile(
                profile
            )
        )
    )
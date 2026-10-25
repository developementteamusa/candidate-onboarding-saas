from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.modules.background_authorization.schemas import (
    BackgroundAuthorizationPublic,
    BackgroundAuthorizationRequest,
)

from app.modules.background_authorization.service import (
    authorize_background_check,
    get_candidate_authorization,
    serialize_authorization,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)


router = APIRouter(
    prefix="/background-authorization"
)


@router.get(
    "/candidate/current",
    response_model=(
        BackgroundAuthorizationPublic
    ),
)
def get_current_background_authorization(
    candidate=Depends(
        get_current_candidate
    ),
):
    authorization = (
        get_candidate_authorization(
            candidate
        )
    )

    return (
        BackgroundAuthorizationPublic(
            **serialize_authorization(
                authorization
            )
        )
    )


@router.post(
    "/candidate/current",
    response_model=(
        BackgroundAuthorizationPublic
    ),
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def create_background_authorization(
    payload: (
        BackgroundAuthorizationRequest
    ),

    candidate=Depends(
        get_current_candidate
    ),
):
    authorization, error = (
        authorize_background_check(
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
                "Candidate onboarding "
                "has not started"
            ),
        )


    if error == "PROFILE_NOT_COMPLETED":
        raise HTTPException(
            status_code=409,

            detail=(
                "Candidate information "
                "must be completed first"
            ),
        )


    if error == "AUTHORIZATION_REQUIRED":
        raise HTTPException(
            status_code=400,

            detail=(
                "Background check "
                "authorization is required"
            ),
        )


    if error == "NAME_MISMATCH":
        raise HTTPException(
            status_code=400,

            detail=(
                "Typed name does not match "
                "the candidate information"
            ),
        )


    if error == "ALREADY_AUTHORIZED":
        return (
            BackgroundAuthorizationPublic(
                **serialize_authorization(
                    authorization
                )
            )
        )


    return (
        BackgroundAuthorizationPublic(
            **serialize_authorization(
                authorization
            )
        )
    )
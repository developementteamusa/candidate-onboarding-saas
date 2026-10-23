from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.modules.auth.dependencies import (
    require_roles,
    validate_csrf,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.onboarding.repository import (
    get_candidate_onboarding_application,
)

from app.modules.onboarding.schemas import (
    AcceptInvitationRequest,
    AcceptInvitationResponse,
    CandidateOnboardingStatus,
    InvitationSentResponse,
)

from app.modules.onboarding.service import (
    accept_onboarding_invitation,
    send_onboarding_invitation,
)

from app.modules.users.schemas import (
    UserRole,
)


router = APIRouter(
    prefix="/onboarding"
)


@router.post(
    "/company/applications/{application_id}/invite",
    response_model=InvitationSentResponse,
    dependencies=[
        Depends(validate_csrf),
    ],
)
def invite_candidate_to_onboarding(
    application_id: str,
    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
        )
    ),
):
    result, error = (
        send_onboarding_invitation(
            application_id=(
                application_id
            ),
            company_id=(
                user.company_id
            ),
            created_by_user_id=(
                user.id
            ),
        )
    )

    if error == "NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    if error == "INVALID_STATUS":
        raise HTTPException(
            status_code=409,
            detail=(
                "Application cannot be "
                "invited to onboarding"
            ),
        )

    if error == "EMAIL_FAILED":
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to send onboarding "
                "invitation email"
            ),
        )

    if error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to create onboarding "
                "invitation"
            ),
        )

    return InvitationSentResponse(
        message=(
            "Onboarding invitation sent"
        ),
        application_id=(
            result["application_id"]
        ),
        status=result["status"],
    )


@router.post(
    "/candidate/accept",
    response_model=AcceptInvitationResponse,
    dependencies=[
        Depends(
            validate_candidate_csrf
        ),
    ],
)
def accept_candidate_invitation(
    payload: AcceptInvitationRequest,
    candidate=Depends(
        get_current_candidate
    ),
):
    result, error = (
        accept_onboarding_invitation(
            token=payload.token,
            candidate=candidate,
        )
    )

    if error == "EXPIRED":
        raise HTTPException(
            status_code=410,
            detail=(
                "This onboarding invitation "
                "has expired"
            ),
        )

    if error == "INVALID_INVITATION":
        raise HTTPException(
            status_code=404,
            detail=(
                "Onboarding invitation "
                "not found"
            ),
        )

    if error == "INVALID_STATUS":
        raise HTTPException(
            status_code=409,
            detail=(
                "Onboarding cannot be started"
            ),
        )

    return AcceptInvitationResponse(
        message=(
            "Onboarding started successfully"
        ),
        application_id=(
            result["application_id"]
        ),
        status=result["status"],
    )


@router.get(
    "/candidate/status",
    response_model=CandidateOnboardingStatus,
)
def candidate_onboarding_status(
    candidate=Depends(
        get_current_candidate
    ),
):
    application = (
        get_candidate_onboarding_application(
            candidate.id,
            candidate.company_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return CandidateOnboardingStatus(
        application_id=str(
            application["_id"]
        ),
        status=application["status"],
    )
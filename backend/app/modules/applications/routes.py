from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.modules.applications.repository import (
    get_candidate_application,
    get_company_application,
    list_company_applications,
)

from app.modules.applications.schemas import (
    ApplicationDraftUpdate,
    ApplicationPublic,
)

from app.modules.applications.service import (
    approve_application,
    begin_review,
    submit_application,
    update_application_draft,
)

from app.modules.auth.dependencies import (
    require_roles,
    validate_csrf,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.users.schemas import (
    UserRole,
)


router = APIRouter(
    prefix="/applications"
)


def serialize_application(
    application,
):
    def dt(value):
        return (
            value.isoformat()
            if value
            else None
        )

    return ApplicationPublic(
        id=str(application["_id"]),
        candidate_id=str(
            application["candidate_id"]
        ),
        company_id=str(
            application["company_id"]
        ),
        status=application["status"],
        first_name=application["first_name"],
        last_name=application["last_name"],
        email=application["email"],
        phone=application.get("phone"),
        street_address=(
            application.get(
                "street_address"
            )
        ),
        city=application.get("city"),
        state=application.get("state"),
        postal_code=application.get(
            "postal_code"
        ),
        created_at=dt(
            application["created_at"]
        ),
        updated_at=dt(
            application["updated_at"]
        ),
        submitted_at=dt(
            application.get(
                "submitted_at"
            )
        ),
        review_started_at=dt(
            application.get(
                "review_started_at"
            )
        ),
        approved_at=dt(
            application.get(
                "approved_at"
            )
        ),
        onboarding_invited_at=dt(
            application.get(
                "onboarding_invited_at"
            )
        ),
        onboarding_started_at=dt(
            application.get(
                "onboarding_started_at"
            )
        ),
    )


@router.get(
    "/candidate/current",
    response_model=ApplicationPublic,
)
def candidate_current_application(
    candidate=Depends(
        get_current_candidate
    ),
):
    application = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return serialize_application(
        application
    )


@router.put(
    "/candidate/current",
    response_model=ApplicationPublic,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def update_candidate_application(
    payload: ApplicationDraftUpdate,
    candidate=Depends(
        get_current_candidate
    ),
):
    application = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    success = update_application_draft(
        application["_id"],
        application["candidate_id"],
        application["company_id"],
        payload,
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail=(
                "Application can no longer "
                "be edited"
            ),
        )

    updated = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    return serialize_application(
        updated
    )


@router.post(
    "/candidate/current/submit",
    response_model=ApplicationPublic,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def submit_candidate_application(
    candidate=Depends(
        get_current_candidate
    ),
):
    application = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    success = submit_application(
        application["_id"],
        application["candidate_id"],
        application["company_id"],
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail=(
                "Application is incomplete "
                "or cannot be submitted"
            ),
        )

    updated = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    return serialize_application(
        updated
    )


@router.get(
    "/company",
    response_model=list[
        ApplicationPublic
    ],
)
def company_applications(
    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    applications = (
        list_company_applications(
            user.company_id
        )
    )

    return [
        serialize_application(
            application
        )
        for application
        in applications
    ]


@router.get(
    "/company/{application_id}",
    response_model=ApplicationPublic,
)
def company_application(
    application_id: str,
    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    application = (
        get_company_application(
            application_id,
            user.company_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return serialize_application(
        application
    )


@router.post(
    "/company/{application_id}/review",
    response_model=ApplicationPublic,
    dependencies=[
        Depends(validate_csrf),
    ],
)
def review_application(
    application_id: str,
    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    success = begin_review(
        application_id,
        user.company_id,
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail=(
                "Application cannot enter review"
            ),
        )

    application = (
        get_company_application(
            application_id,
            user.company_id,
        )
    )

    return serialize_application(
        application
    )

@router.post(
    "/company/{application_id}/approve",
    response_model=ApplicationPublic,
    dependencies=[
        Depends(validate_csrf),
    ],
)
def approve_company_application(
    application_id: str,
    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
        )
    ),
):
    success = approve_application(
        application_id,
        user.company_id,
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail=(
                "Application cannot be approved"
            ),
        )

    application = (
        get_company_application(
            application_id,
            user.company_id,
        )
    )

    return serialize_application(
        application
    )
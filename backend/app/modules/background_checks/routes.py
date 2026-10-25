from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.modules.auth.dependencies import (
    require_roles,
    validate_csrf,
)

from app.modules.background_checks.schemas import (
    BackgroundCheckEligibilityPublic,
    BackgroundCheckPublic,
    CompanyBackgroundCheckPublic,
)

from app.modules.background_checks.service import (
    get_company_background_check,
    serialize_background_check,
    start_company_background_check,
)

from app.modules.users.schemas import UserRole


router = APIRouter(
    prefix="/background-checks"
)


def build_company_response(
    context,
):
    application = (
        context[
            "application"
        ]
    )

    eligibility = (
        context[
            "eligibility"
        ]
    )

    background_check = (
        context[
            "background_check"
        ]
    )


    return CompanyBackgroundCheckPublic(
        application_id=str(
            application["_id"]
        ),

        candidate_id=str(
            application[
                "candidate_id"
            ]
        ),

        candidate_name=(
            f"{application.get('first_name', '')} "
            f"{application.get('last_name', '')}"
        ).strip(),

        candidate_email=(
            application.get(
                "email",
                "",
            )
        ),

        eligibility=(
            BackgroundCheckEligibilityPublic(
                **eligibility
            )
        ),

        background_check=(
            BackgroundCheckPublic(
                **serialize_background_check(
                    background_check
                )
            )
            if background_check
            else None
        ),
    )


@router.get(
    "/company/applications/{application_id}",
    response_model=(
        CompanyBackgroundCheckPublic
    ),
)
def get_company_background_check_status(
    application_id: str,

    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    context, error = (
        get_company_background_check(
            application_id=(
                application_id
            ),

            company_id=(
                user.company_id
            ),
        )
    )


    if error == "APPLICATION_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )


    return build_company_response(
        context
    )


@router.post(
    "/company/applications/{application_id}/start",
    response_model=(
        CompanyBackgroundCheckPublic
    ),
    dependencies=[
        Depends(validate_csrf),
    ],
)
def start_background_check_for_company(
    application_id: str,

    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    background_check, error = (
        start_company_background_check(
            application_id=(
                application_id
            ),

            company_id=(
                user.company_id
            ),

            requested_by=str(
                user.id
            ),
        )
    )


    if error == "APPLICATION_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )


    if error == "NOT_ELIGIBLE":
        raise HTTPException(
            status_code=409,

            detail=(
                "Candidate has not completed "
                "all background check prerequisites"
            ),
        )


    if (
        error
        == "VERIFIED_IDENTITY_NOT_FOUND"
    ):
        raise HTTPException(
            status_code=409,

            detail=(
                "Verified identity is not "
                "available"
            ),
        )


    if error == "ALREADY_EXISTS":
        pass


    context, context_error = (
        get_company_background_check(
            application_id=(
                application_id
            ),

            company_id=(
                user.company_id
            ),
        )
    )


    if context_error:
        raise HTTPException(
            status_code=500,

            detail=(
                "Unable to load background "
                "check status"
            ),
        )


    return build_company_response(
        context
    )
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.modules.applications.repository import (
    get_company_application,
)

from app.modules.auth.dependencies import (
    require_roles,
    validate_csrf,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.drivers_license.repository import (
    get_verification,
)

from app.modules.drivers_license.schemas import (
    CompanyDriversLicenseReviewPublic,
    DriversLicenseVerificationPublic,
    LinkDriversLicenseUploadRequest,
)

from app.modules.drivers_license.service import (
    link_license_upload,
    run_driver_license_ocr_for_company,
    serialize_verification,
)

from app.modules.users.schemas import (
    UserRole,
)


router = APIRouter(
    prefix="/drivers-license"
)


# ---------------------------------------------------------
# Candidate endpoints
# ---------------------------------------------------------


@router.get(
    "/candidate/status",
    response_model=(
        DriversLicenseVerificationPublic
    ),
)
def get_candidate_license_status(
    candidate=Depends(
        get_current_candidate
    ),
):
    verification = get_verification(
        candidate.id,
        candidate.company_id,
    )

    return DriversLicenseVerificationPublic(
        **serialize_verification(
            verification
        )
    )


@router.post(
    "/candidate/link-upload",
    response_model=(
        DriversLicenseVerificationPublic
    ),
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def link_candidate_license_upload(
    payload: (
        LinkDriversLicenseUploadRequest
    ),

    candidate=Depends(
        get_current_candidate
    ),
):
    verification, error = (
        link_license_upload(
            candidate=candidate,
            upload_id=payload.upload_id,
            side=payload.side.value,
        )
    )

    if error == "UPLOAD_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail=(
                "Uploaded file not found"
            ),
        )

    if error == "UPLOAD_NOT_COMPLETE":
        raise HTTPException(
            status_code=409,
            detail=(
                "Upload has not been completed"
            ),
        )

    if error == "INVALID_SECTION":
        raise HTTPException(
            status_code=409,
            detail=(
                "File is not a driver's "
                "license upload"
            ),
        )

    if error == "INVALID_TYPE":
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported driver's "
                "license file type"
            ),
        )

    return DriversLicenseVerificationPublic(
        **serialize_verification(
            verification
        )
    )


# ---------------------------------------------------------
# Company endpoints
# ---------------------------------------------------------


@router.get(
    "/company/applications/{application_id}",
    response_model=(
        CompanyDriversLicenseReviewPublic
    ),
)
def get_company_license_review(
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

    verification = get_verification(
        str(
            application[
                "candidate_id"
            ]
        ),
        user.company_id,
    )

    return CompanyDriversLicenseReviewPublic(
        application_id=str(
            application["_id"]
        ),

        candidate_id=str(
            application["candidate_id"]
        ),

        candidate_name=(
            f"{application['first_name']} "
            f"{application['last_name']}"
        ).strip(),

        candidate_email=(
            application["email"]
        ),

        verification=(
            DriversLicenseVerificationPublic(
                **serialize_verification(
                    verification
                )
            )
        ),
    )


@router.post(
    "/company/applications/{application_id}/run-ocr",
    response_model=(
        CompanyDriversLicenseReviewPublic
    ),
    dependencies=[
        Depends(validate_csrf),
    ],
)
def run_company_license_ocr(
    application_id: str,

    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    verification, error = (
        run_driver_license_ocr_for_company(
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

    if error == "VERIFICATION_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail=(
                "Driver's license "
                "verification not found"
            ),
        )

    if error == "INVALID_STATUS":
        raise HTTPException(
            status_code=409,
            detail=(
                "Driver's license is not "
                "ready for OCR"
            ),
        )

    if error == "OCR_FILE_TOO_LARGE":
        raise HTTPException(
            status_code=413,
            detail=(
                "Driver's license file "
                "exceeds the Textract "
                "AnalyzeID size limit"
            ),
        )

    if error in {
        "UPLOAD_NOT_FOUND",
        "UPLOAD_NOT_COMPLETE",
    }:
        raise HTTPException(
            status_code=409,
            detail=(
                "Driver's license upload "
                "is unavailable"
            ),
        )

    if error == "OCR_FAILED":
        raise HTTPException(
            status_code=502,
            detail=(
                "Amazon Textract could not "
                "analyze the driver's license"
            ),
        )

    application = (
        get_company_application(
            application_id,
            user.company_id,
        )
    )

    return CompanyDriversLicenseReviewPublic(
        application_id=str(
            application["_id"]
        ),

        candidate_id=str(
            application["candidate_id"]
        ),

        candidate_name=(
            f"{application['first_name']} "
            f"{application['last_name']}"
        ).strip(),

        candidate_email=(
            application["email"]
        ),

        verification=(
            DriversLicenseVerificationPublic(
                **serialize_verification(
                    verification
                )
            )
        ),
    )
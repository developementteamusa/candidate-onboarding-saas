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
    ResolveIdentityMismatchRequest,
)

from app.modules.drivers_license.service import (
    link_license_upload,
    resolve_driver_license_mismatches,
    run_driver_license_ocr_for_company,
    serialize_verification,
)

from app.modules.users.schemas import (
    UserRole,
)


router = APIRouter(
    prefix="/drivers-license"
)


# =========================================================
# Candidate endpoints
# =========================================================


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
    """
    Return the current candidate's
    driver's-license verification state.

    Tenant isolation is enforced using
    both candidate_id and company_id.
    """

    verification = get_verification(
        candidate.id,
        candidate.company_id,
    )

    return (
        DriversLicenseVerificationPublic(
            **serialize_verification(
                verification
            )
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
    """
    Link an already securely uploaded
    S3 file to the candidate's driver's
    license verification record.

    The candidate must first complete
    Candidate Information.
    """

    verification, error = (
        link_license_upload(
            candidate=candidate,

            upload_id=(
                payload.upload_id
            ),

            side=(
                payload.side.value
            ),
        )
    )


    if error == "PROFILE_NOT_COMPLETED":
        raise HTTPException(
            status_code=409,

            detail=(
                "Candidate information "
                "must be completed before "
                "uploading a driver's license"
            ),
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
                "Upload has not been "
                "completed"
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


    if error == "INVALID_SIDE":
        raise HTTPException(
            status_code=400,

            detail=(
                "Invalid driver's license "
                "side"
            ),
        )


    if error:
        raise HTTPException(
            status_code=409,

            detail=(
                "Driver's license upload "
                "could not be linked"
            ),
        )


    return (
        DriversLicenseVerificationPublic(
            **serialize_verification(
                verification
            )
        )
    )


# =========================================================
# Company endpoints
# =========================================================


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
    """
    Return the driver's-license verification
    record for one application belonging to
    the authenticated company.

    The application lookup uses the
    authenticated user's company_id.

    This is the primary cross-tenant
    protection for this endpoint.
    """

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


    candidate_id = str(
        application[
            "candidate_id"
        ]
    )


    verification = get_verification(
        candidate_id,
        user.company_id,
    )


    return (
        CompanyDriversLicenseReviewPublic(
            application_id=str(
                application["_id"]
            ),

            candidate_id=(
                candidate_id
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

            verification=(
                DriversLicenseVerificationPublic(
                    **serialize_verification(
                        verification
                    )
                )
            ),
        )
    )


@router.post(
    "/company/applications/{application_id}/run-ocr",
    response_model=(
        CompanyDriversLicenseReviewPublic
    ),
    dependencies=[
        Depends(
            validate_csrf
        )
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
    """
    Company-triggered driver's-license OCR.

    Flow:

        application
            ↓
        tenant validation
            ↓
        driver's license verification
            ↓
        S3 front/back objects
            ↓
        Amazon Textract AnalyzeID
            ↓
        normalized OCR data
            ↓
        candidate profile comparison
            ↓
        MATCH or REVIEW_REQUIRED
    """

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


    if error == "PROFILE_NOT_COMPLETED":
        raise HTTPException(
            status_code=409,

            detail=(
                "Candidate information "
                "has not been completed"
            ),
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


    if error == "UPLOAD_NOT_FOUND":
        raise HTTPException(
            status_code=409,

            detail=(
                "One or more driver's "
                "license uploads could "
                "not be found"
            ),
        )


    if error == "UPLOAD_NOT_COMPLETE":
        raise HTTPException(
            status_code=409,

            detail=(
                "One or more driver's "
                "license uploads have "
                "not completed"
            ),
        )


    if error == "INVALID_SECTION":
        raise HTTPException(
            status_code=409,

            detail=(
                "Invalid onboarding file "
                "section"
            ),
        )


    if error == "INVALID_TYPE":
        raise HTTPException(
            status_code=415,

            detail=(
                "Unsupported driver's "
                "license document type"
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


    if error == "OCR_UPDATE_FAILED":
        raise HTTPException(
            status_code=500,

            detail=(
                "Driver's license OCR "
                "completed but the result "
                "could not be saved"
            ),
        )


    if error:
        raise HTTPException(
            status_code=500,

            detail=(
                "Unable to process driver's "
                "license"
            ),
        )


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


    candidate_id = str(
        application[
            "candidate_id"
        ]
    )


    return (
        CompanyDriversLicenseReviewPublic(
            application_id=str(
                application["_id"]
            ),

            candidate_id=(
                candidate_id
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

            verification=(
                DriversLicenseVerificationPublic(
                    **serialize_verification(
                        verification
                    )
                )
            ),
        )
    )

@router.post(
    "/company/applications/{application_id}/resolve-mismatch",
    response_model=(
        CompanyDriversLicenseReviewPublic
    ),
    dependencies=[
        Depends(
            validate_csrf
        )
    ],
)
def resolve_company_license_mismatch(
    application_id: str,

    payload: (
        ResolveIdentityMismatchRequest
    ),

    user=Depends(
        require_roles(
            UserRole.COMPANY_OWNER,
            UserRole.COMPANY_ADMIN,
            UserRole.COMPANY_REVIEWER,
        )
    ),
):
    verification, error = (
        resolve_driver_license_mismatches(
            application_id=(
                application_id
            ),

            company_id=(
                user.company_id
            ),

            reviewer_id=str(
                user.id
            ),

            resolutions=(
                payload.resolutions
            ),
        )
    )


    error_map = {
        "APPLICATION_NOT_FOUND": (
            404,
            "Application not found",
        ),

        "VERIFICATION_NOT_FOUND": (
            404,
            "Driver's license verification not found",
        ),

        "INVALID_STATUS": (
            409,
            "Driver's license is not awaiting manual review",
        ),

        "COMPARISON_NOT_FOUND": (
            409,
            "Identity comparison result not found",
        ),

        "INVALID_FIELD": (
            400,
            "Invalid identity field",
        ),

        "FIELD_NOT_FOUND": (
            400,
            "Comparison field not found",
        ),

        "FIELD_ALREADY_MATCHES": (
            409,
            "The selected field already matches",
        ),

        "INVALID_RESOLUTION": (
            400,
            "Invalid mismatch resolution",
        ),

        "SELECTED_VALUE_EMPTY": (
            409,
            "The selected identity value is empty",
        ),

        "UNRESOLVED_FIELDS": (
            409,
            "All mismatched fields must be resolved",
        ),

        "RESOLUTION_FAILED": (
            500,
            "Unable to save mismatch resolution",
        ),
    }


    if error:
        (
            status_code,
            message,
        ) = error_map.get(
            error,
            (
                500,
                "Unable to resolve identity mismatch",
            ),
        )

        raise HTTPException(
            status_code=(
                status_code
            ),

            detail=message,
        )


    application = (
        get_company_application(
            application_id,
            user.company_id,
        )
    )


    return (
        CompanyDriversLicenseReviewPublic(
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

            verification=(
                DriversLicenseVerificationPublic(
                    **serialize_verification(
                        verification
                    )
                )
            ),
        )
    )
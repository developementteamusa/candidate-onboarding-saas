from app.integrations.aws.textract import (
    analyze_driver_license,
)

from app.modules.applications.repository import (
    get_company_application,
)

from app.modules.drivers_license.repository import (
    create_verification,
    get_verification,
    mark_ocr_complete,
    mark_ocr_failed,
    mark_ocr_in_progress,
    update_license_file,
)

from app.modules.storage.repository import (
    get_upload_by_id,
)


TEXTRACT_ANALYZE_ID_MAX_BYTES = (
    5 * 1024 * 1024
)


def get_or_create_verification(
    candidate,
):
    verification = get_verification(
        candidate.id,
        candidate.company_id,
    )

    if verification is not None:
        return verification

    return create_verification(
        candidate.id,
        candidate.company_id,
    )


def link_license_upload(
    candidate,
    upload_id: str,
    side: str,
):
    upload = get_upload_by_id(
        upload_id=upload_id,
        candidate_id=candidate.id,
        company_id=candidate.company_id,
    )

    if upload is None:
        return (
            None,
            "UPLOAD_NOT_FOUND",
        )

    if upload.get(
        "status"
    ) != "UPLOADED":
        return (
            None,
            "UPLOAD_NOT_COMPLETE",
        )

    if upload.get(
        "section"
    ) != "DRIVERS_LICENSE":
        return (
            None,
            "INVALID_SECTION",
        )

    if upload.get(
        "content_type"
    ) not in {
        "image/jpeg",
        "image/png",
        "application/pdf",
    }:
        return (
            None,
            "INVALID_TYPE",
        )


    verification = (
        get_or_create_verification(
            candidate
        )
    )


    file_id = upload["_id"]


    if side == "FRONT":
        status = (
            "READY_FOR_OCR"
            if verification.get(
                "back_file_id"
            )
            else "FRONT_UPLOADED"
        )

    elif side == "BACK":
        status = (
            "READY_FOR_OCR"
            if verification.get(
                "front_file_id"
            )
            else "NOT_STARTED"
        )

    else:
        return (
            None,
            "INVALID_SIDE",
        )


    updated = update_license_file(
        verification_id=(
            verification["_id"]
        ),

        side=side,

        file_id=file_id,

        status=status,
    )


    return updated, None


def validate_ocr_file(
    upload,
):
    if upload is None:
        return "UPLOAD_NOT_FOUND"

    if upload.get(
        "status"
    ) != "UPLOADED":
        return "UPLOAD_NOT_COMPLETE"

    if upload.get(
        "section"
    ) != "DRIVERS_LICENSE":
        return "INVALID_SECTION"

    content_type = upload.get(
        "content_type"
    )

    if content_type not in {
        "image/jpeg",
        "image/png",
        "application/pdf",
    }:
        return "INVALID_TYPE"


    size = (
        upload.get(
            "verified_size"
        )
        or upload.get(
            "declared_size"
        )
        or 0
    )


    if (
        size
        > TEXTRACT_ANALYZE_ID_MAX_BYTES
    ):
        return "OCR_FILE_TOO_LARGE"


    return None


def run_driver_license_ocr_for_company(
    application_id: str,
    company_id: str,
):
    """
    Run Amazon Textract AnalyzeID for a
    candidate driver's license.

    IMPORTANT:
    The company_id comes from the authenticated
    company user, not from the browser.

    The application lookup therefore enforces
    tenant isolation before any document can
    be processed.
    """

    application = (
        get_company_application(
            application_id,
            company_id,
        )
    )


    if application is None:
        return (
            None,
            "APPLICATION_NOT_FOUND",
        )


    candidate_id = str(
        application["candidate_id"]
    )


    verification = get_verification(
        candidate_id,
        company_id,
    )


    if verification is None:
        return (
            None,
            "VERIFICATION_NOT_FOUND",
        )


    if verification.get(
        "status"
    ) not in {
        "READY_FOR_OCR",
        "OCR_FAILED",
    }:
        return (
            None,
            "INVALID_STATUS",
        )


    front_file_id = (
        verification.get(
            "front_file_id"
        )
    )

    back_file_id = (
        verification.get(
            "back_file_id"
        )
    )


    if front_file_id is None:
        return (
            None,
            "UPLOAD_NOT_FOUND",
        )


    if back_file_id is None:
        return (
            None,
            "UPLOAD_NOT_FOUND",
        )


    front_upload = (
        get_upload_by_id(
            upload_id=str(
                front_file_id
            ),

            candidate_id=(
                candidate_id
            ),

            company_id=(
                company_id
            ),
        )
    )


    back_upload = (
        get_upload_by_id(
            upload_id=str(
                back_file_id
            ),

            candidate_id=(
                candidate_id
            ),

            company_id=(
                company_id
            ),
        )
    )


    front_error = (
        validate_ocr_file(
            front_upload
        )
    )


    if front_error:
        return (
            None,
            front_error,
        )


    back_error = (
        validate_ocr_file(
            back_upload
        )
    )


    if back_error:
        return (
            None,
            back_error,
        )


    in_progress = (
        mark_ocr_in_progress(
            verification["_id"]
        )
    )


    if in_progress is None:
        return (
            None,
            "INVALID_STATUS",
        )


    try:
        result = (
            analyze_driver_license(
                front_object_key=(
                    front_upload[
                        "object_key"
                    ]
                ),

                back_object_key=(
                    back_upload[
                        "object_key"
                    ]
                ),
            )
        )


    except RuntimeError as exc:
        print(
            "Driver's license OCR failed:"
        )

        print(
            str(exc)
        )


        failed = (
            mark_ocr_failed(
                verification["_id"],

                (
                    "Amazon Textract could "
                    "not analyze the document."
                ),
            )
        )


        return (
            failed,
            "OCR_FAILED",
        )


    extracted_data = (
        result.get(
            "fields",
            {},
        )
    )


    completed = (
        mark_ocr_complete(
            verification_id=(
                verification["_id"]
            ),

            extracted_data=(
                extracted_data
            ),

            model_version=(
                result.get(
                    "model_version"
                )
            ),
        )
    )


    if completed is None:
        return (
            None,
            "OCR_UPDATE_FAILED",
        )


    return completed, None


def serialize_verification(
    verification,
):
    """
    Convert the MongoDB verification document
    into the API response format.
    """

    if verification is None:
        return {
            "id": None,

            "status": (
                "NOT_STARTED"
            ),

            "front_file_id": None,

            "back_file_id": None,

            "front_uploaded": False,

            "back_uploaded": False,

            "ready_for_ocr": False,

            "extracted_data": None,

            "textract_model_version": None,

            "ocr_error": None,
        }


    front_file_id = (
        verification.get(
            "front_file_id"
        )
    )


    back_file_id = (
        verification.get(
            "back_file_id"
        )
    )


    status = (
        verification.get(
            "status",
            "NOT_STARTED",
        )
    )


    return {
        "id": str(
            verification["_id"]
        ),

        "status": status,


        "front_file_id": (
            str(front_file_id)
            if front_file_id
            else None
        ),


        "back_file_id": (
            str(back_file_id)
            if back_file_id
            else None
        ),


        "front_uploaded": (
            front_file_id
            is not None
        ),


        "back_uploaded": (
            back_file_id
            is not None
        ),


        "ready_for_ocr": (
            status
            in {
                "READY_FOR_OCR",
                "OCR_FAILED",
            }
        ),


        "extracted_data": (
            verification.get(
                "extracted_data"
            )
        ),


        "textract_model_version": (
            verification.get(
                "textract_model_version"
            )
        ),


        "ocr_error": (
            verification.get(
                "ocr_error"
            )
        ),
    }
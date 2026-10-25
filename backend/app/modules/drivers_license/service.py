import re

from datetime import (
    datetime,
    timezone,
)

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
    save_comparison_result,
    save_manual_resolution,
    update_license_file,
)

from app.modules.onboarding_profile.repository import (
    get_candidate_application,
    get_profile,
)

from app.modules.storage.repository import (
    get_upload_by_id,
)


TEXTRACT_ANALYZE_ID_MAX_BYTES = (
    5 * 1024 * 1024
)


US_STATE_NAMES = {
    "AL": "ALABAMA",
    "AK": "ALASKA",
    "AZ": "ARIZONA",
    "AR": "ARKANSAS",
    "CA": "CALIFORNIA",
    "CO": "COLORADO",
    "CT": "CONNECTICUT",
    "DE": "DELAWARE",
    "FL": "FLORIDA",
    "GA": "GEORGIA",
    "HI": "HAWAII",
    "ID": "IDAHO",
    "IL": "ILLINOIS",
    "IN": "INDIANA",
    "IA": "IOWA",
    "KS": "KANSAS",
    "KY": "KENTUCKY",
    "LA": "LOUISIANA",
    "ME": "MAINE",
    "MD": "MARYLAND",
    "MA": "MASSACHUSETTS",
    "MI": "MICHIGAN",
    "MN": "MINNESOTA",
    "MS": "MISSISSIPPI",
    "MO": "MISSOURI",
    "MT": "MONTANA",
    "NE": "NEBRASKA",
    "NV": "NEVADA",
    "NH": "NEW HAMPSHIRE",
    "NJ": "NEW JERSEY",
    "NM": "NEW MEXICO",
    "NY": "NEW YORK",
    "NC": "NORTH CAROLINA",
    "ND": "NORTH DAKOTA",
    "OH": "OHIO",
    "OK": "OKLAHOMA",
    "OR": "OREGON",
    "PA": "PENNSYLVANIA",
    "RI": "RHODE ISLAND",
    "SC": "SOUTH CAROLINA",
    "SD": "SOUTH DAKOTA",
    "TN": "TENNESSEE",
    "TX": "TEXAS",
    "UT": "UTAH",
    "VT": "VERMONT",
    "VA": "VIRGINIA",
    "WA": "WASHINGTON",
    "WV": "WEST VIRGINIA",
    "WI": "WISCONSIN",
    "WY": "WYOMING",
    "DC": "DISTRICT OF COLUMBIA",
}


ALLOWED_IDENTITY_FIELDS = {
    "first_name",
    "last_name",
    "date_of_birth",
    "driver_license_number",
    "driver_license_state",
}


def normalize_text(
    value,
):
    if value is None:
        return None

    value = str(
        value
    ).strip().upper()

    value = re.sub(
        r"[^A-Z0-9]+",
        "",
        value,
    )

    return value or None


def normalize_license_number(
    value,
):
    if value is None:
        return None

    normalized = re.sub(
        r"[^A-Z0-9]",
        "",
        str(value).upper(),
    )

    return normalized or None


def normalize_date(
    value,
):
    if not value:
        return None

    value = str(
        value
    ).strip()

    try:
        return (
            datetime
            .fromisoformat(
                value.replace(
                    "Z",
                    "+00:00",
                )
            )
            .date()
            .isoformat()
        )

    except ValueError:
        pass


    try:
        return (
            datetime.strptime(
                value,
                "%m/%d/%Y",
            )
            .date()
            .isoformat()
        )

    except ValueError:
        return value


def normalize_state(
    value,
):
    if not value:
        return None

    normalized = (
        str(value)
        .strip()
        .upper()
    )

    if normalized in US_STATE_NAMES:
        return US_STATE_NAMES[
            normalized
        ]

    return normalized


def get_or_create_verification(
    candidate,
):
    application = (
        get_candidate_application(
            candidate.id,
            candidate.company_id,
        )
    )

    if application is None:
        return None


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
    profile = get_profile(
        candidate.id,
        candidate.company_id,
    )

    if (
        profile is None
        or not profile.get(
            "completed"
        )
    ):
        return (
            None,
            "PROFILE_NOT_COMPLETED",
        )


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


    upload = get_upload_by_id(
        upload_id=upload_id,

        candidate_id=(
            candidate.id
        ),

        company_id=(
            candidate.company_id
        ),
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


    if side not in {
        "FRONT",
        "BACK",
    }:
        return (
            None,
            "INVALID_SIDE",
        )


    verification = (
        get_or_create_verification(
            candidate
        )
    )


    if verification is None:
        return (
            None,
            "APPLICATION_NOT_FOUND",
        )


    file_id = upload[
        "_id"
    ]


    if side == "FRONT":
        status = (
            "READY_FOR_OCR"
            if verification.get(
                "back_file_id"
            )
            else "FRONT_UPLOADED"
        )

    else:
        status = (
            "READY_FOR_OCR"
            if verification.get(
                "front_file_id"
            )
            else "NOT_STARTED"
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


def compare_identity_data(
    profile,
    extracted_data,
):
    comparisons = {}


    comparison_config = {
        "first_name": {
            "candidate": (
                profile.get(
                    "legal_first_name"
                )
            ),

            "ocr": (
                extracted_data
                .get(
                    "first_name",
                    {},
                )
                .get(
                    "value"
                )
            ),

            "confidence": (
                extracted_data
                .get(
                    "first_name",
                    {},
                )
                .get(
                    "confidence"
                )
            ),

            "normalizer": (
                normalize_text
            ),
        },


        "last_name": {
            "candidate": (
                profile.get(
                    "legal_last_name"
                )
            ),

            "ocr": (
                extracted_data
                .get(
                    "last_name",
                    {},
                )
                .get(
                    "value"
                )
            ),

            "confidence": (
                extracted_data
                .get(
                    "last_name",
                    {},
                )
                .get(
                    "confidence"
                )
            ),

            "normalizer": (
                normalize_text
            ),
        },


        "date_of_birth": {
            "candidate": (
                profile.get(
                    "date_of_birth"
                )
            ),

            "ocr": (
                extracted_data
                .get(
                    "date_of_birth",
                    {},
                )
                .get(
                    "value"
                )
            ),

            "confidence": (
                extracted_data
                .get(
                    "date_of_birth",
                    {},
                )
                .get(
                    "confidence"
                )
            ),

            "normalizer": (
                normalize_date
            ),
        },


        "driver_license_number": {
            "candidate": (
                profile.get(
                    "driver_license_number"
                )
            ),

            "ocr": (
                extracted_data
                .get(
                    "driver_license_number",
                    {},
                )
                .get(
                    "value"
                )
            ),

            "confidence": (
                extracted_data
                .get(
                    "driver_license_number",
                    {},
                )
                .get(
                    "confidence"
                )
            ),

            "normalizer": (
                normalize_license_number
            ),
        },


        "driver_license_state": {
            "candidate": (
                profile.get(
                    "driver_license_state"
                )
            ),

            "ocr": (
                extracted_data
                .get(
                    "driver_license_state",
                    {},
                )
                .get(
                    "value"
                )
            ),

            "confidence": (
                extracted_data
                .get(
                    "driver_license_state",
                    {},
                )
                .get(
                    "confidence"
                )
            ),

            "normalizer": (
                normalize_state
            ),
        },
    }


    overall_match = True


    for (
        field_name,
        config,
    ) in comparison_config.items():

        candidate_raw = (
            config[
                "candidate"
            ]
        )

        ocr_raw = (
            config[
                "ocr"
            ]
        )

        normalizer = (
            config[
                "normalizer"
            ]
        )


        candidate_normalized = (
            normalizer(
                candidate_raw
            )
        )


        ocr_normalized = (
            normalizer(
                ocr_raw
            )
        )


        if (
            not candidate_normalized
            or not ocr_normalized
        ):
            result = (
                "NOT_AVAILABLE"
            )

            overall_match = False


        elif (
            candidate_normalized
            == ocr_normalized
        ):
            result = "MATCH"


        else:
            result = "MISMATCH"

            overall_match = False


        comparisons[
            field_name
        ] = {
            "candidate_value": (
                str(candidate_raw)
                if candidate_raw
                is not None
                else None
            ),

            "extracted_value": (
                str(ocr_raw)
                if ocr_raw
                is not None
                else None
            ),

            "normalized_candidate": (
                candidate_normalized
            ),

            "normalized_extracted": (
                ocr_normalized
            ),

            "confidence": (
                config[
                    "confidence"
                ]
            ),

            "result": result,
        }


    return {
        "fields": comparisons,

        "overall": (
            "MATCH"
            if overall_match
            else "REVIEW_REQUIRED"
        ),
    }


def run_driver_license_ocr_for_company(
    application_id: str,
    company_id: str,
):
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
        application[
            "candidate_id"
        ]
    )


    profile = get_profile(
        candidate_id,
        company_id,
    )


    if (
        profile is None
        or not profile.get(
            "completed"
        )
    ):
        return (
            None,
            "PROFILE_NOT_COMPLETED",
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


    comparison = (
        compare_identity_data(
            profile,
            extracted_data,
        )
    )


    if (
        comparison[
            "overall"
        ]
        == "MATCH"
    ):
        final_status = (
            "MATCH"
        )

    else:
        final_status = (
            "REVIEW_REQUIRED"
        )


    completed = (
        save_comparison_result(
            verification_id=(
                verification["_id"]
            ),

            comparison_result=(
                comparison
            ),

            status=(
                final_status
            ),
        )
    )


    if completed is None:
        return (
            None,
            "OCR_UPDATE_FAILED",
        )


    return completed, None


def resolve_driver_license_mismatches(
    application_id: str,
    company_id: str,
    reviewer_id: str,
    resolutions,
):
    """
    Resolve fields currently marked as
    MISMATCH or NOT_AVAILABLE.

    The original candidate-entered values
    and Textract-extracted values are not
    overwritten.

    A separate review_resolution and
    verified_identity record is created.
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
        application[
            "candidate_id"
        ]
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
    ) != "REVIEW_REQUIRED":
        return (
            None,
            "INVALID_STATUS",
        )


    comparison = (
        verification.get(
            "comparison_result",
            {}
        )
    )


    comparison_fields = (
        comparison.get(
            "fields",
            {}
        )
    )


    if not comparison_fields:
        return (
            None,
            "COMPARISON_NOT_FOUND",
        )


    review_resolution = {}

    verified_identity = {}


    #
    # Fields that already match can safely
    # populate verified_identity.
    #
    for (
        field_name,
        field_result,
    ) in comparison_fields.items():

        result = field_result.get(
            "result"
        )


        if result == "MATCH":
            verified_identity[
                field_name
            ] = (
                field_result.get(
                    "extracted_value"
                )
                or field_result.get(
                    "candidate_value"
                )
            )


    resolved_fields = set()


    for resolution_item in resolutions:

        field_name = (
            resolution_item.field_name
        )

        choice = (
            resolution_item
            .resolution
            .value
        )


        if (
            field_name
            not in ALLOWED_IDENTITY_FIELDS
        ):
            return (
                None,
                "INVALID_FIELD",
            )


        field_result = (
            comparison_fields.get(
                field_name
            )
        )


        if field_result is None:
            return (
                None,
                "FIELD_NOT_FOUND",
            )


        if (
            field_result.get(
                "result"
            )
            == "MATCH"
        ):
            return (
                None,
                "FIELD_ALREADY_MATCHES",
            )


        candidate_value = (
            field_result.get(
                "candidate_value"
            )
        )


        extracted_value = (
            field_result.get(
                "extracted_value"
            )
        )


        if (
            choice
            == "USE_CANDIDATE_VALUE"
        ):
            selected_value = (
                candidate_value
            )

            source = (
                "CANDIDATE"
            )


        elif (
            choice
            == "USE_LICENSE_VALUE"
        ):
            selected_value = (
                extracted_value
            )

            source = (
                "LICENSE_OCR"
            )


        else:
            return (
                None,
                "INVALID_RESOLUTION",
            )


        if selected_value is None:
            return (
                None,
                "SELECTED_VALUE_EMPTY",
            )


        review_resolution[
            field_name
        ] = {
            "candidate_value": (
                candidate_value
            ),

            "extracted_value": (
                extracted_value
            ),

            "selected_value": (
                selected_value
            ),

            "source": (
                source
            ),

            "resolution": (
                choice
            ),

            "reviewed_by": (
                reviewer_id
            ),

            "reviewed_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),
        }


        verified_identity[
            field_name
        ] = (
            selected_value
        )


        resolved_fields.add(
            field_name
        )


    required_resolution_fields = {
        field_name

        for (
            field_name,
            field_result,
        ) in comparison_fields.items()

        if field_result.get(
            "result"
        )
        in {
            "MISMATCH",
            "NOT_AVAILABLE",
        }
    }


    if (
        resolved_fields
        != required_resolution_fields
    ):
        return (
            None,
            "UNRESOLVED_FIELDS",
        )


    updated = (
        save_manual_resolution(
            verification_id=(
                verification["_id"]
            ),

            review_resolution=(
                review_resolution
            ),

            verified_identity=(
                verified_identity
            ),

            reviewed_by=(
                reviewer_id
            ),
        )
    )


    if updated is None:
        return (
            None,
            "RESOLUTION_FAILED",
        )


    return updated, None


def serialize_verification(
    verification,
):
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

            "comparison_result": None,

            "overall_match": None,

            "review_resolution": None,

            "verified_identity": None,
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


    stored_comparison = (
        verification.get(
            "comparison_result"
        )
    )


    comparison_fields = None
    overall_match = None


    if stored_comparison:
        comparison_fields = (
            stored_comparison.get(
                "fields"
            )
        )

        overall_match = (
            stored_comparison.get(
                "overall"
            )
        )


    return {
        "id": str(
            verification["_id"]
        ),

        "status": (
            status
        ),

        "front_file_id": (
            str(
                front_file_id
            )
            if front_file_id
            else None
        ),

        "back_file_id": (
            str(
                back_file_id
            )
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

        "comparison_result": (
            comparison_fields
        ),

        "overall_match": (
            overall_match
        ),

        "review_resolution": (
            verification.get(
                "review_resolution"
            )
        ),

        "verified_identity": (
            verification.get(
                "verified_identity"
            )
        ),
    }
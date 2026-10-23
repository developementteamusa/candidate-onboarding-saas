import re
import uuid

from datetime import (
    datetime,
    timezone,
)

from pathlib import Path

from bson import ObjectId

from app.core.config import get_settings

from app.integrations.aws.s3 import (
    generate_upload_url,
    get_object_metadata,
)

from app.modules.storage.repository import (
    create_upload_record,
    get_upload_by_id,
    mark_upload_complete,
)


settings = get_settings()


ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
}


SECTION_PATHS = {
    "DRIVERS_LICENSE": (
        "drivers-license"
    ),

    "PHOTO": "photo",

    "SELFIE": "selfie",

    "BACKGROUND_CHECK": (
        "background-check"
    ),

    "LEGAL_DOCUMENT": (
        "legal-document"
    ),
}


def sanitize_filename(
    filename: str,
):
    name = Path(filename).name

    name = re.sub(
        r"[^A-Za-z0-9._-]",
        "_",
        name,
    )

    return name[:255]


def create_upload_authorization(
    candidate,
    payload,
):
    if payload.file_size > (
        settings.s3_max_upload_bytes
    ):
        return None, "FILE_TOO_LARGE"

    expected_extension = (
        ALLOWED_CONTENT_TYPES.get(
            payload.content_type
        )
    )

    if expected_extension is None:
        return None, "INVALID_TYPE"

    safe_filename = sanitize_filename(
        payload.filename
    )

    section_path = SECTION_PATHS[
        payload.section.value
    ]

    object_id = str(
        uuid.uuid4()
    )

    object_key = (
        f"companies/"
        f"{candidate.company_id}/"
        f"candidates/"
        f"{candidate.id}/"
        f"onboarding/"
        f"{section_path}/"
        f"{object_id}"
        f"{expected_extension}"
    )

    now = datetime.now(
        timezone.utc
    )

    document = {
        "company_id": ObjectId(
            candidate.company_id
        ),

        "candidate_id": ObjectId(
            candidate.id
        ),

        "section": payload.section.value,

        "original_filename": (
            safe_filename
        ),

        "content_type": (
            payload.content_type
        ),

        "declared_size": (
            payload.file_size
        ),

        "verified_size": None,

        "bucket": (
            settings
            .aws_s3_onboarding_bucket
        ),

        "object_key": object_key,

        "status": "PENDING_UPLOAD",

        "etag": None,

        "created_at": now,

        "updated_at": now,
    }

    result = create_upload_record(
        document
    )

    upload_url = generate_upload_url(
        object_key=object_key,
        content_type=(
            payload.content_type
        ),
    )

    return {
        "upload_id": str(
            result.inserted_id
        ),

        "upload_url": upload_url,

        "object_key": object_key,

        "expires_in": (
            settings
            .s3_presigned_url_expire_seconds
        ),

        "required_headers": {
            "Content-Type": (
                payload.content_type
            ),

            "x-amz-server-side-encryption": (
                "aws:kms"
            ),

            "x-amz-server-side-encryption-aws-kms-key-id": (
                settings.aws_kms_key_id
            ),
        },
    }, None


def complete_upload(
    candidate,
    upload_id: str,
):
    upload = get_upload_by_id(
        upload_id=upload_id,
        candidate_id=candidate.id,
        company_id=candidate.company_id,
    )

    if upload is None:
        return None, "NOT_FOUND"

    if upload.get(
        "status"
    ) != "PENDING_UPLOAD":
        return None, "INVALID_STATUS"

    metadata = get_object_metadata(
        upload["object_key"]
    )

    if metadata is None:
        return None, "OBJECT_NOT_FOUND"

    actual_size = metadata.get(
        "ContentLength",
        0,
    )

    actual_type = metadata.get(
        "ContentType",
    )

    encryption = metadata.get(
        "ServerSideEncryption"
    )

    kms_key_id = metadata.get(
        "SSEKMSKeyId"
    )

    if actual_size != upload[
        "declared_size"
    ]:
        return None, "SIZE_MISMATCH"

    if actual_type != upload[
        "content_type"
    ]:
        return None, "TYPE_MISMATCH"

    if encryption != "aws:kms":
        return None, "ENCRYPTION_INVALID"

    if (
        kms_key_id
        and settings.aws_kms_key_id
        not in kms_key_id
        and kms_key_id
        not in settings.aws_kms_key_id
    ):
        return None, "KMS_KEY_INVALID"

    mark_upload_complete(
        upload["_id"],
        size=actual_size,
        etag=metadata.get("ETag"),
    )

    return upload, None
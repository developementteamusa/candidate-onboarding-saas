from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.storage.repository import (
    list_candidate_files,
)

from app.modules.storage.schemas import (
    CompleteUploadRequest,
    StoredFilePublic,
    UploadAuthorization,
    UploadRequest,
)

from app.modules.storage.service import (
    complete_upload,
    create_upload_authorization,
)


router = APIRouter(
    prefix="/storage"
)


def serialize_file(
    document,
):
    return StoredFilePublic(
        id=str(document["_id"]),

        section=document["section"],

        filename=document[
            "original_filename"
        ],

        content_type=document[
            "content_type"
        ],

        size=(
            document.get(
                "verified_size"
            )
            or document.get(
                "declared_size"
            )
        ),

        status=document["status"],

        created_at=(
            document[
                "created_at"
            ].isoformat()
        ),
    )


@router.post(
    "/candidate/upload-url",
    response_model=UploadAuthorization,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def request_upload_url(
    payload: UploadRequest,

    candidate=Depends(
        get_current_candidate
    ),
):
    result, error = (
        create_upload_authorization(
            candidate,
            payload,
        )
    )

    if error == "FILE_TOO_LARGE":
        raise HTTPException(
            status_code=413,
            detail="File is too large",
        )

    if error == "INVALID_TYPE":
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported file type"
            ),
        )

    return UploadAuthorization(
        **result
    )


@router.post(
    "/candidate/complete",
    response_model=StoredFilePublic,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def finalize_upload(
    payload: CompleteUploadRequest,

    candidate=Depends(
        get_current_candidate
    ),
):
    upload, error = complete_upload(
        candidate,
        payload.upload_id,
    )

    if error == "NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Upload not found",
        )

    if error == "OBJECT_NOT_FOUND":
        raise HTTPException(
            status_code=409,
            detail=(
                "Uploaded object was "
                "not found"
            ),
        )

    if error in {
        "SIZE_MISMATCH",
        "TYPE_MISMATCH",
        "ENCRYPTION_INVALID",
        "KMS_KEY_INVALID",
    }:
        raise HTTPException(
            status_code=409,
            detail=(
                "Uploaded object failed "
                "security validation"
            ),
        )

    if error:
        raise HTTPException(
            status_code=409,
            detail=(
                "Upload cannot be completed"
            ),
        )

    refreshed = (
        list_candidate_files(
            candidate.id,
            candidate.company_id,
        )
    )

    uploaded = next(
        (
            item
            for item in refreshed
            if str(
                item["_id"]
            ) == payload.upload_id
        ),
        None,
    )

    if uploaded is None:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to finalize upload"
            ),
        )

    return serialize_file(
        uploaded
    )


@router.get(
    "/candidate/files",
    response_model=list[
        StoredFilePublic
    ],
)
def candidate_files(
    candidate=Depends(
        get_current_candidate
    ),
):
    files = list_candidate_files(
        candidate.id,
        candidate.company_id,
    )

    return [
        serialize_file(document)
        for document in files
    ]
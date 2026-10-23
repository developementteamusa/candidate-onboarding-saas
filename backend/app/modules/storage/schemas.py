from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


class StorageSection(str, Enum):
    DRIVERS_LICENSE = "DRIVERS_LICENSE"
    PHOTO = "PHOTO"
    SELFIE = "SELFIE"
    BACKGROUND_CHECK = "BACKGROUND_CHECK"
    LEGAL_DOCUMENT = "LEGAL_DOCUMENT"


class UploadRequest(BaseModel):
    section: StorageSection

    filename: str = Field(
        min_length=1,
        max_length=255,
    )

    content_type: str = Field(
        min_length=3,
        max_length=100,
    )

    file_size: int = Field(
        gt=0,
    )


class UploadAuthorization(BaseModel):
    upload_id: str
    upload_url: str
    object_key: str

    expires_in: int

    required_headers: dict[str, str]


class CompleteUploadRequest(BaseModel):
    upload_id: str


class StoredFilePublic(BaseModel):
    id: str

    section: StorageSection

    filename: str
    content_type: str
    size: int

    status: str

    created_at: str


class DownloadAuthorization(BaseModel):
    download_url: str
    expires_in: int
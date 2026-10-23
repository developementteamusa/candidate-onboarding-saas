from functools import lru_cache
from typing import Literal

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    app_name: str = (
        "Candidate Onboarding SaaS API"
    )

    app_env: str = "development"
    app_version: str = "0.4.0"
    debug: bool = False

    api_v1_prefix: str = "/api/v1"

    mongodb_uri: str
    mongodb_database: str

    frontend_origin: str = (
        "http://localhost:3000"
    )

    frontend_public_url: str = (
        "http://localhost:3000"
    )

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    access_token_expire_minutes: int = 30

    access_token_cookie_name: str = (
        "onboarding_access_token"
    )

    csrf_cookie_name: str = (
        "onboarding_csrf_token"
    )

    candidate_access_token_cookie_name: str = (
        "candidate_access_token"
    )

    candidate_csrf_cookie_name: str = (
        "candidate_csrf_token"
    )

    candidate_access_token_expire_minutes: int = 30

    cookie_secure: bool = False

    cookie_samesite: Literal[
        "lax",
        "strict",
        "none",
    ] = "lax"

    aws_region: str = "us-east-1"

    aws_s3_region: str = "us-east-1"

    aws_textract_region: str = "us-east-1"

    ses_from_email: str

    aws_s3_onboarding_bucket: str

    aws_kms_key_id: str

    s3_presigned_url_expire_seconds: int = 300

    s3_max_upload_bytes: int = 10485760

    onboarding_invitation_expire_hours: int = 72

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()
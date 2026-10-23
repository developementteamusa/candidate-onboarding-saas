import boto3

from botocore.config import Config

from botocore.exceptions import (
    BotoCoreError,
    ClientError,
)

from app.core.config import get_settings


settings = get_settings()


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=settings.aws_s3_region,
        config=Config(
            signature_version="s3v4",
        ),
    )

def generate_upload_url(
    object_key: str,
    content_type: str,
):
    s3 = get_s3_client()

    try:
        return s3.generate_presigned_url(
            ClientMethod="put_object",

            Params={
                "Bucket": (
                    settings
                    .aws_s3_onboarding_bucket
                ),

                "Key": object_key,

                "ContentType": content_type,

                "ServerSideEncryption": (
                    "aws:kms"
                ),

                "SSEKMSKeyId": (
                    settings.aws_kms_key_id
                ),
            },

            ExpiresIn=(
                settings
                .s3_presigned_url_expire_seconds
            ),

            HttpMethod="PUT",
        )

    except (
        ClientError,
        BotoCoreError,
    ) as exc:
        raise RuntimeError(
            "Unable to generate secure "
            "upload URL."
        ) from exc


def get_object_metadata(
    object_key: str,
):
    s3 = get_s3_client()

    try:
        return s3.head_object(
            Bucket=(
                settings
                .aws_s3_onboarding_bucket
            ),

            Key=object_key,
        )

    except ClientError as exc:
        error_code = (
            exc.response
            .get("Error", {})
            .get("Code")
        )

        if error_code in (
            "404",
            "NoSuchKey",
            "NotFound",
        ):
            return None

        raise RuntimeError(
            "Unable to inspect uploaded object."
        ) from exc


def delete_object(
    object_key: str,
):
    s3 = get_s3_client()

    try:
        s3.delete_object(
            Bucket=(
                settings
                .aws_s3_onboarding_bucket
            ),

            Key=object_key,
        )

    except (
        ClientError,
        BotoCoreError,
    ) as exc:
        raise RuntimeError(
            "Unable to delete S3 object."
        ) from exc


def generate_download_url(
    object_key: str,
):
    s3 = get_s3_client()

    try:
        return s3.generate_presigned_url(
            ClientMethod="get_object",

            Params={
                "Bucket": (
                    settings
                    .aws_s3_onboarding_bucket
                ),

                "Key": object_key,
            },

            ExpiresIn=(
                settings
                .s3_presigned_url_expire_seconds
            ),

        )

    except (
        ClientError,
        BotoCoreError,
    ) as exc:
        raise RuntimeError(
            "Unable to generate secure "
            "download URL."
        ) from exc
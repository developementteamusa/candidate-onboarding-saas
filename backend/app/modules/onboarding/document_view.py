from bson import ObjectId

import boto3

from botocore.config import Config

from app.core.config import (
    get_settings,
)

from app.db.mongodb import (
    get_database,
)


settings = get_settings()


PRESIGNED_URL_EXPIRATION = 300


def create_company_document_view_url(
    *,
    company_id: str,
    document_id: str,
):
    db = get_database()


    # -----------------------------------------------------
    # Validate MongoDB IDs
    # -----------------------------------------------------

    try:
        company_object_id = ObjectId(
            company_id
        )

        document_object_id = ObjectId(
            document_id
        )

    except Exception:
        return None


    # -----------------------------------------------------
    # IMPORTANT:
    # Tenant-scoped lookup.
    #
    # The document must belong to the currently
    # authenticated company.
    # -----------------------------------------------------

    document = (
        db.onboarding_files.find_one(
            {
                "_id":
                    document_object_id,

                "company_id":
                    company_object_id,
            }
        )
    )


    if not document:
        return None


    # -----------------------------------------------------
    # Get S3 storage information
    # -----------------------------------------------------

    bucket = (
        document.get(
            "bucket"
        )
    )


    object_key = (
        document.get(
            "object_key"
        )
    )


    if (
        not bucket
        or not object_key
    ):
        return None


    # -----------------------------------------------------
    # AWS REGION
    # -----------------------------------------------------

    #
    # Use the same AWS region configured for the rest of
    # your application.
    #
    # If your config uses AWS_REGION or another field,
    # update this variable to match your settings.py.
    #

    aws_region = (
        settings.aws_region
    )


    # -----------------------------------------------------
    # S3 CLIENT
    #
    # IMPORTANT:
    #
    # SSE-KMS protected S3 objects require a Signature
    # Version 4 presigned request.
    #
    # We explicitly configure:
    #
    #     signature_version="s3v4"
    #
    # and virtual-hosted S3 addressing.
    # -----------------------------------------------------

    s3_client = boto3.client(
        "s3",

        region_name=
            aws_region,

        config=Config(
            signature_version=
                "s3v4",

            s3={
                "addressing_style":
                    "virtual",
            },
        ),
    )


    # -----------------------------------------------------
    # GENERATE SHORT-LIVED PRESIGNED URL
    # -----------------------------------------------------

    presigned_url = (
        s3_client.generate_presigned_url(
            ClientMethod=
                "get_object",

            Params={
                "Bucket":
                    bucket,

                "Key":
                    object_key,
            },

            ExpiresIn=
                PRESIGNED_URL_EXPIRATION,

            HttpMethod=
                "GET",
        )
    )


    # -----------------------------------------------------
    # SAFE RESPONSE
    #
    # We intentionally do NOT return:
    #
    # - bucket
    # - object_key
    # - KMS key
    #
    # to the frontend.
    # -----------------------------------------------------

    return {
        "url":
            presigned_url,

        "expires_in":
            PRESIGNED_URL_EXPIRATION,

        "filename":
            document.get(
                "original_filename",
                "document",
            ),

        "content_type":
            document.get(
                "content_type",
                "application/octet-stream",
            ),
    }
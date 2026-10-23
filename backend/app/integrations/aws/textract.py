import re

import boto3

from botocore.exceptions import (
    BotoCoreError,
    ClientError,
)

from app.core.config import get_settings


settings = get_settings()


TARGET_FIELDS = {
    "FIRST_NAME": "first_name",
    "LAST_NAME": "last_name",
    "DATE_OF_BIRTH": "date_of_birth",
    "DOCUMENT_NUMBER": "driver_license_number",
    "STATE_NAME": "driver_license_state",
}


def get_textract_client():
    if (
        settings.aws_textract_region
        != settings.aws_s3_region
    ):
        raise RuntimeError(
            "Amazon Textract and the S3 "
            "onboarding bucket must use "
            "the same AWS Region."
        )

    return boto3.client(
        "textract",
        region_name=(
            settings.aws_textract_region
        ),
    )


def normalize_field_name(
    value: str,
):
    value = (
        value
        .strip()
        .upper()
    )

    value = re.sub(
        r"[^A-Z0-9]+",
        "_",
        value,
    )

    return value.strip("_")


def parse_identity_documents(
    response,
):
    extracted = {}

    identity_documents = (
        response.get(
            "IdentityDocuments",
            [],
        )
    )

    for document in identity_documents:
        document_index = (
            document.get(
                "DocumentIndex"
            )
        )

        fields = document.get(
            "IdentityDocumentFields",
            [],
        )

        for field in fields:
            type_data = (
                field.get(
                    "Type",
                    {},
                )
            )

            value_data = (
                field.get(
                    "ValueDetection",
                    {},
                )
            )

            raw_type = (
                type_data.get(
                    "Text",
                    "",
                )
            )

            normalized_type = (
                normalize_field_name(
                    raw_type
                )
            )

            output_field = (
                TARGET_FIELDS.get(
                    normalized_type
                )
            )

            if output_field is None:
                continue

            raw_text = (
                value_data.get(
                    "Text"
                )
            )

            normalized_value = (
                value_data
                .get(
                    "NormalizedValue",
                    {},
                )
                .get(
                    "Value"
                )
            )

            confidence = float(
                value_data.get(
                    "Confidence",
                    0.0,
                )
            )

            value = (
                normalized_value
                or raw_text
            )

            candidate_value = {
                "value": value,

                "raw_text": raw_text,

                "confidence": round(
                    confidence,
                    2,
                ),

                "document_index": (
                    document_index
                ),
            }

            existing = extracted.get(
                output_field
            )

            if (
                existing is None
                or confidence
                > existing[
                    "confidence"
                ]
            ):
                extracted[
                    output_field
                ] = candidate_value

    return extracted


def analyze_driver_license(
    front_object_key: str,
    back_object_key: str,
):
    textract = (
        get_textract_client()
    )

    document_pages = [
        {
            "S3Object": {
                "Bucket": (
                    settings
                    .aws_s3_onboarding_bucket
                ),

                "Name": (
                    front_object_key
                ),
            }
        },

        {
            "S3Object": {
                "Bucket": (
                    settings
                    .aws_s3_onboarding_bucket
                ),

                "Name": (
                    back_object_key
                ),
            }
        },
    ]

    try:
        response = (
            textract.analyze_id(
                DocumentPages=(
                    document_pages
                )
            )
        )

    except ClientError as exc:
        error = (
            exc.response.get(
                "Error",
                {},
            )
        )

        error_code = (
            error.get(
                "Code",
                "Unknown",
            )
        )

        error_message = (
            error.get(
                "Message",
                "Unknown Textract error",
            )
        )

        print(
            "Amazon Textract ClientError:"
        )

        print(
            f"Code: {error_code}"
        )

        print(
            f"Message: {error_message}"
        )

        raise RuntimeError(
            "Unable to analyze driver's "
            "license."
        ) from exc

    except BotoCoreError as exc:
        print(
            "Amazon Textract BotoCoreError:"
        )

        print(
            str(exc)
        )

        raise RuntimeError(
            "Unable to communicate with "
            "Amazon Textract."
        ) from exc


    extracted_data = (
        parse_identity_documents(
            response
        )
    )


    return {
        "fields": extracted_data,

        "model_version": (
            response.get(
                "AnalyzeIDModelVersion"
            )
        ),

        "document_count": len(
            response.get(
                "IdentityDocuments",
                [],
            )
        ),
    }
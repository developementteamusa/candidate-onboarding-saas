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
    """
    Create an Amazon Textract client.

    The S3 onboarding bucket and Textract
    must use the same AWS Region when
    AnalyzeID reads documents directly
    from S3.
    """

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
    """
    Normalize Textract AnalyzeID field names.

    Example:
        FIRST NAME
        FIRST-NAME
        FIRST_NAME

    all become:
        FIRST_NAME
    """

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
    """
    Parse the Amazon Textract AnalyzeID
    response and return only the identity
    fields needed by this SaaS.

    Important behavior:
    - ignores empty detections
    - prefers AWS normalized values
      where available
    - keeps the strongest populated result
      when a field appears on both sides
      of the driver's license
    """

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
            type_data = field.get(
                "Type",
                {},
            )

            value_data = field.get(
                "ValueDetection",
                {},
            )


            raw_type = (
                type_data.get(
                    "Text",
                    "",
                )
                or ""
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
                    "Text",
                    "",
                )
                or ""
            ).strip()


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


            if isinstance(
                normalized_value,
                str,
            ):
                normalized_value = (
                    normalized_value.strip()
                )


            # Prefer the normalized value
            # when AWS provides one.
            #
            # This is particularly useful
            # for fields such as dates.
            value = (
                normalized_value
                or raw_text
            )


            # Ignore empty detections.
            #
            # AnalyzeID may emit the same
            # normalized field for both sides
            # of an ID document. An empty
            # high-confidence result should
            # never replace a populated one.
            if not value:
                continue


            confidence = float(
                value_data.get(
                    "Confidence",
                    0.0,
                )
            )


            candidate_value = {
                "value": value,

                "raw_text": (
                    raw_text
                    or value
                ),

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


            # Keep the populated result with
            # the highest confidence.
            if (
                existing is None
                or confidence
                > existing.get(
                    "confidence",
                    0.0,
                )
            ):
                extracted[
                    output_field
                ] = candidate_value


    return extracted


def analyze_driver_license(
    front_object_key: str,
    back_object_key: str,
):
    """
    Run Amazon Textract AnalyzeID against
    the front and back of a driver's license
    stored in the private onboarding S3 bucket.

    Returns:
        {
            "fields": {...},
            "model_version": "...",
            "document_count": 2
        }

    Raises:
        RuntimeError if Textract cannot
        process the document.
    """

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

        print(
            "Front object key:"
        )

        print(
            front_object_key
        )

        print(
            "Back object key:"
        )

        print(
            back_object_key
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
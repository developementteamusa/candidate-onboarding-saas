from datetime import date

from pydantic import (
    BaseModel,
    Field,
)


class CandidateOnboardingProfileUpsert(
    BaseModel
):
    legal_first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    legal_middle_name: str | None = Field(
        default=None,
        max_length=100,
    )

    legal_last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    date_of_birth: date

    driver_license_number: str = Field(
        min_length=1,
        max_length=100,
    )

    driver_license_state: str = Field(
        min_length=2,
        max_length=50,
    )

    phone: str = Field(
        min_length=5,
        max_length=30,
    )

    street_address: str = Field(
        min_length=1,
        max_length=200,
    )

    city: str = Field(
        min_length=1,
        max_length=100,
    )

    state: str = Field(
        min_length=2,
        max_length=100,
    )

    postal_code: str = Field(
        min_length=3,
        max_length=20,
    )


class CandidateOnboardingProfilePublic(
    BaseModel
):
    id: str | None = None

    application_id: str | None = None

    legal_first_name: str | None = None
    legal_middle_name: str | None = None
    legal_last_name: str | None = None

    date_of_birth: str | None = None

    driver_license_number: str | None = None
    driver_license_state: str | None = None

    phone: str | None = None

    street_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None

    completed: bool = False
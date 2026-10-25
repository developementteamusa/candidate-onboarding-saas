from pydantic import (
    BaseModel,
    Field,
)


class BackgroundAuthorizationRequest(
    BaseModel
):
    authorized: bool

    typed_name: str = Field(
        min_length=2,
        max_length=200,
    )

    disclosure_version: str = Field(
        min_length=1,
        max_length=50,
    )

    authorization_version: str = Field(
        min_length=1,
        max_length=50,
    )


class BackgroundAuthorizationPublic(
    BaseModel
):
    id: str | None = None

    application_id: str | None = None

    authorized: bool = False

    typed_name: str | None = None

    disclosure_version: str | None = None

    authorization_version: str | None = None

    authorized_at: str | None = None

    created_at: str | None = None
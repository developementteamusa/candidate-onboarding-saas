from fastapi import (
    HTTPException,
    Request,
    status,
)

from app.core.config import get_settings

from app.core.security import (
    decode_access_token,
    secure_compare,
)

from app.modules.candidates.repository import (
    get_candidate_by_id,
)

from app.modules.candidates.schemas import (
    AuthenticatedCandidate,
)


settings = get_settings()


def get_current_candidate(
    request: Request,
):
    token = request.cookies.get(
        settings
        .candidate_access_token_cookie_name
    )

    if not token:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Candidate authentication required",
        )

    payload = decode_access_token(
        token,
        expected_type="candidate_access",
    )

    if payload is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Invalid or expired authentication",
        )

    candidate = get_candidate_by_id(
        payload.get("sub", "")
    )

    if candidate is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Candidate not found",
        )

    if candidate.get("status") != "ACTIVE":
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Candidate account is not active",
        )

    if payload.get("ver") != candidate.get(
        "token_version",
        1,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Authentication session is no longer valid",
        )

    return AuthenticatedCandidate(
        id=str(candidate["_id"]),
        company_id=str(
            candidate["company_id"]
        ),
        email=candidate["email"],
        first_name=candidate["first_name"],
        last_name=candidate["last_name"],
        status=candidate["status"],
        token_version=candidate.get(
            "token_version",
            1,
        ),
    )


def validate_candidate_csrf(
    request: Request,
):
    cookie_token = request.cookies.get(
        settings.candidate_csrf_cookie_name
    )

    header_token = request.headers.get(
        "X-CSRF-Token"
    )

    if not cookie_token or not header_token:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="CSRF validation failed",
        )

    if not secure_compare(
        cookie_token,
        header_token,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="CSRF validation failed",
        )
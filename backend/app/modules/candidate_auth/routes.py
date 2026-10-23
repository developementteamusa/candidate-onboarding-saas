from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)

from app.core.config import get_settings

from app.core.security import (
    generate_csrf_token,
)

from app.modules.candidate_auth.dependencies import (
    get_current_candidate,
    validate_candidate_csrf,
)

from app.modules.candidate_auth.schemas import (
    CandidateAuthResponse,
    CandidateCsrfResponse,
    CandidateLoginRequest,
    CandidateLogoutResponse,
    CandidateRegisterRequest,
)

from app.modules.candidate_auth.service import (
    authenticate_candidate,
    issue_candidate_access_token,
    register_candidate,
)

from app.modules.candidates.repository import (
    increment_candidate_token_version,
)

from app.modules.candidates.schemas import (
    CandidatePublic,
)


router = APIRouter(
    prefix="/candidate-auth",
)

settings = get_settings()


def build_candidate_public(
    candidate,
):
    return CandidatePublic(
        id=str(candidate["_id"]),
        company_id=str(
            candidate["company_id"]
        ),
        email=candidate["email"],
        first_name=candidate["first_name"],
        last_name=candidate["last_name"],
        status=candidate["status"],
    )


@router.get(
    "/csrf",
    response_model=CandidateCsrfResponse,
)
def csrf(
    response: Response,
):
    token = generate_csrf_token()

    response.set_cookie(
        key=(
            settings
            .candidate_csrf_cookie_name
        ),
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings
            .candidate_access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return {
        "csrf_token": token,
    }


@router.post(
    "/register",
    response_model=CandidateAuthResponse,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def register(
    payload: CandidateRegisterRequest,
    response: Response,
):
    candidate, error = (
        register_candidate(payload)
    )

    if error == "COMPANY_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Application portal not found",
        )

    if error == "COMPANY_INACTIVE":
        raise HTTPException(
            status_code=403,
            detail="Application portal unavailable",
        )

    if error == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=409,
            detail=(
                "An account already exists "
                "for this email"
            ),
        )

    access_token = (
        issue_candidate_access_token(
            candidate
        )
    )

    response.set_cookie(
        key=(
            settings
            .candidate_access_token_cookie_name
        ),
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings
            .candidate_access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return CandidateAuthResponse(
        message="Account created",
        candidate=(
            build_candidate_public(
                candidate
            )
        ),
    )


@router.post(
    "/login",
    response_model=CandidateAuthResponse,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def login(
    payload: CandidateLoginRequest,
    response: Response,
):
    candidate = authenticate_candidate(
        company_slug=(
            payload.company_slug
        ),
        email=payload.email,
        password=payload.password,
    )

    if candidate is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Invalid email or password",
        )

    token = (
        issue_candidate_access_token(
            candidate
        )
    )

    response.set_cookie(
        key=(
            settings
            .candidate_access_token_cookie_name
        ),
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings
            .candidate_access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return CandidateAuthResponse(
        message="Login successful",
        candidate=(
            build_candidate_public(
                candidate
            )
        ),
    )


@router.get(
    "/me",
    response_model=CandidatePublic,
)
def me(
    candidate=Depends(
        get_current_candidate
    ),
):
    return CandidatePublic(
        id=candidate.id,
        company_id=candidate.company_id,
        email=candidate.email,
        first_name=candidate.first_name,
        last_name=candidate.last_name,
        status=candidate.status,
    )


@router.post(
    "/logout",
    response_model=CandidateLogoutResponse,
    dependencies=[
        Depends(
            validate_candidate_csrf
        )
    ],
)
def logout(
    response: Response,
    candidate=Depends(
        get_current_candidate
    ),
):
    increment_candidate_token_version(
        candidate.id
    )

    response.delete_cookie(
        key=(
            settings
            .candidate_access_token_cookie_name
        ),
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    response.delete_cookie(
        key=(
            settings
            .candidate_csrf_cookie_name
        ),
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return {
        "message": "Logout successful",
    }
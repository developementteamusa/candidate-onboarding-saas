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

from app.modules.auth.dependencies import (
    get_current_user,
    validate_csrf,
)

from app.modules.auth.schemas import (
    CsrfResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
)

from app.modules.auth.service import (
    authenticate_user,
    issue_access_token,
)

from app.modules.users.schemas import (
    AuthenticatedUser,
    UserPublic,
)

from app.modules.users.repository import (
    increment_token_version,
)

from fastapi import (
    HTTPException,
)

from app.modules.auth.company_registration import (
    register_company,
)

from app.modules.auth.schemas import (
    CompanyRegisterPublic,
    CompanyRegisterRequest,
)


router = APIRouter(
    prefix="/auth",
)

settings = get_settings()


def build_public_user(user):
    return UserPublic(
        id=str(user["_id"]),
        company_id=(
            str(user["company_id"])
            if user.get("company_id")
            else None
        ),
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        status=user["status"],
    )


@router.get(
    "/csrf",
    response_model=CsrfResponse,
)
def create_csrf_token(
    response: Response,
):
    csrf_token = generate_csrf_token()

    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings.access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return CsrfResponse(
        csrf_token=csrf_token
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    dependencies=[
        Depends(validate_csrf),
    ],
)
def login(
    payload: LoginRequest,
    response: Response,
):
    user = authenticate_user(
        email=payload.email,
        password=payload.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = issue_access_token(user)

    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings.access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return LoginResponse(
        message="Login successful",
        user=build_public_user(user),
    )


@router.get(
    "/me",
    response_model=UserPublic,
)
def get_me(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):
    return UserPublic(
        id=current_user.id,
        company_id=current_user.company_id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        status=current_user.status,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    dependencies=[
        Depends(validate_csrf),
    ],
)
def logout(
    response: Response,
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):
    increment_token_version(
        current_user.id
    )

    response.delete_cookie(
        key=settings.access_token_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return LogoutResponse(
        message="Logout successful"
    )

@router.post(
    "/company/register",
    response_model=(
        CompanyRegisterPublic
    ),
    status_code=201,
)
def create_company_account(
    payload: CompanyRegisterRequest,
):
    result, error = (
        register_company(
            payload
        )
    )


    if (
        error
        == "EMAIL_ALREADY_EXISTS"
    ):
        raise HTTPException(
            status_code=409,

            detail=(
                "An account already exists "
                "with this email address."
            ),
        )


    if (
        error
        == "COMPANY_ALREADY_EXISTS"
    ):
        raise HTTPException(
            status_code=409,

            detail=(
                "Unable to create company "
                "workspace."
            ),
        )


    if (
        error
        == "INVALID_COMPANY_NAME"
    ):
        raise HTTPException(
            status_code=400,

            detail=(
                "Invalid company name."
            ),
        )


    return CompanyRegisterPublic(
        **result
    )
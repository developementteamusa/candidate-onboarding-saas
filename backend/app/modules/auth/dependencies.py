from collections.abc import Callable

from fastapi import (
    Depends,
    HTTPException,
    Request,
    status,
)

from app.core.config import get_settings

from app.core.security import (
    decode_access_token,
    secure_compare,
)

from app.modules.companies.repository import (
    get_company_by_id,
)

from app.modules.users.repository import (
    get_user_by_id,
)

from app.modules.users.schemas import (
    AuthenticatedUser,
    UserRole,
    UserStatus,
)


settings = get_settings()


def get_current_user(
    request: Request,
) -> AuthenticatedUser:
    token = request.cookies.get(
        settings.access_token_cookie_name
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication",
        )

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
        )

    if user.get("status") != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )

    token_version = payload.get("ver")

    current_token_version = user.get(
        "token_version",
        1,
    )

    if token_version != current_token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session is no longer valid",
        )

    company_id = user.get("company_id")

    if company_id is not None:
        company = get_company_by_id(
            str(company_id)
        )

        if company is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company not found",
            )

        if company.get("status") != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company is not active",
            )

    return AuthenticatedUser(
        id=str(user["_id"]),
        company_id=(
            str(company_id)
            if company_id is not None
            else None
        ),
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        status=user["status"],
        token_version=current_token_version,
    )


def require_company_user(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company membership required",
        )

    return current_user


def require_roles(
    *allowed_roles: UserRole,
) -> Callable:
    def role_dependency(
        current_user: AuthenticatedUser = Depends(
            get_current_user
        ),
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_dependency


def validate_csrf(
    request: Request,
):
    cookie_token = request.cookies.get(
        settings.csrf_cookie_name
    )

    header_token = request.headers.get(
        "X-CSRF-Token"
    )

    if not cookie_token or not header_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF validation failed",
        )

    if not secure_compare(
        cookie_token,
        header_token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF validation failed",
        )
from app.core.security import (
    create_access_token,
    password_hash,
    verify_password,
)

from app.modules.companies.repository import (
    get_company_by_id,
)

from app.modules.users.repository import (
    get_user_by_email,
)

from app.modules.users.schemas import (
    UserStatus,
)


DUMMY_PASSWORD_HASH = password_hash.hash(
    "this-password-is-never-used"
)


def authenticate_user(
    email: str,
    password: str,
):
    user = get_user_by_email(email)

    if user is None:
        verify_password(
            password,
            DUMMY_PASSWORD_HASH,
        )

        return None

    password_is_valid = verify_password(
        password,
        user["password_hash"],
    )

    if not password_is_valid:
        return None

    if user.get("status") != UserStatus.ACTIVE.value:
        return None

    company_id = user.get("company_id")

    if company_id is not None:
        company = get_company_by_id(
            str(company_id)
        )

        if company is None:
            return None

        if company.get("status") != "ACTIVE":
            return None

    return user


def issue_access_token(user):
    return create_access_token(
        subject_id=str(user["_id"]),
        token_version=user.get(
            "token_version",
            1,
        ),
        token_type="access",
    )
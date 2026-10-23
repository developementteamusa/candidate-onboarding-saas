import secrets
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import get_settings


settings = get_settings()

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject_id: str,
    token_version: int,
    token_type: str = "access",
    expire_minutes: int | None = None,
) -> str:
    now = datetime.now(timezone.utc)

    expiration_minutes = (
        expire_minutes
        if expire_minutes is not None
        else settings.access_token_expire_minutes
    )

    expires_at = now + timedelta(
        minutes=expiration_minutes
    )

    payload = {
        "sub": subject_id,
        "type": token_type,
        "ver": token_version,
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(
    token: str,
    expected_type: str = "access",
):
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[
                settings.jwt_algorithm
            ],
        )

    except InvalidTokenError:
        return None

    if payload.get("type") != expected_type:
        return None

    return payload


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def secure_compare(
    value_a: str,
    value_b: str,
) -> bool:
    return secrets.compare_digest(
        value_a,
        value_b,
    )
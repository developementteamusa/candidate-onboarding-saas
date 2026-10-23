from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    PLATFORM_ADMIN = "PLATFORM_ADMIN"
    COMPANY_OWNER = "COMPANY_OWNER"
    COMPANY_ADMIN = "COMPANY_ADMIN"
    COMPANY_REVIEWER = "COMPANY_REVIEWER"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"


class AuthenticatedUser(BaseModel):
    id: str
    company_id: str | None
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    status: UserStatus
    token_version: int


class UserPublic(BaseModel):
    id: str
    company_id: str | None
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    status: UserStatus
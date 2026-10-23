from enum import Enum

from pydantic import BaseModel, EmailStr


class CandidateStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"


class AuthenticatedCandidate(BaseModel):
    id: str
    company_id: str
    email: EmailStr
    first_name: str
    last_name: str
    status: CandidateStatus
    token_version: int


class CandidatePublic(BaseModel):
    id: str
    company_id: str
    email: EmailStr
    first_name: str
    last_name: str
    status: CandidateStatus
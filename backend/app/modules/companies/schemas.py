from enum import Enum

from pydantic import BaseModel


class CompanyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class CompanyPublic(BaseModel):
    id: str
    name: str
    slug: str
    status: CompanyStatus
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.modules.auth.dependencies import (
    require_company_user,
)

from app.modules.companies.repository import (
    get_company_by_id,
)

from app.modules.companies.schemas import (
    CompanyPublic,
)

from app.modules.users.schemas import (
    AuthenticatedUser,
)

from app.modules.companies.repository import (
    get_company_by_id,
    get_company_by_slug,
)

router = APIRouter(
    prefix="/company",
)

@router.get(
    "/public/{slug}",
    response_model=CompanyPublic,
)
def get_public_company(
    slug: str,
):
    company = get_company_by_slug(
        slug
    )

    if company is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Application portal not found",
        )

    if company.get("status") != "ACTIVE":
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Application portal not found",
        )

    return CompanyPublic(
        id=str(company["_id"]),
        name=company["name"],
        slug=company["slug"],
        status=company["status"],
    )

@router.get(
    "/me",
    response_model=CompanyPublic,
)
def get_current_company(
    current_user: AuthenticatedUser = Depends(
        require_company_user
    ),
):
    company = get_company_by_id(
        current_user.company_id
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return CompanyPublic(
        id=str(company["_id"]),
        name=company["name"],
        slug=company["slug"],
        status=company["status"],
    )
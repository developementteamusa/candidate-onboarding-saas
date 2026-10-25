from fastapi import APIRouter

from app.api.routes.health import (
    router as health_router,
)

from app.modules.applications.routes import (
    router as applications_router,
)

from app.modules.auth.routes import (
    router as auth_router,
)

from app.modules.candidate_auth.routes import (
    router as candidate_auth_router,
)

from app.modules.companies.routes import (
    router as company_router,
)

from app.modules.onboarding.routes import (
    router as onboarding_router,
)

from app.modules.storage.routes import (
    router as storage_router,
)

from app.modules.drivers_license.routes import (
    router as drivers_license_router,
)

from app.modules.onboarding_profile.routes import (
    router as onboarding_profile_router,
)

from app.modules.background_authorization.routes import (
    router as background_authorization_router,
)

from app.modules.background_checks.routes import (
    router as background_checks_router,
)

api_router = APIRouter()


api_router.include_router(
    health_router,
    tags=["Health"],
)

api_router.include_router(
    background_checks_router,

    tags=[
        "Background Checks"
    ],
)

api_router.include_router(
    background_authorization_router,

    tags=[
        "Background Check Authorization"
    ],
)

api_router.include_router(
    auth_router,
    tags=["Authentication"],
)

api_router.include_router(
    candidate_auth_router,
    tags=["Candidate Authentication"],
)

api_router.include_router(
    company_router,
    tags=["Company"],
)

api_router.include_router(
    applications_router,
    tags=["Applications"],
)

api_router.include_router(
    onboarding_router,
    tags=["Onboarding"],
)

api_router.include_router(
    storage_router,
    tags=["Secure Storage"],
)

api_router.include_router(
    drivers_license_router,
    tags=[
        "Driver's License Verification"
    ],
)

api_router.include_router(
    onboarding_profile_router,
    tags=[
        "Candidate Onboarding Profile"
    ],
)
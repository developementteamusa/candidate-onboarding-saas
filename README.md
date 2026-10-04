# Candidate Onboarding SaaS

Multi-tenant candidate onboarding platform built using Next.js,
FastAPI, MongoDB Atlas, and AWS.

## Current Development Stage

Phase 1 — Platform Foundation

Phase 1 includes:

- Repository structure
- Next.js frontend
- FastAPI backend
- Tailwind CSS
- Configuration management
- MongoDB Atlas connection
- Health endpoints
- REST API client
- Docker configuration

Business workflows, authentication, RBAC, AWS integrations,
and onboarding modules are intentionally excluded from Phase 1.

---

## Technology Stack

### Frontend

- Next.js 16.3
- App Router
- JavaScript
- React
- Tailwind CSS

TypeScript is not used in this project.

### Backend

- Python
- FastAPI
- Pydantic
- Pydantic Settings
- PyMongo
- MongoDB Atlas

### Cloud

Planned AWS services include:

- Amazon S3
- AWS KMS
- Amazon SES
- Amazon Rekognition
- AWS Secrets Manager

These services are not implemented during Phase 1.

---

## Architecture

The application uses a modular monolith architecture.

Browser
    |
    v
Next.js Frontend
    |
    | REST API
    v
FastAPI Backend
    |
    v
MongoDB Atlas

The backend is the security and data-access boundary.

MongoDB credentials and AWS credentials must never be exposed
to frontend code.

---

## Multi-Tenant Model

Companies will own candidates and related onboarding resources.

Future company-owned database records will contain a company_id.

Tenant isolation will be enforced server-side.

Client-supplied company_id values must never be treated as
authorization proof.

---

## Candidate Lifecycle

CREATE_ACCOUNT
    |
APPLICATION_DRAFT
    |
APPLICATION_SUBMITTED
    |
UNDER_REVIEW
    |
APPROVED
    |
ONBOARDING_INVITED
    |
ONBOARDING_IN_PROGRESS
    |
ONBOARDING_COMPLETE

The lifecycle is documented here for architectural context but
is not implemented during Phase 1.

---

## Onboarding Modules

Future onboarding functionality will include:

1. Driver's License Verification
2. Photo Upload
3. Selfie Identity Verification
4. Background Check
5. Legal Documents

---

## Environment Setup

Create backend/.env from:

backend/.env.example

Create frontend/.env.local from:

frontend/.env.example

Never commit real environment files.

---

## MongoDB Atlas

Set the following backend variables:

MONGODB_URI=<your Atlas connection string>
MONGODB_DATABASE=candidate_onboarding

The MongoDB connection string belongs only on the backend.

---

## Run Backend Locally

From the backend directory:

python -m venv .venv

Activate the virtual environment.

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Backend:

http://localhost:8000

API documentation:

http://localhost:8000/docs

Health:

http://localhost:8000/api/v1/health

Database health:

http://localhost:8000/api/v1/health/db

---

## Run Frontend Locally

From the frontend directory:

npm install

npm run dev

Frontend:

http://localhost:3000

---

## Docker

Make sure the backend .env file exists first.

Then run from the repository root:

docker compose up --build

Frontend:

http://localhost:3000

Backend:

http://localhost:8000

FastAPI documentation:

http://localhost:8000/docs

Stop the environment with:

docker compose down

---

## Security Rules

Never commit:

- MongoDB credentials
- AWS access keys
- AWS secret access keys
- application secrets
- production environment files

Never expose these values through NEXT_PUBLIC environment
variables.

All authorization and tenant-isolation decisions must be
performed by the backend.

---

## Phase 1 Boundary

Do not implement the following yet:

- Authentication
- User registration
- Company registration
- Candidate application workflow
- RBAC
- S3 uploads
- Rekognition
- SES email
- KMS integration
- Secrets Manager integration
- Background checks
- Driver's license verification
- Selfie verification
- Legal documents

These capabilities belong to later development phases.
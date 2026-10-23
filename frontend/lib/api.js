import { config } from "@/lib/config";


export async function apiRequest(
  endpoint,
  options = {}
) {
  const isServer =
    typeof window === "undefined";

  const baseUrl = isServer
    ? config.internalApiBaseUrl
    : config.publicApiBaseUrl;

  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,

    credentials: "include",

    cache: "no-store",

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data = null;

  const contentType =
    response.headers.get("content-type");

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    data = await response.json();
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail ||
        `API request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}


export async function getCsrfToken() {
  const response = await apiRequest(
    "/auth/csrf"
  );

  return response.csrf_token;
}


export async function login(
  email,
  password
) {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    "/auth/login",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
}


export async function logout() {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    "/auth/logout",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}


export function getCurrentUser() {
  return apiRequest(
    "/auth/me"
  );
}


export function getCurrentCompany() {
  return apiRequest(
    "/company/me"
  );
}


export function getApiHealth() {
  return apiRequest(
    "/health"
  );
}


export function getDatabaseHealth() {
  return apiRequest(
    "/health/db"
  );
}

export function getPublicCompany(
  companySlug
) {
  return apiRequest(
    `/company/public/${encodeURIComponent(
      companySlug
    )}`
  );
}


export async function getCandidateCsrfToken() {
  const response = await apiRequest(
    "/candidate-auth/csrf"
  );

  return response.csrf_token;
}


export async function registerCandidate(
  companySlug,
  firstName,
  lastName,
  email,
  password
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/candidate-auth/register",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        company_slug: companySlug,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    }
  );
}


export async function loginCandidate(
  companySlug,
  email,
  password
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/candidate-auth/login",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        company_slug: companySlug,
        email,
        password,
      }),
    }
  );
}


export function getCandidateApplication() {
  return apiRequest(
    "/applications/candidate/current"
  );
}


export async function saveCandidateApplication(
  application
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/applications/candidate/current",
    {
      method: "PUT",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify(application),
    }
  );
}


export async function submitCandidateApplication() {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/applications/candidate/current/submit",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}


export function getCompanyApplications() {
  return apiRequest(
    "/applications/company"
  );
}


export async function startApplicationReview(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    `/applications/company/${applicationId}/review`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}

export async function approveApplication(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    `/applications/company/${applicationId}/approve`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}

export async function sendOnboardingInvitation(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    `/onboarding/company/applications/${applicationId}/invite`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}


export async function acceptOnboardingInvitation(
  token
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/onboarding/candidate/accept",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        token,
      }),
    }
  );
}


export function getCandidateOnboardingStatus() {
  return apiRequest(
    "/onboarding/candidate/status"
  );
}

export async function requestSecureUpload({
  section,
  filename,
  contentType,
  fileSize,
}) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/storage/candidate/upload-url",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        section,
        filename,
        content_type: contentType,
        file_size: fileSize,
      }),
    }
  );
}


export async function uploadFileToS3(
  uploadUrl,
  file,
  requiredHeaders
) {
  const response = await fetch(
    uploadUrl,
    {
      method: "PUT",

      headers: {
        ...requiredHeaders,
      },

      body: file,
    }
  );

  if (!response.ok) {
    const responseText =
      await response.text();

    console.error(
      "S3 upload failed"
    );

    console.error(
      "HTTP status:",
      response.status
    );

    console.error(
      "S3 response:",
      responseText
    );

    console.error(
      "Required headers:",
      requiredHeaders
    );

    throw new Error(
      `S3 upload failed with status ${response.status}: ${responseText}`
    );
  }

  return response.headers.get(
    "ETag"
  );
}


export async function completeSecureUpload(
  uploadId
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/storage/candidate/complete",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        upload_id: uploadId,
      }),
    }
  );
}


export function getCandidateFiles() {
  return apiRequest(
    "/storage/candidate/files"
  );
}

export function getDriversLicenseStatus() {
  return apiRequest(
    "/drivers-license/candidate/status"
  );
}


export async function linkDriversLicenseUpload(
  uploadId,
  side
) {
  const csrfToken =
    await getCandidateCsrfToken();

  return apiRequest(
    "/drivers-license/candidate/link-upload",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },

      body: JSON.stringify({
        upload_id: uploadId,
        side,
      }),
    }
  );
}

export function getCompanyDriversLicenseReview(
  applicationId
) {
  return apiRequest(
    `/drivers-license/company/applications/${applicationId}`
  );
}


export async function runCompanyDriversLicenseOcr(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();

  return apiRequest(
    `/drivers-license/company/applications/${applicationId}/run-ocr`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );
}
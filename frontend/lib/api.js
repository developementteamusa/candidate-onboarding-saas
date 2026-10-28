const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not configured."
  );
}


/* =========================================================
   CORE API REQUEST
========================================================= */

export async function apiRequest(
  path,
  options = {}
) {
  const {
    headers: customHeaders = {},
    body,
    ...restOptions
  } = options;


  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };


  if (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData)
  ) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] =
        "application/json";
    }
  }


  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...restOptions,
        body,
        headers,
        credentials: "include",
      }
    );


  if (response.status === 204) {
    return null;
  }


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  let data = null;


  if (
    contentType.includes(
      "application/json"
    )
  ) {
    try {
      data =
        await response.json();

    } catch {
      data = null;
    }

  } else {
    try {
      const text =
        await response.text();

      data =
        text
          ? {
              detail: text,
            }
          : null;

    } catch {
      data = null;
    }
  }


  if (!response.ok) {
    throw new Error(
      extractApiError(
        data,
        response.status
      )
    );
  }


  return data;
}


/* =========================================================
   ERROR NORMALIZATION
========================================================= */

function extractApiError(
  data,
  status
) {
  if (!data) {
    return (
      `API request failed with status ${status}`
    );
  }


  if (
    typeof data.detail ===
    "string"
  ) {
    return data.detail;
  }


  if (
    Array.isArray(
      data.detail
    )
  ) {
    const messages =
      data.detail
        .map(
          (item) => {
            if (
              typeof item ===
              "string"
            ) {
              return item;
            }

            if (
              typeof item?.msg ===
              "string"
            ) {
              return item.msg;
            }

            if (
              typeof item?.message ===
              "string"
            ) {
              return item.message;
            }

            return null;
          }
        )
        .filter(Boolean);


    if (
      messages.length > 0
    ) {
      return messages.join(
        ", "
      );
    }
  }


  if (
    data.detail &&
    typeof data.detail ===
    "object"
  ) {
    if (
      typeof data.detail.message ===
      "string"
    ) {
      return data.detail.message;
    }


    if (
      typeof data.detail.error ===
      "string"
    ) {
      return data.detail.error;
    }


    if (
      typeof data.detail.detail ===
      "string"
    ) {
      return data.detail.detail;
    }


    try {
      return JSON.stringify(
        data.detail
      );

    } catch {
      return (
        `API request failed with status ${status}`
      );
    }
  }


  if (
    typeof data.message ===
    "string"
  ) {
    return data.message;
  }


  if (
    typeof data.error ===
    "string"
  ) {
    return data.error;
  }


  try {
    const serialized =
      JSON.stringify(
        data
      );

    if (
      serialized &&
      serialized !== "{}"
    ) {
      return serialized;
    }

  } catch {
    // Ignore.
  }


  return (
    `API request failed with status ${status}`
  );
}


/* =========================================================
   COMPANY CSRF
========================================================= */

export async function getCsrfToken() {
  const result =
    await apiRequest(
      "/auth/csrf",
      {
        method: "GET",
      }
    );


  if (!result?.csrf_token) {
    throw new Error(
      "CSRF token was not returned."
    );
  }


  return result.csrf_token;
}


/* =========================================================
   COMPANY AUTH
========================================================= */

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
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify({
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
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


export function getCurrentUser() {
  return apiRequest(
    "/auth/me",
    {
      method: "GET",
    }
  );
}


/* =========================================================
   COMPANY REGISTRATION
========================================================= */

export async function registerCompanyAccount(
  payload
) {
  const csrfToken =
    await getCsrfToken();


  return apiRequest(
    "/auth/company/register",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export async function registerCompany(
  payload
) {
  return registerCompanyAccount(
    payload
  );
}


/* =========================================================
   COMPANY PROFILE
========================================================= */

export function getCompanyProfile() {
  return apiRequest(
    "/company/me",
    {
      method: "GET",
    }
  );
}


/* =========================================================
   CANDIDATE CSRF
========================================================= */

export async function getCandidateCsrfToken() {
  const result =
    await apiRequest(
      "/candidate-auth/csrf",
      {
        method: "GET",
      }
    );


  if (!result?.csrf_token) {
    throw new Error(
      "Candidate CSRF token was not returned."
    );
  }


  return result.csrf_token;
}


/* =========================================================
   CANDIDATE AUTH
========================================================= */

export async function candidateLogin(
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
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify({
          company_slug:
            companySlug,

          email,

          password,
        }),
    }
  );
}


export async function candidateLogout() {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/candidate-auth/logout",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


export function getCurrentCandidate() {
  return apiRequest(
    "/candidate-auth/me",
    {
      method: "GET",
    }
  );
}


/* =========================================================
   CANDIDATE REGISTRATION
========================================================= */

export async function registerCandidate(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/candidate-auth/register",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


/* =========================================================
   CANDIDATE APPLICATION
========================================================= */

export function getCandidateApplication() {
  return apiRequest(
    "/applications/candidate",
    {
      method: "GET",
    }
  );
}


export async function saveCandidateApplication(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/applications/candidate",
    {
      method: "PUT",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export async function submitCandidateApplication() {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/applications/candidate/submit",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


/* =========================================================
   COMPANY APPLICATIONS
========================================================= */

export function getCompanyApplications() {
  return apiRequest(
    "/applications/company",
    {
      method: "GET",
    }
  );
}


export function getCompanyApplication(
  applicationId
) {
  return apiRequest(
    `/applications/company/${applicationId}`,
    {
      method: "GET",
    }
  );
}


/* =========================================================
   APPLICATION WORKFLOW
========================================================= */

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
        "X-CSRF-Token":
          csrfToken,
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
        "X-CSRF-Token":
          csrfToken,
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
    `/applications/company/${applicationId}/onboarding-invite`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


/* =========================================================
   CANDIDATE ONBOARDING
========================================================= */

export function getCandidateOnboarding() {
  return apiRequest(
    "/onboarding/candidate/status",
    {
      method: "GET",
    }
  );
}


export function getCandidateOnboardingStatus() {
  return getCandidateOnboarding();
}


/* =========================================================
   CANDIDATE INFORMATION / PROFILE
========================================================= */

export function getCandidateInformation() {
  return apiRequest(
    "/onboarding-profile/candidate/current",
    {
      method: "GET",
    }
  );
}


export async function saveCandidateInformation(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/onboarding-profile/candidate/current",
    {
      method: "PUT",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function getCandidateOnboardingProfile() {
  return getCandidateInformation();
}


export async function saveCandidateOnboardingProfile(
  payload
) {
  return saveCandidateInformation(
    payload
  );
}


/* =========================================================
   SECURE FILE UPLOAD
========================================================= */

export async function requestSecureUpload(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/onboarding/files/upload-request",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export async function uploadFileToS3(
  uploadUrl,
  file,
  extraHeaders = {}
) {
  const response =
    await fetch(
      uploadUrl,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            file.type ||
            "application/octet-stream",

          ...extraHeaders,
        },

        body: file,
      }
    );


  if (!response.ok) {
    throw new Error(
      `S3 upload failed with status ${response.status}`
    );
  }


  return true;
}


export async function completeSecureUpload(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/onboarding/files/upload-complete",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


/* =========================================================
   DRIVER'S LICENSE - CANDIDATE
========================================================= */

export function getCandidateDriverLicense() {
  return apiRequest(
    "/drivers-license/candidate/status",
    {
      method: "GET",
    }
  );
}


export function getDriversLicenseStatus() {
  return getCandidateDriverLicense();
}


/* =========================================================
   DRIVER'S LICENSE - LINK SECURE UPLOAD
========================================================= */

export async function linkDriversLicenseUpload(
  uploadId
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/drivers-license/candidate/link-upload",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify({
          upload_id:
            uploadId,
        }),
    }
  );
}


/* =========================================================
   DRIVER'S LICENSE DIRECT UPLOAD
========================================================= */

export async function uploadCandidateDriverLicense(
  side,
  file
) {
  const csrfToken =
    await getCandidateCsrfToken();


  const formData =
    new FormData();


  formData.append(
    "side",
    side
  );


  formData.append(
    "file",
    file
  );


  return apiRequest(
    "/drivers-license/candidate/upload",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        formData,
    }
  );
}


/* =========================================================
   DRIVER'S LICENSE - COMPANY
========================================================= */

export function getCompanyDriverLicense(
  applicationId
) {
  return apiRequest(
    `/drivers-license/company/applications/${applicationId}`,
    {
      method: "GET",
    }
  );
}


export async function processCompanyDriverLicense(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();


  return apiRequest(
    `/drivers-license/company/applications/${applicationId}/process`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


/* =========================================================
   DRIVER'S LICENSE MISMATCH
========================================================= */

export async function resolveDriverLicenseMismatch(
  applicationId,
  payload
) {
  const csrfToken =
    await getCsrfToken();


  return apiRequest(
    `/drivers-license/company/applications/${applicationId}/resolve`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


/* =========================================================
   DRIVER'S LICENSE LEGACY COMPATIBILITY
========================================================= */

export function getCompanyDriversLicenseReview(
  applicationId
) {
  return getCompanyDriverLicense(
    applicationId
  );
}


export async function resolveDriversLicenseMismatch(
  applicationId,
  payload
) {
  return resolveDriverLicenseMismatch(
    applicationId,
    payload
  );
}


export async function runCompanyDriversLicenseOcr(
  applicationId
) {
  return processCompanyDriverLicense(
    applicationId
  );
}


/* =========================================================
   BACKGROUND AUTHORIZATION - CANDIDATE
========================================================= */

export function getCandidateBackgroundAuthorization() {
  return apiRequest(
    "/background-authorization/candidate/current",
    {
      method: "GET",
    }
  );
}


export async function authorizeCandidateBackgroundCheck(
  payload
) {
  const csrfToken =
    await getCandidateCsrfToken();


  return apiRequest(
    "/background-authorization/candidate/current",
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


/* =========================================================
   BACKGROUND AUTHORIZATION - LEGACY COMPATIBILITY
========================================================= */

export function getBackgroundAuthorization() {
  return getCandidateBackgroundAuthorization();
}


export async function authorizeBackgroundCheck(
  payload
) {
  return authorizeCandidateBackgroundCheck(
    payload
  );
}


/* =========================================================
   BACKGROUND CHECK - COMPANY
========================================================= */

export function getCompanyBackgroundCheck(
  applicationId
) {
  return apiRequest(
    `/background-checks/company/applications/${applicationId}`,
    {
      method: "GET",
    }
  );
}


export async function startCompanyBackgroundCheck(
  applicationId
) {
  const csrfToken =
    await getCsrfToken();


  return apiRequest(
    `/background-checks/company/applications/${applicationId}`,
    {
      method: "POST",

      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
    }
  );
}


/* =========================================================
   COMPANY DOCUMENTS
========================================================= */

export function getCompanyDocuments() {
  return apiRequest(
    "/onboarding/company/documents",
    {
      method: "GET",
    }
  );
}


export function getCompanyDocumentView(
  documentId
) {
  return apiRequest(
    `/onboarding/company/documents/${documentId}/view`,
    {
      method: "GET",
    }
  );
}


/* =========================================================
   HEALTH
========================================================= */

export function healthCheck() {
  return apiRequest(
    "/health",
    {
      method: "GET",
    }
  );
}
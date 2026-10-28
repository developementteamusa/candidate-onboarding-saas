"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getBackgroundAuthorization,
  getCandidateOnboardingProfile,
  getCandidateOnboardingStatus,
  getDriversLicenseStatus,
} from "@/lib/api";


export default function OnboardingHome() {
  const [
    onboarding,
    setOnboarding,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    driversLicense,
    setDriversLicense,
  ] = useState(null);

  const [
    backgroundAuthorization,
    setBackgroundAuthorization,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOAD CANDIDATE ONBOARDING DATA
  ========================================================= */

  useEffect(() => {
    let active = true;


    async function loadDashboard() {
      setLoading(true);
      setError("");


      try {
        const results =
          await Promise.allSettled([
            getCandidateOnboardingStatus(),
            getCandidateOnboardingProfile(),
            getDriversLicenseStatus(),
            getBackgroundAuthorization(),
          ]);


        if (!active) {
          return;
        }


        const [
          onboardingResult,
          profileResult,
          licenseResult,
          authorizationResult,
        ] = results;


        if (
          onboardingResult.status ===
          "fulfilled"
        ) {
          setOnboarding(
            onboardingResult.value
          );
        }


        if (
          profileResult.status ===
          "fulfilled"
        ) {
          setProfile(
            profileResult.value
          );
        }


        if (
          licenseResult.status ===
          "fulfilled"
        ) {
          setDriversLicense(
            licenseResult.value
          );
        }


        if (
          authorizationResult.status ===
          "fulfilled"
        ) {
          setBackgroundAuthorization(
            authorizationResult.value
          );
        }


        /*
         * Do not make the entire dashboard unusable
         * just because one optional section failed.
         */
        const failures =
          results.filter(
            (result) =>
              result.status ===
              "rejected"
          );


        if (
          failures.length ===
          results.length
        ) {
          throw new Error(
            "Unable to load your onboarding workspace."
          );
        }

      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          getReadableError(
            err
          )
        );

      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }


    loadDashboard();


    return () => {
      active = false;
    };
  }, []);


  /* =========================================================
     ONBOARDING STATUS
  ========================================================= */

  const onboardingStatus =
    useMemo(
      () =>
        normalizeStatus(
          onboarding?.status ||
          onboarding?.onboarding_status ||
          onboarding?.workflow_status
        ),
      [
        onboarding,
      ]
    );


  /* =========================================================
     PROFILE STATUS
  ========================================================= */

  const profileComplete =
    useMemo(
      () =>
        hasCandidateProfile(
          profile
        ),
      [
        profile,
      ]
    );


  /* =========================================================
     DRIVER'S LICENSE STATUS
  ========================================================= */

  const licenseStatus =
    useMemo(
      () =>
        normalizeStatus(
          driversLicense?.status ||
          driversLicense?.verification_status ||
          driversLicense?.driver_license_status
        ),
      [
        driversLicense,
      ]
    );


  const licenseVerified =
    licenseStatus ===
    "VERIFIED";


  const licenseUploaded =
    Boolean(
      driversLicense?.front_uploaded &&
      driversLicense?.back_uploaded
    );


  /* =========================================================
     BACKGROUND AUTHORIZATION STATUS
  ========================================================= */

  const backgroundAuthorized =
    useMemo(
      () =>
        hasBackgroundAuthorization(
          backgroundAuthorization
        ),
      [
        backgroundAuthorization,
      ]
    );


  /* =========================================================
     COMPLETION SUMMARY
  ========================================================= */

  const completedCount =
    [
      profileComplete,
      licenseVerified,
      backgroundAuthorized,
    ].filter(Boolean).length;


  const activeSections = 3;


  const progressPercent =
    Math.round(
      (
        completedCount /
        activeSections
      ) * 100
    );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your onboarding workspace...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
          Candidate Onboarding
        </p>


        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Onboarding workspace
        </h1>


        <p className="mt-2 text-sm text-slate-600">
          Complete each onboarding section below and track your progress.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

          <p className="text-sm font-semibold text-red-700">
            Unable to load onboarding
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* =====================================================
          WORKFLOW STATUS
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Onboarding status
            </p>


            <p className="mt-1 text-lg font-bold text-slate-950">
              {
                formatStatus(
                  onboardingStatus
                )
              }
            </p>

          </div>


          <div className="sm:text-right">

            <p className="text-sm text-slate-500">
              Active sections completed
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {completedCount}/{activeSections}
            </p>

          </div>

        </div>


        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width:
                `${progressPercent}%`,
            }}
          />

        </div>


        <p className="mt-2 text-xs font-medium text-slate-500">
          {progressPercent}% of currently available onboarding sections completed
        </p>

      </section>


      {/* =====================================================
          ONBOARDING SECTIONS
      ====================================================== */}

      <div className="mt-6 space-y-4">

        {/* CANDIDATE INFORMATION */}

        <OnboardingCard
          title="Candidate Information"
          description="Provide your identity and contact information before continuing onboarding."
          href="/candidate/onboarding/information"
          status={
            profileComplete
              ? "Completed"
              : "Not started"
          }
          complete={
            profileComplete
          }
          actionLabel={
            profileComplete
              ? "Review"
              : "Open"
          }
        />


        {/* DRIVER'S LICENSE */}

        <OnboardingCard
          title="Driver's License Verification"
          description="Upload the front and back of your driver's license for secure verification."
          href="/candidate/onboarding/drivers-license"
          status={
            licenseVerified
              ? "Verified"
              : licenseUploaded
                ? "Uploaded"
                : "Not started"
          }
          complete={
            licenseVerified
          }
          actionLabel={
            licenseVerified
              ? "Review"
              : "Open"
          }
        />


        {/* PHOTO */}

        <ComingSoonCard
          title="Photo Upload"
          description="Upload your onboarding profile photo."
        />


        {/* SELFIE */}

        <ComingSoonCard
          title="Selfie Identity Verification"
          description="Complete identity verification using a selfie."
        />


        {/* BACKGROUND CHECK */}

        <OnboardingCard
          title="Background Check"
          description="Review the disclosure and provide authorization for employment screening."
          href="/candidate/onboarding/background-authorization"
          status={
            backgroundAuthorized
              ? "Authorized"
              : "Authorization required"
          }
          complete={
            backgroundAuthorized
          }
          actionLabel={
            backgroundAuthorized
              ? "Review"
              : "Open"
          }
        />


        {/* LEGAL DOCUMENTS */}

        <ComingSoonCard
          title="Legal Documents"
          description="Review and complete required onboarding documents."
        />

      </div>

    </div>
  );
}


/* =========================================================
   ACTIVE ONBOARDING CARD
========================================================= */

function OnboardingCard({
  title,
  description,
  href,
  status,
  complete,
  actionLabel,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        complete
          ? "border-emerald-200"
          : "border-slate-200"
      }`}
    >

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h2 className="text-base font-semibold text-slate-950">
              {title}
            </h2>


            {complete && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ✓ Complete
              </span>
            )}

          </div>


          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>


          <div className="mt-3">

            <StatusBadge
              status={
                status
              }
              complete={
                complete
              }
            />

          </div>

        </div>


        <Link
          href={
            href
          }
          className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            complete
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-950 text-white hover:bg-slate-800"
          }`}
        >
          {actionLabel} →
        </Link>

      </div>

    </div>
  );
}


/* =========================================================
   COMING SOON CARD
========================================================= */

function ComingSoonCard({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 opacity-75 shadow-sm">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-base font-semibold text-slate-700">
            {title}
          </h2>


          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>


          <p className="mt-3 text-xs font-medium text-slate-400">
            Not started
          </p>

        </div>


        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
          Coming soon
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  complete,
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        complete
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {complete && (
        <span className="mr-1">
          ✓
        </span>
      )}

      {status}
    </span>
  );
}


/* =========================================================
   PROFILE COMPLETE
========================================================= */

function hasCandidateProfile(
  profile
) {
  if (!profile) {
    return false;
  }


  /*
   * If the backend provides a direct completion field,
   * trust it first.
   */
  if (
    profile.completed === true ||
    profile.is_complete === true ||
    profile.profile_complete === true
  ) {
    return true;
  }


  /*
   * Otherwise infer completion from the saved profile.
   */
  const requiredFields = [
    profile.legal_first_name,
    profile.legal_last_name,
    profile.date_of_birth,
    profile.phone,
    profile.street_address,
    profile.city,
    profile.state,
    profile.postal_code,
  ];


  return requiredFields.every(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(
        value
      ).trim() !== ""
  );
}


/* =========================================================
   BACKGROUND AUTHORIZED
========================================================= */

function hasBackgroundAuthorization(
  authorization
) {
  if (!authorization) {
    return false;
  }


  if (
    authorization.authorized === true ||
    authorization.is_authorized === true ||
    authorization.completed === true
  ) {
    return true;
  }


  const status =
    normalizeStatus(
      authorization.status ||
      authorization.authorization_status
    );


  if (
    [
      "AUTHORIZED",
      "COMPLETED",
      "COMPLETE",
    ].includes(
      status
    )
  ) {
    return true;
  }


  /*
   * The working authorization page already receives
   * an authorization timestamp/name after completion.
   */
  return Boolean(
    authorization.authorized_at ||
    authorization.authorization_date ||
    authorization.authorized_by ||
    authorization.full_legal_name
  );
}


/* =========================================================
   STATUS HELPERS
========================================================= */

function normalizeStatus(
  status
) {
  if (!status) {
    return "ONBOARDING_IN_PROGRESS";
  }


  return String(
    status
  )
    .trim()
    .toUpperCase();
}


function formatStatus(
  status
) {
  const labels = {
    CREATE_ACCOUNT:
      "Account created",

    APPLICATION_DRAFT:
      "Application draft",

    APPLICATION_SUBMITTED:
      "Application submitted",

    UNDER_REVIEW:
      "Under review",

    APPROVED:
      "Approved",

    ONBOARDING_INVITED:
      "Onboarding invited",

    ONBOARDING_IN_PROGRESS:
      "Onboarding in progress",

    ONBOARDING_COMPLETE:
      "Onboarding complete",
  };


  if (
    labels[
      status
    ]
  ) {
    return labels[
      status
    ];
  }


  return String(
    status
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


/* =========================================================
   ERROR
========================================================= */

function getReadableError(
  error
) {
  if (!error) {
    return "Unable to load onboarding.";
  }


  if (
    error instanceof Error
  ) {
    return (
      error.message ||
      "Unable to load onboarding."
    );
  }


  if (
    typeof error ===
    "string"
  ) {
    return error;
  }


  try {
    return JSON.stringify(
      error
    );

  } catch {
    return "Unable to load onboarding.";
  }
}
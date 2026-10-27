"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCompanyApplications,
  getCompanyBackgroundCheck,
} from "@/lib/api";


export default function BackgroundChecksPage() {
  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    checksByApplication,
    setChecksByApplication,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");


  useEffect(() => {
    async function loadData() {
      try {
        const applicationData =
          await getCompanyApplications();

        const list =
          Array.isArray(
            applicationData
          )
            ? applicationData
            : [];

        setApplications(
          list
        );


        const onboardingCandidates =
          list.filter(
            (application) =>
              [
                "ONBOARDING_INVITED",
                "ONBOARDING_IN_PROGRESS",
                "ONBOARDING_COMPLETE",
              ].includes(
                application.status
              )
          );


        const results =
          await Promise.allSettled(
            onboardingCandidates.map(
              async (
                application
              ) => {
                const result =
                  await getCompanyBackgroundCheck(
                    application.id
                  );

                return {
                  applicationId:
                    application.id,

                  result,
                };
              }
            )
          );


        const mapped = {};


        results.forEach(
          (entry) => {
            if (
              entry.status !==
              "fulfilled"
            ) {
              return;
            }

            mapped[
              entry.value
                .applicationId
            ] =
              entry.value.result;
          }
        );


        setChecksByApplication(
          mapped
        );

      } catch (err) {
        setError(
          err.message ||
            "Unable to load background checks."
        );

      } finally {
        setLoading(false);
      }
    }


    loadData();
  }, []);


  const screeningCandidates =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();


        return applications
          .filter(
            (application) =>
              [
                "ONBOARDING_INVITED",
                "ONBOARDING_IN_PROGRESS",
                "ONBOARDING_COMPLETE",
              ].includes(
                application.status
              )
          )
          .filter(
            (application) => {
              if (!normalized) {
                return true;
              }


              const fullName =
                [
                  application.first_name,
                  application.last_name,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();


              const email =
                (
                  application.email ||
                  ""
                ).toLowerCase();


              return (
                fullName.includes(
                  normalized
                ) ||
                email.includes(
                  normalized
                )
              );
            }
          );
      },
      [
        applications,
        search,
      ]
    );


  const metrics =
    useMemo(
      () => {
        let ready = 0;
        let requested = 0;
        let inProgress = 0;
        let completed = 0;


        Object.values(
          checksByApplication
        ).forEach(
          (item) => {
            if (
              item?.eligibility
                ?.eligible &&
              !item?.background_check
            ) {
              ready += 1;
            }


            const status =
              item
                ?.background_check
                ?.status;


            if (
              status ===
              "REQUESTED"
            ) {
              requested += 1;
            }


            if (
              status ===
              "IN_PROGRESS"
            ) {
              inProgress += 1;
            }


            if (
              status ===
              "COMPLETE"
            ) {
              completed += 1;
            }
          }
        );


        return {
          ready,
          requested,
          inProgress,
          completed,
        };
      },
      [
        checksByApplication,
      ]
    );


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading background checks...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-8">

      {/* HEADER */}

      <section>

        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
          Screening Operations
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Background Checks
        </h2>

        <p className="mt-2 text-slate-600">
          Monitor screening readiness,
          authorization, and background-check
          request status.
        </p>

      </section>


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* KPI */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Ready for screening"
          value={
            metrics.ready
          }
          tone="blue"
        />

        <Metric
          label="Requested"
          value={
            metrics.requested
          }
          tone="cyan"
        />

        <Metric
          label="In progress"
          value={
            metrics.inProgress
          }
          tone="violet"
        />

        <Metric
          label="Completed"
          value={
            metrics.completed
          }
          tone="emerald"
        />

      </section>


      {/* SEARCH */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="relative max-w-md">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            value={
              search
            }
            onChange={
              (event) =>
                setSearch(
                  event.target.value
                )
            }
            placeholder="Search screening candidates..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

        </div>

      </section>


      {/* LIST */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h3 className="text-lg font-semibold text-slate-950">
            Screening candidates
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Review prerequisites and background-check status.
          </p>

        </div>


        {screeningCandidates.length ===
        0 ? (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              ◇
            </div>

            <h4 className="mt-5 font-semibold text-slate-900">
              No screening candidates yet
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Candidates will appear here once onboarding begins.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {screeningCandidates.map(
              (application) => (
                <BackgroundCheckRow
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                  data={
                    checksByApplication[
                      application.id
                    ]
                  }
                />
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}


function BackgroundCheckRow({
  application,
  data,
}) {
  const fullName =
    [
      application.first_name,
      application.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Candidate";


  const eligibility =
    data?.eligibility;

  const backgroundCheck =
    data?.background_check;


  const status =
    backgroundCheck?.status ||
    (
      eligibility?.eligible
        ? "READY"
        : "NOT_READY"
    );


  return (
    <div className="grid gap-5 px-6 py-5 xl:grid-cols-[1.15fr_0.8fr_0.8fr_0.9fr_auto] xl:items-center">

      <div>

        <h4 className="font-semibold text-slate-950">
          {fullName}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {
            application.email ||
            "No email"
          }
        </p>

      </div>


      <RequirementValue
        label="License"
        complete={
          Boolean(
            eligibility
              ?.driver_license_verified
          )
        }
      />


      <RequirementValue
        label="Authorization"
        complete={
          Boolean(
            eligibility
              ?.authorization_completed
          )
        }
      />


      <div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-400">
          Screening status
        </p>

        <div className="mt-2">

          <BackgroundStatusBadge
            status={
              status
            }
          />

        </div>

      </div>


      <div className="xl:text-right">

        <Link
          href={`/dashboard/applications/${application.id}/background-check`}
          className={
            eligibility?.eligible
              ? "inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              : "inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          }
        >
          {backgroundCheck
            ? "View check"
            : eligibility?.eligible
              ? "Start screening"
              : "Review requirements"}
        </Link>

      </div>

    </div>
  );
}


function RequirementValue({
  label,
  complete,
}) {
  return (
    <div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>

      <div className="mt-2">

        <span
          className={
            complete
              ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
          }
        >
          {complete
            ? "Complete"
            : "Required"}
        </span>

      </div>

    </div>
  );
}


function BackgroundStatusBadge({
  status,
}) {
  const config = {
    READY: {
      label:
        "Ready",

      className:
        "bg-blue-50 text-blue-700",
    },

    NOT_READY: {
      label:
        "Not ready",

      className:
        "bg-amber-50 text-amber-700",
    },

    REQUESTED: {
      label:
        "Requested",

      className:
        "bg-cyan-50 text-cyan-700",
    },

    IN_PROGRESS: {
      label:
        "In progress",

      className:
        "bg-violet-50 text-violet-700",
    },

    COMPLETE: {
      label:
        "Completed",

      className:
        "bg-emerald-50 text-emerald-700",
    },

    FAILED: {
      label:
        "Failed",

      className:
        "bg-red-50 text-red-700",
    },
  };


  const current =
    config[status] || {
      label:
        status,

      className:
        "bg-slate-100 text-slate-700",
    };


  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}


function Metric({
  label,
  value,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600",

    cyan:
      "bg-cyan-50 text-cyan-600",

    violet:
      "bg-violet-50 text-violet-600",

    emerald:
      "bg-emerald-50 text-emerald-600",
  };


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${tones[tone]}`}
        >
          ◇
        </div>

      </div>

    </div>
  );
}
"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCompanyApplications,
} from "@/lib/api";


export default function OnboardingPage() {
  const [
    applications,
    setApplications,
  ] = useState([]);

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
        const data =
          await getCompanyApplications();

        setApplications(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {
        setError(
          err.message ||
            "Unable to load onboarding data."
        );

      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);


  const onboardingCandidates =
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

              const name =
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
                name.includes(
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
        const invited =
          applications.filter(
            (application) =>
              application.status ===
              "ONBOARDING_INVITED"
          ).length;

        const inProgress =
          applications.filter(
            (application) =>
              application.status ===
              "ONBOARDING_IN_PROGRESS"
          ).length;

        const completed =
          applications.filter(
            (application) =>
              application.status ===
              "ONBOARDING_COMPLETE"
          ).length;

        return {
          invited,
          inProgress,
          completed,
          total:
            invited +
            inProgress +
            completed,
        };
      },
      [
        applications,
      ]
    );


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading onboarding activity...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-8">

      <section>

        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
          Onboarding Operations
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Onboarding
        </h2>

        <p className="mt-2 text-slate-600">
          Monitor candidate progress through the
          onboarding workflow.
        </p>

      </section>


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Onboarding total"
          value={
            metrics.total
          }
          tone="blue"
        />

        <Metric
          label="Invited"
          value={
            metrics.invited
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
            placeholder="Search onboarding candidates..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

        </div>

      </section>


      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h3 className="text-lg font-semibold text-slate-950">
            Candidate onboarding
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Track onboarding stage and progress.
          </p>

        </div>


        {onboardingCandidates.length ===
        0 ? (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              ✓
            </div>

            <h4 className="mt-5 font-semibold text-slate-900">
              No onboarding activity yet
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Candidates will appear here after an onboarding invitation is sent.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {onboardingCandidates.map(
              (application) => (
                <OnboardingRow
                  key={
                    application.id
                  }
                  application={
                    application
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


function OnboardingRow({
  application,
}) {
  const fullName =
    [
      application.first_name,
      application.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Candidate";


  const stage =
    getOnboardingStage(
      application.status
    );


  const progress =
    getOnboardingProgress(
      application.status
    );


  return (
    <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">

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


      <div>

        <div className="flex items-center justify-between text-xs">

          <span className="font-medium text-slate-600">
            {stage}
          </span>

          <span className="font-semibold text-slate-500">
            {progress}%
          </span>

        </div>


        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </div>


      <div className="flex flex-wrap gap-2 lg:justify-end">

        <Link
          href={`/dashboard/applications/${application.id}/drivers-license`}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Driver&apos;s license
        </Link>

        <Link
          href={`/dashboard/applications/${application.id}/background-check`}
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          Background check
        </Link>

      </div>

    </div>
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
          ✓
        </div>

      </div>

    </div>
  );
}


function getOnboardingStage(
  status
) {
  const stages = {
    ONBOARDING_INVITED:
      "Invitation sent",

    ONBOARDING_IN_PROGRESS:
      "Onboarding in progress",

    ONBOARDING_COMPLETE:
      "Completed",
  };


  return (
    stages[status] ||
    "Onboarding"
  );
}


function getOnboardingProgress(
  status
) {
  const progress = {
    ONBOARDING_INVITED:
      15,

    ONBOARDING_IN_PROGRESS:
      60,

    ONBOARDING_COMPLETE:
      100,
  };


  return (
    progress[status] ||
    0
  );
}
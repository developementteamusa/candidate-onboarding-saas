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


const FILTERS = [
  "ALL",
  "APPLICATION_SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ONBOARDING_INVITED",
  "ONBOARDING_IN_PROGRESS",
  "ONBOARDING_COMPLETE",
];


export default function CandidatesPage() {
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

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");


  useEffect(() => {
    async function loadCandidates() {
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
            "Unable to load candidates."
        );

      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);


  const filteredCandidates =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();


        return applications.filter(
          (application) => {
            const matchesStatus =
              statusFilter === "ALL" ||
              application.status ===
                statusFilter;


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


            const matchesSearch =
              !normalized ||
              fullName.includes(
                normalized
              ) ||
              email.includes(
                normalized
              );


            return (
              matchesStatus &&
              matchesSearch
            );
          }
        );
      },
      [
        applications,
        search,
        statusFilter,
      ]
    );


  const metrics =
    useMemo(
      () => {
        const total =
          applications.length;

        const onboarding =
          applications.filter(
            (application) =>
              [
                "ONBOARDING_INVITED",
                "ONBOARDING_IN_PROGRESS",
              ].includes(
                application.status
              )
          ).length;

        const completed =
          applications.filter(
            (application) =>
              application.status ===
              "ONBOARDING_COMPLETE"
          ).length;

        const review =
          applications.filter(
            (application) =>
              application.status ===
              "UNDER_REVIEW"
          ).length;


        return {
          total,
          onboarding,
          completed,
          review,
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
            Loading candidates...
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
          Candidate Directory
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Candidates
        </h2>

        <p className="mt-2 text-slate-600">
          View candidate records and jump
          directly into their application
          and onboarding workflows.
        </p>

      </section>


      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* KPI */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <CandidateMetric
          label="Total candidates"
          value={
            metrics.total
          }
          tone="blue"
        />

        <CandidateMetric
          label="Under review"
          value={
            metrics.review
          }
          tone="amber"
        />

        <CandidateMetric
          label="Onboarding"
          value={
            metrics.onboarding
          }
          tone="violet"
        />

        <CandidateMetric
          label="Completed"
          value={
            metrics.completed
          }
          tone="emerald"
        />

      </section>


      {/* SEARCH */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

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
              placeholder="Search candidates..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>


          <div className="flex flex-col gap-3 sm:flex-row">

            <select
              value={
                statusFilter
              }
              onChange={
                (event) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
            >

              {FILTERS.map(
                (status) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {
                      getStatusLabel(
                        status
                      )
                    }
                  </option>
                )
              )}

            </select>


            <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {
                filteredCandidates.length
              }{" "}
              candidate
              {
                filteredCandidates.length ===
                1
                  ? ""
                  : "s"
              }
            </div>

          </div>

        </div>

      </section>


      {/* DIRECTORY */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h3 className="text-lg font-semibold text-slate-950">
            Candidate directory
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Candidates associated with your
            company workspace.
          </p>

        </div>


        {filteredCandidates.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              ♙
            </div>

            <h4 className="mt-5 font-semibold text-slate-900">

              {applications.length === 0
                ? "No candidates yet"
                : "No matching candidates"}

            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">

              {applications.length === 0
                ? "Candidates will appear here after they submit an application."
                : "Try changing your search or status filter."}

            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredCandidates.map(
              (application) => (
                <CandidateDirectoryRow
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


function CandidateMetric({
  label,
  value,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600",

    amber:
      "bg-amber-50 text-amber-600",

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
          ●
        </div>

      </div>

    </div>
  );
}


function CandidateDirectoryRow({
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


  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .slice(
        0,
        2
      )
      .toUpperCase();


  const onboardingStarted =
    [
      "ONBOARDING_INVITED",
      "ONBOARDING_IN_PROGRESS",
      "ONBOARDING_COMPLETE",
    ].includes(
      application.status
    );


  return (
    <div className="grid gap-5 px-6 py-5 transition hover:bg-slate-50/70 lg:grid-cols-[1fr_auto] lg:items-center">

      <div className="flex min-w-0 items-center gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-sm font-bold text-slate-700">
          {initials}
        </div>


        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h4 className="truncate font-semibold text-slate-950">
              {fullName}
            </h4>

            <StatusBadge
              status={
                application.status
              }
            />

          </div>


          <p className="mt-1 truncate text-sm text-slate-500">
            {
              application.email ||
              "No email"
            }
          </p>


          <p className="mt-2 text-xs text-slate-400">
            {
              getStageLabel(
                application.status
              )
            }
          </p>

        </div>

      </div>


      <div className="flex flex-wrap gap-2 lg:justify-end">

        <Link
          href="/dashboard/applications"
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Applications
        </Link>


        {onboardingStarted && (
          <>
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
          </>
        )}

      </div>

    </div>
  );
}


function StatusBadge({
  status,
}) {
  const config = {
    APPLICATION_SUBMITTED: {
      label:
        "Submitted",

      className:
        "bg-slate-100 text-slate-700",
    },

    UNDER_REVIEW: {
      label:
        "Under review",

      className:
        "bg-amber-50 text-amber-700",
    },

    APPROVED: {
      label:
        "Approved",

      className:
        "bg-blue-50 text-blue-700",
    },

    ONBOARDING_INVITED: {
      label:
        "Invited",

      className:
        "bg-cyan-50 text-cyan-700",
    },

    ONBOARDING_IN_PROGRESS: {
      label:
        "Onboarding",

      className:
        "bg-violet-50 text-violet-700",
    },

    ONBOARDING_COMPLETE: {
      label:
        "Completed",

      className:
        "bg-emerald-50 text-emerald-700",
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


function getStatusLabel(
  status
) {
  const labels = {
    ALL:
      "All statuses",

    APPLICATION_SUBMITTED:
      "Submitted",

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


  return (
    labels[status] ||
    status
  );
}


function getStageLabel(
  status
) {
  const stages = {
    APPLICATION_SUBMITTED:
      "Application submitted",

    UNDER_REVIEW:
      "Company review",

    APPROVED:
      "Approved for onboarding",

    ONBOARDING_INVITED:
      "Invitation sent",

    ONBOARDING_IN_PROGRESS:
      "Onboarding in progress",

    ONBOARDING_COMPLETE:
      "Onboarding complete",
  };


  return (
    stages[status] ||
    "Candidate workflow"
  );
}
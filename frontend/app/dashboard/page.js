"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  getCurrentCompany,
  getCompanyApplications,
} from "@/lib/api";


export default function CompanyDashboardPage() {
  const [user, setUser] =
    useState(null);

  const [company, setCompany] =
    useState(null);

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          userData,
          companyData,
          applicationData,
        ] = await Promise.all([
          getCurrentUser(),
          getCurrentCompany(),
          getCompanyApplications(),
        ]);

        setUser(userData);
        setCompany(companyData);

        setApplications(
          Array.isArray(
            applicationData
          )
            ? applicationData
            : []
        );

      } catch (err) {
        setError(
          err.message ||
            "Unable to load dashboard."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


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

        const approved =
          applications.filter(
            (application) =>
              application.status ===
              "APPROVED"
          ).length;


        return {
          total,
          onboarding,
          completed,
          approved,
        };
      },
      [
        applications,
      ]
    );


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-sm text-slate-500">
        Loading company workspace...
      </div>
    );
  }


  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }


  const companyName =
    company?.name ||
    "Company Workspace";


  const firstName =
    user?.first_name ||
    "Admin";


  return (
    <div className="space-y-8">

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
            Company workspace
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {companyName}
          </h2>

          <p className="mt-2 text-slate-600">
            Welcome back,{" "}
            <span className="font-medium text-slate-800">
              {firstName}
            </span>
            . Here&apos;s what&apos;s happening with your candidates.
          </p>

        </div>


        <div className="flex flex-wrap gap-3">

          <Link
            href="/dashboard/applications"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View applications
          </Link>

          <Link
            href="/dashboard/applications"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Manage candidates
          </Link>

        </div>

      </section>


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          label="Total applications"
          value={metrics.total}
          icon="◫"
          tone="blue"
        />

        <MetricCard
          label="Onboarding in progress"
          value={metrics.onboarding}
          icon="✓"
          tone="emerald"
        />

        <MetricCard
          label="Approved"
          value={metrics.approved}
          icon="◇"
          tone="amber"
        />

        <MetricCard
          label="Completed onboarding"
          value={metrics.completed}
          icon="●"
          tone="violet"
        />

      </section>


      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">

        {/* RECENT CANDIDATES */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>

              <h3 className="text-lg font-semibold text-slate-950">
                Recent candidates
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Latest applications and onboarding activity.
              </p>

            </div>


            <Link
              href="/dashboard/applications"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>

          </div>


          {applications.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                ◫
              </div>

              <h4 className="mt-4 font-semibold text-slate-900">
                No applications yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Candidate applications will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {applications
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    application
                  ) => (
                    <CandidateRow
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

        </div>


        {/* ONBOARDING SUMMARY */}

        <div className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-slate-950">
                  Onboarding
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current workflow progress.
                </p>

              </div>

            </div>


            <div className="mt-7 flex justify-center">

              <ProgressRing
                total={
                  metrics.total
                }

                completed={
                  metrics.completed
                }

                onboarding={
                  metrics.onboarding
                }
              />

            </div>


            <div className="mt-7 space-y-3">

              <Legend
                label="Completed"
                value={
                  metrics.completed
                }
                dotClass="bg-emerald-500"
              />

              <Legend
                label="In progress"
                value={
                  metrics.onboarding
                }
                dotClass="bg-blue-500"
              />

              <Legend
                label="Approved"
                value={
                  metrics.approved
                }
                dotClass="bg-amber-400"
              />

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="text-lg font-semibold text-slate-950">
              Quick actions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly into common company tasks.
            </p>


            <div className="mt-5 space-y-3">

              <QuickAction
                href="/dashboard/applications"
                title="Review applications"
                description="Start reviews and approve candidates."
              />

              <QuickAction
                href="/dashboard/background-checks"
                title="Background checks"
                description="Manage screening-ready candidates."
              />

              <QuickAction
                href="/dashboard/onboarding"
                title="Onboarding activity"
                description="Monitor candidate progress."
              />

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


function MetricCard({
  label,
  value,
  icon,
  tone,
}) {
  const tones = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      accent:
        "text-blue-600",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600",
      accent:
        "text-emerald-600",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      accent:
        "text-amber-600",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-600",
      accent:
        "text-violet-600",
    },
  };


  const current =
    tones[tone];


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${current.icon}`}
        >
          {icon}
        </div>

      </div>


      <p
        className={`mt-4 text-xs font-semibold ${current.accent}`}
      >
        Live workspace data
      </p>

    </div>
  );
}


function CandidateRow({
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


  return (
    <Link
      href={`/dashboard/applications/${application.id}`}
      className="grid gap-4 px-6 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
    >

      <div className="flex items-center gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-xs font-bold text-slate-700">
          {initials}
        </div>


        <div className="min-w-0">

          <div className="truncate font-semibold text-slate-900">
            {fullName}
          </div>

          <div className="mt-1 truncate text-sm text-slate-500">
            {application.email}
          </div>

        </div>

      </div>


      <StatusBadge
        status={
          application.status
        }
      />

    </Link>
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
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}


function ProgressRing({
  total,
  completed,
  onboarding,
}) {
  const denominator =
    total || 1;

  const completedPercent =
    Math.min(
      100,
      Math.round(
        (
          completed /
          denominator
        ) * 100
      )
    );


  const onboardingPercent =
    Math.min(
      100,
      Math.round(
        (
          onboarding /
          denominator
        ) * 100
      )
    );


  const combined =
    Math.min(
      100,
      completedPercent +
        onboardingPercent
    );


  return (
    <div
      className="flex h-44 w-44 items-center justify-center rounded-full"
      style={{
        background:
          `conic-gradient(
            #10b981 0% ${completedPercent}%,
            #3b82f6 ${completedPercent}% ${combined}%,
            #e2e8f0 ${combined}% 100%
          )`,
      }}
    >

      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">

        <strong className="text-3xl text-slate-950">
          {onboarding}
        </strong>

        <span className="mt-1 text-xs text-slate-500">
          In progress
        </span>

      </div>

    </div>
  );
}


function Legend({
  label,
  value,
  dotClass,
}) {
  return (
    <div className="flex items-center justify-between text-sm">

      <div className="flex items-center gap-3">

        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-slate-600">
          {label}
        </span>

      </div>

      <strong className="text-slate-900">
        {value}
      </strong>

    </div>
  );
}


function QuickAction({
  href,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
    >

      <div>

        <div className="text-sm font-semibold text-slate-900">
          {title}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {description}
        </div>

      </div>

      <span className="ml-4 text-blue-600">
        →
      </span>

    </Link>
  );
}
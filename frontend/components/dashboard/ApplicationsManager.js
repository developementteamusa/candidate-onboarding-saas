"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  approveApplication,
  getCompanyApplications,
  sendOnboardingInvitation,
  startApplicationReview,
} from "@/lib/api";


const STATUS_OPTIONS = [
  "ALL",
  "APPLICATION_SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ONBOARDING_INVITED",
  "ONBOARDING_IN_PROGRESS",
  "ONBOARDING_COMPLETE",
];


export default function ApplicationsManager() {
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
    message,
    setMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    busyApplicationId,
    setBusyApplicationId,
  ] = useState(null);


  async function loadApplications() {
    setError("");

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
          "Unable to load applications."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadApplications();
  }, []);


  async function handleReview(
    applicationId
  ) {
    setError("");
    setMessage("");
    setBusyApplicationId(
      applicationId
    );

    try {
      await startApplicationReview(
        applicationId
      );

      setMessage(
        "Application moved to review."
      );

      await loadApplications();

    } catch (err) {
      setError(
        err.message ||
          "Unable to start review."
      );

    } finally {
      setBusyApplicationId(
        null
      );
    }
  }


  async function handleApprove(
    applicationId
  ) {
    setError("");
    setMessage("");
    setBusyApplicationId(
      applicationId
    );

    try {
      await approveApplication(
        applicationId
      );

      setMessage(
        "Application approved successfully."
      );

      await loadApplications();

    } catch (err) {
      setError(
        err.message ||
          "Unable to approve application."
      );

    } finally {
      setBusyApplicationId(
        null
      );
    }
  }


  async function handleInvite(
    applicationId
  ) {
    setError("");
    setMessage("");
    setBusyApplicationId(
      applicationId
    );

    try {
      await sendOnboardingInvitation(
        applicationId
      );

      setMessage(
        "Onboarding invitation sent successfully."
      );

      await loadApplications();

    } catch (err) {
      setError(
        err.message ||
          "Unable to send onboarding invitation."
      );

    } finally {
      setBusyApplicationId(
        null
      );
    }
  }


  const metrics =
    useMemo(
      () => {
        const total =
          applications.length;

        const submitted =
          applications.filter(
            (application) =>
              application.status ===
              "APPLICATION_SUBMITTED"
          ).length;

        const review =
          applications.filter(
            (application) =>
              application.status ===
              "UNDER_REVIEW"
          ).length;

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


        return {
          total,
          submitted,
          review,
          onboarding,
        };
      },
      [
        applications,
      ]
    );


  const filteredApplications =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return applications.filter(
          (application) => {

            const matchesStatus =
              statusFilter ===
                "ALL" ||
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
              !normalizedSearch ||
              fullName.includes(
                normalizedSearch
              ) ||
              email.includes(
                normalizedSearch
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


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading applications...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
            Candidate Management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Applications
          </h2>

          <p className="mt-2 text-slate-600">
            Review candidate applications
            and manage onboarding activity.
          </p>

        </div>


        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              loadApplications
            }
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Refresh
          </button>

        </div>

      </section>


      {/* =====================================================
          ALERTS
      ====================================================== */}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total applications"
          value={
            metrics.total
          }
          tone="blue"
          icon="◫"
        />

        <SummaryCard
          label="New submissions"
          value={
            metrics.submitted
          }
          tone="slate"
          icon="●"
        />

        <SummaryCard
          label="Under review"
          value={
            metrics.review
          }
          tone="amber"
          icon="◇"
        />

        <SummaryCard
          label="Onboarding"
          value={
            metrics.onboarding
          }
          tone="emerald"
          icon="✓"
        />

      </section>


      {/* =====================================================
          FILTER BAR
      ====================================================== */}

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
                (
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search candidate name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>


          <div className="flex flex-col gap-3 sm:flex-row">

            <select
              value={
                statusFilter
              }
              onChange={
                (
                  event
                ) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
            >

              {STATUS_OPTIONS.map(
                (
                  status
                ) => (
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
                filteredApplications.length
              }{" "}
              result
              {
                filteredApplications.length ===
                1
                  ? ""
                  : "s"
              }
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>

            <h3 className="text-lg font-semibold text-slate-950">
              Candidate applications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track candidates through
              review and onboarding.
            </p>

          </div>

        </div>


        {filteredApplications.length ===
        0 ? (
          <EmptyState
            hasApplications={
              applications.length >
              0
            }
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                    <TableHeading>
                      Candidate
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading>
                      Stage
                    </TableHeading>

                    <TableHeading>
                      Email
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredApplications.map(
                    (
                      application
                    ) => (
                      <ApplicationRow
                        key={
                          application.id
                        }

                        application={
                          application
                        }

                        busy={
                          busyApplicationId ===
                          application.id
                        }

                        onReview={
                          handleReview
                        }

                        onApprove={
                          handleApprove
                        }

                        onInvite={
                          handleInvite
                        }
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* MOBILE */}

            <div className="divide-y divide-slate-100 lg:hidden">

              {filteredApplications.map(
                (
                  application
                ) => (
                  <ApplicationMobileCard
                    key={
                      application.id
                    }

                    application={
                      application
                    }

                    busy={
                      busyApplicationId ===
                      application.id
                    }

                    onReview={
                      handleReview
                    }

                    onApprove={
                      handleApprove
                    }

                    onInvite={
                      handleInvite
                    }
                  />
                )
              )}

            </div>
          </>
        )}

      </section>

    </div>
  );
}


/* =========================================================
   APPLICATION ROW
========================================================= */

function ApplicationRow({
  application,
  busy,
  onReview,
  onApprove,
  onInvite,
}) {
  const fullName =
    getFullName(
      application
    );

  const initials =
    getInitials(
      fullName
    );


  return (
    <tr className="transition hover:bg-slate-50/80">

      <td className="px-6 py-4">

        <div className="flex items-center gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-xs font-bold text-slate-700">
            {initials}
          </div>


          <div>

            <p className="font-semibold text-slate-900">
              {fullName}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              ID:{" "}
              {
                application.id
                  ?.slice(
                    -6
                  )
                  .toUpperCase()
              }
            </p>

          </div>

        </div>

      </td>


      <td className="px-6 py-4">

        <StatusBadge
          status={
            application.status
          }
        />

      </td>


      <td className="px-6 py-4 text-sm text-slate-600">

        {
          getStageLabel(
            application.status
          )
        }

      </td>


      <td className="px-6 py-4 text-sm text-slate-600">

        {
          application.email ||
          "—"
        }

      </td>


      <td className="px-6 py-4">

        <div className="flex justify-end">

          <ApplicationActions
            application={
              application
            }

            busy={
              busy
            }

            onReview={
              onReview
            }

            onApprove={
              onApprove
            }

            onInvite={
              onInvite
            }
          />

        </div>

      </td>

    </tr>
  );
}


/* =========================================================
   MOBILE CARD
========================================================= */

function ApplicationMobileCard({
  application,
  busy,
  onReview,
  onApprove,
  onInvite,
}) {
  const fullName =
    getFullName(
      application
    );


  return (
    <div className="p-5">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="font-semibold text-slate-950">
            {fullName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {
              application.email
            }
          </p>

        </div>


        <StatusBadge
          status={
            application.status
          }
        />

      </div>


      <div className="mt-4 text-sm text-slate-500">

        Stage:{" "}

        <span className="font-medium text-slate-700">
          {
            getStageLabel(
              application.status
            )
          }
        </span>

      </div>


      <div className="mt-5">

        <ApplicationActions
          application={
            application
          }

          busy={
            busy
          }

          onReview={
            onReview
          }

          onApprove={
            onApprove
          }

          onInvite={
            onInvite
          }
        />

      </div>

    </div>
  );
}


/* =========================================================
   ACTIONS
========================================================= */

function ApplicationActions({
  application,
  busy,
  onReview,
  onApprove,
  onInvite,
}) {
  const status =
    application.status;


  const onboardingStarted =
    [
      "ONBOARDING_INVITED",
      "ONBOARDING_IN_PROGRESS",
      "ONBOARDING_COMPLETE",
    ].includes(
      status
    );


  return (
    <div className="flex flex-wrap justify-end gap-2">

      {status ===
        "APPLICATION_SUBMITTED" && (
        <ActionButton
          disabled={
            busy
          }
          onClick={() =>
            onReview(
              application.id
            )
          }
        >
          {busy
            ? "Working..."
            : "Start review"}
        </ActionButton>
      )}


      {status ===
        "UNDER_REVIEW" && (
        <ActionButton
          primary
          disabled={
            busy
          }
          onClick={() =>
            onApprove(
              application.id
            )
          }
        >
          {busy
            ? "Working..."
            : "Approve"}
        </ActionButton>
      )}


      {status ===
        "APPROVED" && (
        <ActionButton
          primary
          disabled={
            busy
          }
          onClick={() =>
            onInvite(
              application.id
            )
          }
        >
          {busy
            ? "Sending..."
            : "Send invite"}
        </ActionButton>
      )}


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
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Background check
          </Link>
        </>
      )}

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ActionButton({
  children,
  onClick,
  disabled,
  primary = false,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={
        primary
          ? "rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          : "rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}


function SummaryCard({
  label,
  value,
  tone,
  icon,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600",

    slate:
      "bg-slate-100 text-slate-600",

    amber:
      "bg-amber-50 text-amber-600",

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
          {icon}
        </div>

      </div>

    </div>
  );
}


function TableHeading({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
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


function EmptyState({
  hasApplications,
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
        ◫
      </div>

      <h4 className="mt-5 font-semibold text-slate-900">

        {hasApplications
          ? "No matching applications"
          : "No applications yet"}

      </h4>


      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">

        {hasApplications
          ? "Try changing your search or status filter."
          : "Candidate applications submitted to your company will appear here."}

      </p>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getFullName(
  application
) {
  return (
    [
      application.first_name,
      application.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Candidate"
  );
}


function getInitials(
  fullName
) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map(
      (
        part
      ) =>
        part[0]
    )
    .join("")
    .slice(
      0,
      2
    )
    .toUpperCase();
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
      "Application review",

    UNDER_REVIEW:
      "Application review",

    APPROVED:
      "Approval complete",

    ONBOARDING_INVITED:
      "Invitation sent",

    ONBOARDING_IN_PROGRESS:
      "Candidate onboarding",

    ONBOARDING_COMPLETE:
      "Finished onboarding",
  };


  return (
    stages[status] ||
    "Application"
  );
}
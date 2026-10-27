"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCompanyApplications,
  getCompanyDocuments,
  getCompanyBackgroundCheck,
} from "@/lib/api";


export default function ReportsPage() {
  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [
    backgroundChecks,
    setBackgroundChecks,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadReports() {
      try {
        setError("");


        const [
          applicationData,
          documentData,
        ] = await Promise.all([
          getCompanyApplications(),
          getCompanyDocuments(),
        ]);


        const applicationList =
          Array.isArray(
            applicationData
          )
            ? applicationData
            : [];


        const documentList =
          Array.isArray(
            documentData
          )
            ? documentData
            : [];


        setApplications(
          applicationList
        );

        setDocuments(
          documentList
        );


        const screeningCandidates =
          applicationList.filter(
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
            screeningCandidates.map(
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


        setBackgroundChecks(
          mapped
        );

      } catch (err) {
        setError(
          err?.message ||
            "Unable to load reports."
        );

      } finally {
        setLoading(false);
      }
    }


    loadReports();
  }, []);


  const metrics =
    useMemo(
      () => {
        const totalApplications =
          applications.length;


        const submitted =
          applications.filter(
            (application) =>
              application.status ===
              "APPLICATION_SUBMITTED"
          ).length;


        const underReview =
          applications.filter(
            (application) =>
              application.status ===
              "UNDER_REVIEW"
          ).length;


        const approved =
          applications.filter(
            (application) =>
              application.status ===
              "APPROVED"
          ).length;


        const invited =
          applications.filter(
            (application) =>
              application.status ===
              "ONBOARDING_INVITED"
          ).length;


        const onboarding =
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


        const totalDocuments =
          documents.length;


        const documentCandidates =
          new Set(
            documents
              .map(
                (document) =>
                  document.candidate_id
              )
              .filter(Boolean)
          ).size;


        let screeningReady = 0;
        let screeningRequested = 0;
        let screeningInProgress = 0;
        let screeningCompleted = 0;


        Object.values(
          backgroundChecks
        ).forEach(
          (item) => {
            const eligibility =
              item?.eligibility;

            const check =
              item?.background_check;


            if (
              eligibility?.eligible &&
              !check
            ) {
              screeningReady += 1;
            }


            if (
              check?.status ===
              "REQUESTED"
            ) {
              screeningRequested += 1;
            }


            if (
              check?.status ===
              "IN_PROGRESS"
            ) {
              screeningInProgress += 1;
            }


            if (
              check?.status ===
              "COMPLETE"
            ) {
              screeningCompleted += 1;
            }
          }
        );


        const completionRate =
          totalApplications > 0
            ? Math.round(
                (
                  completed /
                  totalApplications
                ) * 100
              )
            : 0;


        const onboardingRate =
          totalApplications > 0
            ? Math.round(
                (
                  (
                    invited +
                    onboarding +
                    completed
                  ) /
                  totalApplications
                ) * 100
              )
            : 0;


        return {
          totalApplications,
          submitted,
          underReview,
          approved,
          invited,
          onboarding,
          completed,
          totalDocuments,
          documentCandidates,
          screeningReady,
          screeningRequested,
          screeningInProgress,
          screeningCompleted,
          completionRate,
          onboardingRate,
        };
      },
      [
        applications,
        documents,
        backgroundChecks,
      ]
    );


  const workflowRows =
    useMemo(
      () => [
        {
          label:
            "Application submitted",

          value:
            metrics.submitted,

          tone:
            "slate",
        },

        {
          label:
            "Under review",

          value:
            metrics.underReview,

          tone:
            "amber",
        },

        {
          label:
            "Approved",

          value:
            metrics.approved,

          tone:
            "blue",
        },

        {
          label:
            "Onboarding invited",

          value:
            metrics.invited,

          tone:
            "cyan",
        },

        {
          label:
            "Onboarding in progress",

          value:
            metrics.onboarding,

          tone:
            "violet",
        },

        {
          label:
            "Completed",

          value:
            metrics.completed,

          tone:
            "emerald",
        },
      ],
      [
        metrics,
      ]
    );


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading reports...
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

      <section>

        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
          Operational Analytics
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Reports
        </h2>

        <p className="mt-2 text-slate-600">
          Monitor application activity,
          onboarding progress, document volume,
          and background-check readiness.
        </p>

      </section>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          PRIMARY KPIS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          label="Total applications"
          value={
            metrics.totalApplications
          }
          helper="All candidate applications"
          tone="blue"
        />

        <MetricCard
          label="Onboarding"
          value={
            metrics.onboarding
          }
          helper="Currently in progress"
          tone="violet"
        />

        <MetricCard
          label="Documents"
          value={
            metrics.totalDocuments
          }
          helper="Secure files uploaded"
          tone="cyan"
        />

        <MetricCard
          label="Completed onboarding"
          value={
            metrics.completed
          }
          helper={`${metrics.completionRate}% completion rate`}
          tone="emerald"
        />

      </section>


      {/* =====================================================
          PERFORMANCE SUMMARY
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

        {/* WORKFLOW */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h3 className="text-lg font-semibold text-slate-950">
              Candidate workflow
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Distribution of candidates across
              the application and onboarding
              lifecycle.
            </p>

          </div>


          <div className="p-6">

            <div className="space-y-5">

              {workflowRows.map(
                (row) => (
                  <WorkflowBar
                    key={
                      row.label
                    }

                    label={
                      row.label
                    }

                    value={
                      row.value
                    }

                    total={
                      metrics.totalApplications
                    }

                    tone={
                      row.tone
                    }
                  />
                )
              )}

            </div>

          </div>

        </div>


        {/* RATES */}

        <div className="space-y-6">

          <RateCard
            label="Onboarding conversion"
            value={
              metrics.onboardingRate
            }
            description="Applications that have reached the onboarding stage."
          />

          <RateCard
            label="Completion rate"
            value={
              metrics.completionRate
            }
            description="Applications that completed onboarding."
          />

        </div>

      </section>


      {/* =====================================================
          BACKGROUND CHECKS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h3 className="text-lg font-semibold text-slate-950">
            Background-check activity
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Current screening readiness and request
            activity.
          </p>

        </div>


        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">

          <SmallMetric
            label="Ready"
            value={
              metrics.screeningReady
            }
            tone="blue"
          />

          <SmallMetric
            label="Requested"
            value={
              metrics.screeningRequested
            }
            tone="cyan"
          />

          <SmallMetric
            label="In progress"
            value={
              metrics.screeningInProgress
            }
            tone="violet"
          />

          <SmallMetric
            label="Completed"
            value={
              metrics.screeningCompleted
            }
            tone="emerald"
          />

        </div>

      </section>


      {/* =====================================================
          DOCUMENT ACTIVITY
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <h3 className="text-lg font-semibold text-slate-950">
                Document activity
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Files stored for candidate
                onboarding.
              </p>

            </div>


            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              ▤
            </div>

          </div>


          <div className="mt-8 grid grid-cols-2 gap-4">

            <ReportValue
              label="Uploaded files"
              value={
                metrics.totalDocuments
              }
            />

            <ReportValue
              label="Candidates with files"
              value={
                metrics.documentCandidates
              }
            />

          </div>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <h3 className="text-lg font-semibold text-slate-950">
                Application pipeline
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current review and approval
                workload.
              </p>

            </div>


            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              ◇
            </div>

          </div>


          <div className="mt-8 grid grid-cols-2 gap-4">

            <ReportValue
              label="Awaiting review"
              value={
                metrics.submitted
              }
            />

            <ReportValue
              label="Under review"
              value={
                metrics.underReview
              }
            />

            <ReportValue
              label="Approved"
              value={
                metrics.approved
              }
            />

            <ReportValue
              label="Invited"
              value={
                metrics.invited
              }
            />

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   MAIN KPI CARD
========================================================= */

function MetricCard({
  label,
  value,
  helper,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600",

    violet:
      "bg-violet-50 text-violet-600",

    cyan:
      "bg-cyan-50 text-cyan-600",

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

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${tones[tone]}`}
        >
          ●
        </div>

      </div>


      <p className="mt-4 text-xs font-medium text-slate-400">
        {helper}
      </p>

    </div>
  );
}


/* =========================================================
   WORKFLOW BAR
========================================================= */

function WorkflowBar({
  label,
  value,
  total,
  tone,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (
            value /
            total
          ) * 100
        )
      : 0;


  const tones = {
    slate:
      "bg-slate-400",

    amber:
      "bg-amber-400",

    blue:
      "bg-blue-500",

    cyan:
      "bg-cyan-500",

    violet:
      "bg-violet-500",

    emerald:
      "bg-emerald-500",
  };


  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <div className="flex items-center gap-3">

          <span className="text-xs text-slate-400">
            {percentage}%
          </span>

          <span className="min-w-[24px] text-right text-sm font-semibold text-slate-900">
            {value}
          </span>

        </div>

      </div>


      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${tones[tone]}`}
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   RATE CARD
========================================================= */

function RateCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>


      <div className="mt-4 flex items-end gap-2">

        <span className="text-4xl font-bold tracking-tight text-slate-950">
          {value}
        </span>

        <span className="pb-1 text-lg font-semibold text-slate-400">
          %
        </span>

      </div>


      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
          style={{
            width:
              `${Math.min(
                100,
                value
              )}%`,
          }}
        />

      </div>


      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   SMALL METRIC
========================================================= */

function SmallMetric({
  label,
  value,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-700",

    cyan:
      "bg-cyan-50 text-cyan-700",

    violet:
      "bg-violet-50 text-violet-700",

    emerald:
      "bg-emerald-50 text-emerald-700",
  };


  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">

      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
      >
        {label}
      </div>


      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   REPORT VALUE
========================================================= */

function ReportValue({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>

    </div>
  );
}
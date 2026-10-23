"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  approveApplication,
  getCompanyApplications,
  sendOnboardingInvitation,
  startApplicationReview,
} from "@/lib/api";


export default function ApplicationsManager() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
   * Temporary Phase 4 / Phase 6 UI permission.
   *
   * The backend remains the real security
   * enforcement point through RBAC.
   *
   * Later we can replace this with the
   * authenticated user's role.
   */
  const canInvite = true;


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
    }
  }


  async function handleApprove(
    applicationId
  ) {
    setError("");
    setMessage("");

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
    }
  }


  async function handleInvite(
    applicationId
  ) {
    setError("");
    setMessage("");

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
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading applications...
      </div>
    );
  }


  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Company Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Candidate Applications
        </h1>

        <p className="mt-3 text-slate-600">
          Review applications and manage
          candidate onboarding.
        </p>
      </div>


      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}


      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No applications found.
        </div>
      ) : (
        <div className="space-y-4">

          {applications.map(
            (application) => {
              const status =
                application.status;


              const showDriversLicense =
                [
                  "ONBOARDING_INVITED",
                  "ONBOARDING_IN_PROGRESS",
                  "ONBOARDING_COMPLETE",
                ].includes(
                  status
                );


              return (
                <div
                  key={application.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {application.first_name}{" "}
                        {application.last_name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {application.email}
                      </p>

                      <p className="mt-3 text-sm">
                        Status:{" "}
                        <span className="font-semibold text-slate-900">
                          {status}
                        </span>
                      </p>
                    </div>


                    <div className="flex flex-wrap gap-3">

                      {status ===
                        "APPLICATION_SUBMITTED" && (
                        <button
                          type="button"

                          onClick={() =>
                            handleReview(
                              application.id
                            )
                          }

                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Start review
                        </button>
                      )}


                      {status ===
                        "UNDER_REVIEW" && (
                        <button
                          type="button"

                          onClick={() =>
                            handleApprove(
                              application.id
                            )
                          }

                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Approve
                        </button>
                      )}


                      {status ===
                        "APPROVED" &&
                        canInvite && (
                          <button
                            type="button"

                            onClick={() =>
                              handleInvite(
                                application.id
                              )
                            }

                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Send onboarding invite
                          </button>
                        )}


                      {showDriversLicense && (
                        <Link
                          href={`/dashboard/applications/${application.id}/drivers-license`}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Driver&apos;s license
                        </Link>
                      )}

                    </div>

                  </div>
                </div>
              );
            }
          )}

        </div>
      )}
    </div>
  );
}
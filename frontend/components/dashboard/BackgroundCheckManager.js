"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCompanyBackgroundCheck,
  startCompanyBackgroundCheck,
} from "@/lib/api";


export default function BackgroundCheckManager({
  applicationId,
}) {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  async function loadData() {
    try {
      const result =
        await getCompanyBackgroundCheck(
          applicationId
        );

      setData(result);

    } catch (err) {
      setError(
        err.message ||
          "Unable to load background check."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, [applicationId]);


  async function handleStart() {
    setStarting(true);
    setError("");
    setMessage("");

    try {
      const result =
        await startCompanyBackgroundCheck(
          applicationId
        );

      setData(result);

      setMessage(
        "Background check request created successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to start background check."
      );

    } finally {
      setStarting(false);
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading background check...
      </div>
    );
  }


  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ||
          "Background check information unavailable."}
      </div>
    );
  }


  const eligibility =
    data.eligibility;

  const backgroundCheck =
    data.background_check;


  return (
    <div>

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Company Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Background Check
        </h1>

        <p className="mt-3 text-slate-600">
          Review prerequisites and start
          the candidate&apos;s background
          check.
        </p>

      </div>


      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}


      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <p className="text-sm text-slate-500">
          Candidate
        </p>

        <h2 className="mt-1 text-lg font-semibold">
          {data.candidate_name}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {data.candidate_email}
        </p>

      </div>


      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="text-lg font-semibold">
          Prerequisites
        </h2>


        <div className="mt-5 space-y-3">

          <Requirement
            label="Onboarding in progress"

            complete={
              eligibility
                .application_status_ok
            }
          />


          <Requirement
            label="Candidate information completed"

            complete={
              eligibility
                .profile_completed
            }
          />


          <Requirement
            label="Driver's license verified"

            complete={
              eligibility
                .driver_license_verified
            }
          />


          <Requirement
            label="Background check authorized"

            complete={
              eligibility
                .authorization_completed
            }
          />

        </div>

      </div>


      {!backgroundCheck &&
        eligibility.eligible && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h2 className="font-semibold text-blue-950">
            Ready to start
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            All required prerequisites
            have been completed.
          </p>

          <button
            type="button"

            disabled={
              starting
            }

            onClick={
              handleStart
            }

            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {starting
              ? "Starting..."
              : "Start background check"}
          </button>

        </div>
      )}


      {!backgroundCheck &&
        !eligibility.eligible && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">

          <h2 className="font-semibold text-amber-900">
            Not ready
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            {eligibility.reason}
          </p>

        </div>
      )}


      {backgroundCheck && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">

          <h2 className="text-lg font-semibold text-green-950">
            Background check requested
          </h2>

          <p className="mt-4">
            Status:{" "}
            <strong>
              {
                backgroundCheck.status
              }
            </strong>
          </p>

          <p className="mt-2 text-sm text-green-800">
            Provider:{" "}
            {
              backgroundCheck.provider
            }
          </p>

          <p className="mt-2 text-sm text-green-800">
            Reference:{" "}
            {
              backgroundCheck
                .provider_reference
            }
          </p>

        </div>
      )}

    </div>
  );
}


function Requirement({
  label,
  complete,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

      <span className="text-sm font-medium">
        {label}
      </span>

      <span
        className={
          complete
            ? "font-semibold text-green-700"
            : "font-semibold text-amber-700"
        }
      >
        {complete
          ? "Complete"
          : "Required"}
      </span>

    </div>
  );
}
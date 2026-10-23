"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCandidateApplication,
  saveCandidateApplication,
  submitCandidateApplication,
} from "@/lib/api";


export default function CandidateApplication() {
  const [application, setApplication] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadApplication() {
      try {
        const data =
          await getCandidateApplication();

        setApplication(data);

      } catch (err) {
        setError(
          err.message ||
            "Unable to load application."
        );
      }
    }

    loadApplication();
  }, []);


  function updateField(
    field,
    value
  ) {
    setApplication((current) => ({
      ...current,
      [field]: value,
    }));
  }


  async function saveDraft() {
    setError("");
    setMessage("");

    try {
      const updated =
        await saveCandidateApplication({
          phone:
            application.phone || "",

          street_address:
            application.street_address || "",

          city:
            application.city || "",

          state:
            application.state || "",

          postal_code:
            application.postal_code || "",
        });

      setApplication(updated);

      setMessage(
        "Application saved."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to save application."
      );
    }
  }


 async function submitApplication() {
  setError("");
  setMessage("");

  try {
    // First persist the candidate's latest form values.
    const savedApplication =
      await saveCandidateApplication({
        phone:
          application.phone || "",

        street_address:
          application.street_address || "",

        city:
          application.city || "",

        state:
          application.state || "",

        postal_code:
          application.postal_code || "",
      });

    setApplication(
      savedApplication
    );

    // Only submit after the draft has been
    // successfully persisted to MongoDB.
    const submittedApplication =
      await submitCandidateApplication();

    setApplication(
      submittedApplication
    );

    setMessage(
      "Application submitted successfully."
    );

  } catch (err) {
    setError(
      err.message ||
        "Unable to submit application."
    );
  }
}


  if (error && !application) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }


  if (!application) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading application...
      </div>
    );
  }


  const editable =
    application.status ===
    "APPLICATION_DRAFT";


  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Candidate Application
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Your application
        </h1>

        <p className="mt-3 text-slate-600">
          Status:{" "}
          <span className="font-semibold text-slate-900">
            {application.status}
          </span>
        </p>
      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6">

          <ApplicationField
            label="Phone"
            value={application.phone}
            disabled={!editable}
            onChange={(value) =>
              updateField(
                "phone",
                value
              )
            }
          />

          <ApplicationField
            label="Street address"
            value={
              application.street_address
            }
            disabled={!editable}
            onChange={(value) =>
              updateField(
                "street_address",
                value
              )
            }
          />

          <ApplicationField
            label="City"
            value={application.city}
            disabled={!editable}
            onChange={(value) =>
              updateField(
                "city",
                value
              )
            }
          />

          <ApplicationField
            label="State"
            value={application.state}
            disabled={!editable}
            onChange={(value) =>
              updateField(
                "state",
                value
              )
            }
          />

          <ApplicationField
            label="Postal code"
            value={
              application.postal_code
            }
            disabled={!editable}
            onChange={(value) =>
              updateField(
                "postal_code",
                value
              )
            }
          />

        </div>


        {message && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}


        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {editable && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Save draft
            </button>

            <button
              type="button"
              onClick={submitApplication}
              className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Submit application
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


function ApplicationField({
  label,
  value,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type="text"
        disabled={disabled}
        value={value || ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}
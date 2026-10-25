"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCompanyDriversLicenseReview,
  resolveDriversLicenseMismatch,
  runCompanyDriversLicenseOcr,
} from "@/lib/api";


const fieldLabels = {
  first_name:
    "First name",

  last_name:
    "Last name",

  date_of_birth:
    "Date of birth",

  driver_license_number:
    "Driver's license number",

  driver_license_state:
    "Issuing state",
};


export default function DriversLicenseReview({
  applicationId,
}) {
  const [review, setReview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [resolving, setResolving] =
    useState(false);

  const [
    resolutions,
    setResolutions,
  ] = useState({});

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  async function loadReview() {
    setError("");

    try {
      const data =
        await getCompanyDriversLicenseReview(
          applicationId
        );

      setReview(data);

    } catch (err) {
      setError(
        err.message ||
          "Unable to load driver's license verification."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadReview();
  }, [applicationId]);


  async function processLicense() {
    setError("");
    setMessage("");
    setProcessing(true);

    try {
      const data =
        await runCompanyDriversLicenseOcr(
          applicationId
        );

      setReview(data);

      setMessage(
        "Driver's license OCR completed successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to process driver's license."
      );

      await loadReview();

    } finally {
      setProcessing(false);
    }
  }


  function handleResolutionChange(
    fieldName,
    resolution
  ) {
    setResolutions(
      (current) => ({
        ...current,

        [fieldName]:
          resolution,
      })
    );

    setError("");
    setMessage("");
  }


  async function handleResolveMismatch() {
    const comparison =
      review?.verification
        ?.comparison_result ||
      {};


    const fieldsNeedingReview =
      Object.entries(
        comparison
      )
        .filter(
          ([, field]) =>
            [
              "MISMATCH",
              "NOT_AVAILABLE",
            ].includes(
              field.result
            )
        )
        .map(
          ([fieldName]) =>
            fieldName
        );


    const missingSelections =
      fieldsNeedingReview.filter(
        (fieldName) =>
          !resolutions[
            fieldName
          ]
      );


    if (
      missingSelections.length
      > 0
    ) {
      setError(
        "Choose a resolution for every mismatched field."
      );

      return;
    }


    const payload =
      fieldsNeedingReview.map(
        (fieldName) => ({
          field_name:
            fieldName,

          resolution:
            resolutions[
              fieldName
            ],
        })
      );


    setResolving(true);
    setError("");
    setMessage("");


    try {
      const data =
        await resolveDriversLicenseMismatch(
          applicationId,
          payload
        );


      setReview(data);

      setMessage(
        "Identity mismatch resolved successfully."
      );


      setResolutions({});

    } catch (err) {
      setError(
        err.message ||
          "Unable to resolve identity mismatch."
      );

    } finally {
      setResolving(false);
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading driver&apos;s license verification...
      </div>
    );
  }


  if (
    error &&
    !review
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }


  const verification =
    review?.verification;


  const canProcess =
    verification?.status ===
      "READY_FOR_OCR" ||
    verification?.status ===
      "OCR_FAILED";


  const comparison =
    verification
      ?.comparison_result ||
    {};


  return (
    <div>

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Company Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Driver&apos;s License Verification
        </h1>

        <p className="mt-3 text-slate-600">
          Review and process the
          candidate&apos;s securely
          uploaded license.
        </p>

      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <p className="text-sm text-slate-500">
          Candidate
        </p>

        <h2 className="mt-1 text-lg font-semibold">
          {review?.candidate_name}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {review?.candidate_email}
        </p>


        <div className="mt-6 border-t border-slate-200 pt-6">

          <p className="text-sm text-slate-500">
            Verification status
          </p>

          <p className="mt-1 font-semibold">
            {verification?.status}
          </p>

        </div>

      </div>


      {message && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}


      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <UploadState
          title="Front of license"

          uploaded={
            verification
              ?.front_uploaded
          }
        />


        <UploadState
          title="Back of license"

          uploaded={
            verification
              ?.back_uploaded
          }
        />

      </div>


      {canProcess && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h2 className="font-semibold text-blue-950">
            Ready for OCR
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            Both sides of the
            driver&apos;s license are
            available for Amazon
            Textract processing.
          </p>

          <button
            type="button"

            disabled={
              processing
            }

            onClick={
              processLicense
            }

            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {processing
              ? "Processing..."
              : verification
                    ?.status ===
                  "OCR_FAILED"
                ? "Retry processing"
                : "Process driver's license"}
          </button>

        </div>
      )}


      {[
        "MATCH",
        "REVIEW_REQUIRED",
        "VERIFIED",
      ].includes(
        verification?.status
      ) && (
        <ComparisonResults
          comparison={
            comparison
          }

          status={
            verification?.status
          }

          resolutions={
            resolutions
          }

          onResolutionChange={
            handleResolutionChange
          }

          onResolveMismatch={
            handleResolveMismatch
          }

          resolving={
            resolving
          }

          verifiedIdentity={
            verification
              ?.verified_identity
          }

          reviewResolution={
            verification
              ?.review_resolution
          }
        />
      )}

    </div>
  );
}


function UploadState({
  title,
  uploaded,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <p className="font-semibold">
        {title}
      </p>

      <p
        className={
          uploaded
            ? "mt-2 text-sm font-medium text-green-700"
            : "mt-2 text-sm text-slate-500"
        }
      >
        {uploaded
          ? "Uploaded"
          : "Not uploaded"}
      </p>

    </div>
  );
}


function ComparisonResults({
  comparison,
  status,
  resolutions,
  onResolutionChange,
  onResolveMismatch,
  resolving,
  verifiedIdentity,
  reviewResolution,
}) {
  const entries =
    Object.entries(
      comparison || {}
    );


  if (
    entries.length === 0
  ) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        No identity comparison data is
        available.
      </div>
    );
  }


  return (
    <div className="mt-8">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Identity Comparison
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Compare the candidate-entered
          information with the values
          extracted from the
          driver&apos;s license.
        </p>

      </div>


      {status ===
        "REVIEW_REQUIRED" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">

          <p className="font-semibold text-amber-900">
            Manual review required
          </p>

          <p className="mt-2 text-sm text-amber-800">
            One or more identity fields
            do not match. Resolve each
            highlighted field below.
          </p>

        </div>
      )}


      {status ===
        "MATCH" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">

          <p className="font-semibold text-green-900">
            Automated comparison passed
          </p>

          <p className="mt-2 text-sm text-green-800">
            All required identity fields
            match.
          </p>

        </div>
      )}


      {status ===
        "VERIFIED" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">

          <p className="font-semibold text-green-900">
            Identity verified
          </p>

          <p className="mt-2 text-sm text-green-800">
            The mismatch was resolved
            by an authorized company
            reviewer.
          </p>

        </div>
      )}


      <div className="space-y-4">

        {entries.map(
          ([
            fieldName,
            field,
          ]) => {

            const needsReview =
              [
                "MISMATCH",
                "NOT_AVAILABLE",
              ].includes(
                field.result
              );


            return (
              <div
                key={fieldName}

                className={
                  needsReview
                    ? "rounded-xl border border-amber-300 bg-amber-50 p-6"
                    : "rounded-xl border border-green-200 bg-white p-6"
                }
              >

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <p className="font-semibold text-slate-950">
                      {fieldLabels[
                        fieldName
                      ] ||
                        fieldName}
                    </p>

                    <p
                      className={
                        needsReview
                          ? "mt-2 text-sm font-semibold text-amber-700"
                          : "mt-2 text-sm font-semibold text-green-700"
                      }
                    >
                      {field.result}
                    </p>

                  </div>


                  {field.confidence !=
                    null && (
                    <div className="text-sm text-slate-500">
                      OCR confidence:{" "}
                      {Number(
                        field.confidence
                      ).toFixed(
                        2
                      )}
                      %
                    </div>
                  )}

                </div>


                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  <ValueCard
                    label="Candidate entered"
                    value={
                      field.candidate_value
                    }
                  />


                  <ValueCard
                    label="Driver's license OCR"
                    value={
                      field.extracted_value
                    }
                  />

                </div>


                {needsReview &&
                  status ===
                    "REVIEW_REQUIRED" && (
                  <div className="mt-6">

                    <p className="text-sm font-semibold text-slate-700">
                      Select the value to
                      use:
                    </p>


                    <div className="mt-3 grid gap-3">

                      <ResolutionOption
                        name={
                          fieldName
                        }

                        checked={
                          resolutions[
                            fieldName
                          ] ===
                          "USE_CANDIDATE_VALUE"
                        }

                        value="USE_CANDIDATE_VALUE"

                        label={`Use candidate value: ${
                          field.candidate_value ||
                          "Not available"
                        }`}

                        disabled={
                          !field.candidate_value
                        }

                        onChange={() =>
                          onResolutionChange(
                            fieldName,
                            "USE_CANDIDATE_VALUE"
                          )
                        }
                      />


                      <ResolutionOption
                        name={
                          fieldName
                        }

                        checked={
                          resolutions[
                            fieldName
                          ] ===
                          "USE_LICENSE_VALUE"
                        }

                        value="USE_LICENSE_VALUE"

                        label={`Use license value: ${
                          field.extracted_value ||
                          "Not available"
                        }`}

                        disabled={
                          !field.extracted_value
                        }

                        onChange={() =>
                          onResolutionChange(
                            fieldName,
                            "USE_LICENSE_VALUE"
                          )
                        }
                      />

                    </div>

                  </div>
                )}


                {status ===
                  "VERIFIED" &&
                  reviewResolution?.[
                    fieldName
                  ] && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">

                    <p className="font-semibold text-blue-900">
                      Manual resolution
                    </p>

                    <p className="mt-2 text-blue-800">
                      Selected value:{" "}
                      {
                        reviewResolution[
                          fieldName
                        ]
                          .selected_value
                      }
                    </p>

                    <p className="mt-1 text-blue-800">
                      Source:{" "}
                      {
                        reviewResolution[
                          fieldName
                        ].source
                      }
                    </p>

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>


      {status ===
        "REVIEW_REQUIRED" && (
        <button
          type="button"

          disabled={
            resolving
          }

          onClick={
            onResolveMismatch
          }

          className="mt-8 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resolving
            ? "Resolving..."
            : "Resolve mismatch"}
        </button>
      )}


      {status ===
        "VERIFIED" &&
        verifiedIdentity && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">

          <h3 className="font-semibold text-green-950">
            Verified Identity
          </h3>


          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {Object.entries(
              verifiedIdentity
            ).map(
              ([
                fieldName,
                value,
              ]) => (
                <ValueCard
                  key={
                    fieldName
                  }

                  label={
                    fieldLabels[
                      fieldName
                    ] ||
                    fieldName
                  }

                  value={
                    value
                  }
                />
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}


function ValueCard({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-950">
        {value ||
          "Not available"}
      </p>

    </div>
  );
}


function ResolutionOption({
  name,
  checked,
  label,
  disabled,
  onChange,
}) {
  return (
    <label
      className={
        disabled
          ? "flex cursor-not-allowed items-start gap-3 rounded-lg border border-slate-200 bg-slate-100 p-4 opacity-60"
          : checked
            ? "flex cursor-pointer items-start gap-3 rounded-lg border border-blue-400 bg-blue-50 p-4"
            : "flex cursor-pointer items-start gap-3 rounded-lg border border-slate-300 bg-white p-4 hover:bg-slate-50"
      }
    >

      <input
        type="radio"

        name={
          `resolution-${name}`
        }

        checked={
          checked
        }

        disabled={
          disabled
        }

        onChange={
          onChange
        }

        className="mt-1"
      />


      <span className="text-sm font-medium text-slate-800">
        {label}
      </span>

    </label>
  );
}
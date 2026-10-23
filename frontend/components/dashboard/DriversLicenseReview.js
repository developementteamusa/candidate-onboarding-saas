"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCompanyDriversLicenseReview,
  runCompanyDriversLicenseOcr,
} from "@/lib/api";


export default function DriversLicenseReview({
  applicationId,
}) {
  const [review, setReview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  async function loadReview() {
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


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading driver's license verification...
      </div>
    );
  }


  if (error && !review) {
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
          Review and process the candidate&apos;s
          securely uploaded license.
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
            verification?.front_uploaded
          }
        />

        <UploadState
          title="Back of license"
          uploaded={
            verification?.back_uploaded
          }
        />

      </div>


      {canProcess && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h2 className="font-semibold text-blue-950">
            Ready for OCR
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            Both sides of the driver&apos;s
            license are available for Amazon
            Textract AnalyzeID processing.
          </p>

          <button
            type="button"

            disabled={processing}

            onClick={processLicense}

            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {processing
              ? "Processing..."
              : verification?.status ===
                  "OCR_FAILED"
                ? "Retry processing"
                : "Process driver's license"}
          </button>

        </div>
      )}


      {verification?.status ===
        "OCR_COMPLETE" && (
        <OcrResults
          extractedData={
            verification.extracted_data
          }

          modelVersion={
            verification
              .textract_model_version
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


function OcrResults({
  extractedData,
  modelVersion,
}) {
  const fields = [
    [
      "first_name",
      "First name",
    ],

    [
      "last_name",
      "Last name",
    ],

    [
      "date_of_birth",
      "Date of birth",
    ],

    [
      "driver_license_number",
      "License number",
    ],

    [
      "driver_license_state",
      "Issuing state",
    ],
  ];


  return (
    <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

      <h2 className="text-lg font-semibold text-green-950">
        OCR extraction complete
      </h2>

      <p className="mt-2 text-sm text-green-800">
        Review the identity information
        extracted by Amazon Textract.
      </p>


      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        {fields.map(
          ([key, label]) => {
            const field =
              extractedData?.[key];

            return (
              <div
                key={key}
                className="rounded-lg border border-green-200 bg-white p-4"
              >
                <p className="text-sm text-slate-500">
                  {label}
                </p>

                <p className="mt-1 font-semibold">
                  {field?.value ||
                    "Not detected"}
                </p>

                {field?.confidence != null && (
                  <p className="mt-2 text-xs text-slate-500">
                    Confidence:{" "}
                    {field.confidence.toFixed(
                      2
                    )}
                    %
                  </p>
                )}

              </div>
            );
          }
        )}

      </div>


      {modelVersion && (
        <p className="mt-5 text-xs text-green-700">
          Textract AnalyzeID model:{" "}
          {modelVersion}
        </p>
      )}

    </div>
  );
}
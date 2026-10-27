"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  completeSecureUpload,
  getDriversLicenseStatus,
  linkDriversLicenseUpload,
  requestSecureUpload,
  uploadFileToS3,
} from "@/lib/api";


export default function DriversLicenseVerification() {
  const [
    statusData,
    setStatusData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    frontFile,
    setFrontFile,
  ] = useState(null);


  const [
    backFile,
    setBackFile,
  ] = useState(null);


  const [
    uploadingSide,
    setUploadingSide,
  ] = useState(null);


  /* =========================================================
     LOAD DRIVER'S LICENSE STATUS
  ========================================================= */

  async function loadStatus() {
    try {
      setError("");


      const result =
        await getDriversLicenseStatus();


      setStatusData(
        result || null
      );

    } catch (err) {
      setError(
        getReadableError(
          err
        )
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadStatus();
  }, []);


  /* =========================================================
     NORMALIZED STATE
  ========================================================= */

  const verificationStatus =
    useMemo(
      () => {
        return normalizeStatus(
          statusData?.status ||
          statusData?.verification_status ||
          statusData?.driver_license_status
        );
      },
      [
        statusData,
      ]
    );


  const frontUploaded =
    useMemo(
      () => {
        return Boolean(
          statusData?.front_uploaded ||
          statusData?.front_upload_id ||
          statusData?.front_file_id ||
          statusData?.front_document_id ||
          statusData?.front_license_uploaded
        );
      },
      [
        statusData,
      ]
    );


  const backUploaded =
    useMemo(
      () => {
        return Boolean(
          statusData?.back_uploaded ||
          statusData?.back_upload_id ||
          statusData?.back_file_id ||
          statusData?.back_document_id ||
          statusData?.back_license_uploaded
        );
      },
      [
        statusData,
      ]
    );


  const verified =
    verificationStatus ===
      "VERIFIED";


  const processing =
    [
      "PROCESSING",
      "OCR_PROCESSING",
      "UNDER_REVIEW",
      "REVIEW_REQUIRED",
    ].includes(
      verificationStatus
    );


  const bothUploaded =
    frontUploaded &&
    backUploaded;


  /* =========================================================
     UPLOAD
  ========================================================= */

  async function handleUpload(
    side
  ) {
    const file =
      side === "FRONT"
        ? frontFile
        : backFile;


    if (!file) {
      setError(
        `Please select the ${side.toLowerCase()} image first.`
      );

      return;
    }


    if (
      uploadingSide
    ) {
      return;
    }


    setUploadingSide(
      side
    );

    setError("");
    setSuccess("");


    try {
      const uploadRequest =
        await requestSecureUpload({
          section:
            "DRIVERS_LICENSE",

          filename:
            file.name,

          content_type:
            file.type,

          size:
            file.size,
        });


      if (
        !uploadRequest
      ) {
        throw new Error(
          "The secure upload request did not return a response."
        );
      }


      const uploadUrl =
        uploadRequest.upload_url ||
        uploadRequest.presigned_url ||
        uploadRequest.url;


      const uploadId =
        uploadRequest.upload_id ||
        uploadRequest.id;


      if (
        !uploadUrl
      ) {
        throw new Error(
          "The secure upload URL was not returned."
        );
      }


      if (
        !uploadId
      ) {
        throw new Error(
          "The secure upload ID was not returned."
        );
      }


      await uploadFileToS3(
        uploadUrl,
        file,
        uploadRequest.headers ||
          {}
      );


      await completeSecureUpload({
        upload_id:
          uploadId,
      });


      await linkDriversLicenseUpload(
        uploadId
      );


      setSuccess(
        side === "FRONT"
          ? "Front of driver's license uploaded successfully."
          : "Back of driver's license uploaded successfully."
      );


      if (
        side === "FRONT"
      ) {
        setFrontFile(
          null
        );
      } else {
        setBackFile(
          null
        );
      }


      await loadStatus();

    } catch (err) {
      setError(
        getReadableError(
          err
        )
      );

    } finally {
      setUploadingSide(
        null
      );
    }
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading driver&apos;s license status...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <Link
          href="/candidate/onboarding"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <span>
            ←
          </span>

          <span>
            Back to onboarding
          </span>
        </Link>


        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
          Onboarding
        </p>


        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Driver&apos;s License Verification
        </h1>


        <p className="mt-2 text-sm text-slate-600">
          Upload clear images of the front and back of your driver&apos;s license.
        </p>

      </div>


      {/* =====================================================
          VERIFICATION STATUS
      ====================================================== */}

      <section
        className={`mb-6 rounded-2xl border p-5 shadow-sm ${
          verified
            ? "border-emerald-200 bg-emerald-50"
            : processing
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white"
        }`}
      >

        <p className="text-sm font-medium text-slate-500">
          Verification status
        </p>


        <div className="mt-2 flex flex-wrap items-center gap-3">

          <p
            className={`text-lg font-bold ${
              verified
                ? "text-emerald-700"
                : processing
                  ? "text-amber-700"
                  : "text-slate-950"
            }`}
          >
            {
              formatStatus(
                verificationStatus
              )
            }
          </p>


          {verified && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Identity verified
            </span>
          )}

        </div>


        {verified && (
          <p className="mt-3 text-sm leading-6 text-emerald-700">
            Your driver&apos;s license has already been reviewed and verified.
            No additional upload is required unless you need to replace a document.
          </p>
        )}


        {!verified &&
          bothUploaded && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Both sides of your driver&apos;s license have been uploaded.
              Your documents are available for verification.
            </p>
          )}

      </section>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4"
        >

          <p className="text-sm font-semibold text-red-700">
            Unable to process driver&apos;s license
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >

          <p className="text-sm font-semibold text-emerald-700">
            {success}
          </p>

        </div>
      )}


      {/* =====================================================
          VERIFIED SUMMARY
      ====================================================== */}

      {verified ? (
        <section className="grid gap-5 md:grid-cols-2">

          <UploadedCard
            title="Front of license"
            uploaded={
              frontUploaded
            }
          />

          <UploadedCard
            title="Back of license"
            uploaded={
              backUploaded
            }
          />

        </section>

      ) : (
        <section className="grid gap-5 md:grid-cols-2">

          {/* FRONT */}

          <UploadCard
            title="Front of license"
            description="Upload the front side containing your photo and primary license information."
            uploaded={
              frontUploaded
            }
            selectedFile={
              frontFile
            }
            disabled={
              uploadingSide !==
              null
            }
            uploading={
              uploadingSide ===
              "FRONT"
            }
            onFileChange={
              (file) => {
                setFrontFile(
                  file
                );

                setError("");
                setSuccess("");
              }
            }
            onUpload={() =>
              handleUpload(
                "FRONT"
              )
            }
          />


          {/* BACK */}

          <UploadCard
            title="Back of license"
            description="Upload the back side of your driver's license."
            uploaded={
              backUploaded
            }
            selectedFile={
              backFile
            }
            disabled={
              uploadingSide !==
              null
            }
            uploading={
              uploadingSide ===
              "BACK"
            }
            onFileChange={
              (file) => {
                setBackFile(
                  file
                );

                setError("");
                setSuccess("");
              }
            }
            onUpload={() =>
              handleUpload(
                "BACK"
              )
            }
          />

        </section>
      )}


      {/* =====================================================
          COMPLETION MESSAGE
      ====================================================== */}

      {verified && (
        <div className="mt-8 border-t border-slate-200 pt-6">

          <p className="text-sm font-semibold text-emerald-700">
            ✓ Driver&apos;s license verification complete
          </p>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   UPLOAD CARD
========================================================= */

function UploadCard({
  title,
  description,
  uploaded,
  selectedFile,
  uploading,
  disabled,
  onFileChange,
  onUpload,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${
        uploaded
          ? "border-emerald-200"
          : "border-slate-200"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <h2 className="text-base font-semibold text-slate-950">
            {title}
          </h2>


          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>

        </div>


        {uploaded ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ✓ Uploaded
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Required
          </span>
        )}

      </div>


      {uploaded ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

          <p className="text-sm font-semibold text-emerald-700">
            Document already uploaded
          </p>

          <p className="mt-1 text-xs leading-5 text-emerald-600">
            No additional upload is required for this side.
          </p>

        </div>

      ) : (
        <>
          <div className="mt-6">

            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              disabled={
                disabled
              }
              onChange={
                (event) => {
                  const file =
                    event.target.files?.[0] ||
                    null;

                  onFileChange(
                    file
                  );
                }
              }
              className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>


          {selectedFile && (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">

              <p className="truncate text-xs font-medium text-slate-600">
                Selected: {selectedFile.name}
              </p>

            </div>
          )}


          <button
            type="button"
            onClick={
              onUpload
            }
            disabled={
              disabled ||
              !selectedFile
            }
            className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {uploading
              ? "Uploading securely..."
              : "Upload securely"}
          </button>

        </>
      )}

    </div>
  );
}


/* =========================================================
   VERIFIED DOCUMENT CARD
========================================================= */

function UploadedCard({
  title,
  uploaded,
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        uploaded
          ? "border-emerald-200 bg-white"
          : "border-amber-200 bg-amber-50"
      }`}
    >

      <div className="flex items-center justify-between gap-4">

        <h2 className="font-semibold text-slate-950">
          {title}
        </h2>


        {uploaded ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ✓ Uploaded
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Status unavailable
          </span>
        )}

      </div>


      <p className="mt-3 text-sm text-slate-600">

        {uploaded
          ? "This document is already associated with your driver's-license verification."
          : "The verification is complete, but the upload metadata was not returned by the current status response."}

      </p>

    </div>
  );
}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
  status
) {
  if (!status) {
    return "NOT_STARTED";
  }


  return String(
    status
  )
    .trim()
    .toUpperCase();
}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(
  status
) {
  const labels = {
    NOT_STARTED:
      "Not started",

    FRONT_UPLOADED:
      "Front uploaded",

    BACK_UPLOADED:
      "Back uploaded",

    UPLOADED:
      "Uploaded",

    READY:
      "Ready for verification",

    PROCESSING:
      "Processing",

    OCR_PROCESSING:
      "Processing license",

    REVIEW_REQUIRED:
      "Review required",

    UNDER_REVIEW:
      "Under review",

    VERIFIED:
      "Verified",

    FAILED:
      "Verification failed",
  };


  if (
    labels[status]
  ) {
    return labels[
      status
    ];
  }


  return String(
    status
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


/* =========================================================
   READABLE ERROR
========================================================= */

function getReadableError(
  error
) {
  if (!error) {
    return (
      "An unexpected error occurred."
    );
  }


  if (
    error instanceof Error
  ) {
    return (
      error.message ||
      "An unexpected error occurred."
    );
  }


  if (
    typeof error ===
    "string"
  ) {
    return error;
  }


  if (
    typeof error ===
    "object"
  ) {
    if (
      typeof error.detail ===
      "string"
    ) {
      return error.detail;
    }


    if (
      typeof error.message ===
      "string"
    ) {
      return error.message;
    }


    try {
      return JSON.stringify(
        error
      );

    } catch {
      return (
        "An unexpected error occurred."
      );
    }
  }


  return (
    "An unexpected error occurred."
  );
}
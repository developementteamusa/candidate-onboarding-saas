"use client";

import {
  useEffect,
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
  const [frontFile, setFrontFile] =
    useState(null);

  const [backFile, setBackFile] =
    useState(null);

  const [status, setStatus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    uploadingSide,
    setUploadingSide,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  async function loadStatus() {
    try {
      const data =
        await getDriversLicenseStatus();

      setStatus(data);

    } catch (err) {
      setError(
        err.message ||
          "Unable to load driver's license status."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadStatus();
  }, []);


  async function uploadLicense(
    file,
    side
  ) {
    if (!file) {
      setError(
        `Select the ${side.toLowerCase()} image first.`
      );

      return;
    }

    setUploadingSide(side);

    setError("");
    setMessage("");

    try {
      const authorization =
        await requestSecureUpload({
          section:
            "DRIVERS_LICENSE",

          filename:
            file.name,

          contentType:
            file.type,

          fileSize:
            file.size,
        });


      await uploadFileToS3(
        authorization.upload_url,
        file,
        authorization.required_headers
      );


      await completeSecureUpload(
        authorization.upload_id
      );


      const verification =
        await linkDriversLicenseUpload(
          authorization.upload_id,
          side
        );


      setStatus(
        verification
      );


      setMessage(
        `${formatSide(side)} uploaded successfully.`
      );


      if (side === "FRONT") {
        setFrontFile(null);
      }


      if (side === "BACK") {
        setBackFile(null);
      }

    } catch (err) {
      console.error(
        "Driver license upload failed:",
        err
      );

      setError(
        err.message ||
          "Driver's license upload failed."
      );

    } finally {
      setUploadingSide(null);
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading driver's license verification...
      </div>
    );
  }


  return (
    <div>
      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Onboarding
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Driver&apos;s License Verification
        </h1>

        <p className="mt-3 text-slate-600">
          Upload clear images of the front
          and back of your driver&apos;s license.
        </p>

      </div>


      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">

        <p className="text-sm text-slate-500">
          Verification status
        </p>

        <p className="mt-2 font-semibold text-slate-950">
          {status?.status ||
            "NOT_STARTED"}
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


      <div className="grid gap-6 md:grid-cols-2">

        <LicenseSideCard
          title="Front of license"

          description={
            "Upload the front side containing your photo and primary license information."
          }

          uploaded={
            status?.front_uploaded
          }

          file={frontFile}

          setFile={setFrontFile}

          loading={
            uploadingSide ===
            "FRONT"
          }

          onUpload={() =>
            uploadLicense(
              frontFile,
              "FRONT"
            )
          }
        />


        <LicenseSideCard
          title="Back of license"

          description={
            "Upload the back side of your license."
          }

          uploaded={
            status?.back_uploaded
          }

          file={backFile}

          setFile={setBackFile}

          loading={
            uploadingSide ===
            "BACK"
          }

          onUpload={() =>
            uploadLicense(
              backFile,
              "BACK"
            )
          }
        />

      </div>


      {status?.status ===
        "READY_FOR_OCR" && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h2 className="font-semibold text-blue-950">
            Documents received
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Both sides of your driver&apos;s
            license were securely uploaded.
            Your documents are awaiting
            verification by the company.
          </p>

        </div>
      )}


      {[
        "OCR_IN_PROGRESS",
        "OCR_COMPLETE",
        "REVIEW_REQUIRED",
        "VERIFIED",
      ].includes(
        status?.status
      ) && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">

          <h2 className="font-semibold text-green-950">
            Documents submitted
          </h2>

          <p className="mt-2 text-sm text-green-800">
            Your driver&apos;s license has
            been submitted for verification.
          </p>

        </div>
      )}

    </div>
  );
}


function LicenseSideCard({
  title,
  description,
  uploaded,
  file,
  setFile,
  loading,
  onUpload,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <h2 className="font-semibold text-slate-950">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>


        <span
          className={
            uploaded
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          }
        >
          {uploaded
            ? "Uploaded"
            : "Required"}
        </span>

      </div>


      <input
        type="file"

        accept=".jpg,.jpeg,.png,.pdf"

        onChange={(event) =>
          setFile(
            event.target.files?.[0] ||
              null
          )
        }

        className="mt-6 block w-full rounded-lg border border-slate-300 p-3 text-sm"
      />


      {file && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">

          <p>
            <strong>
              File:
            </strong>{" "}
            {file.name}
          </p>

          <p className="mt-1">
            <strong>
              Type:
            </strong>{" "}
            {file.type}
          </p>

          <p className="mt-1">
            <strong>
              Size:
            </strong>{" "}
            {formatBytes(
              file.size
            )}
          </p>

        </div>
      )}


      <button
        type="button"

        disabled={
          !file ||
          loading
        }

        onClick={onUpload}

        className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Uploading securely..."
          : uploaded
            ? "Replace upload"
            : "Upload securely"}
      </button>

    </div>
  );
}


function formatBytes(
  bytes
) {
  if (!bytes) {
    return "0 bytes";
  }

  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}


function formatSide(
  side
) {
  return (
    side.charAt(0) +
    side
      .slice(1)
      .toLowerCase()
  );
}
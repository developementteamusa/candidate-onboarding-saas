"use client";

import {
  useState,
} from "react";

import {
  completeSecureUpload,
  requestSecureUpload,
  uploadFileToS3,
} from "@/lib/api";


export default function SecureStorageTest() {
  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [uploadedFile, setUploadedFile] =
    useState(null);


  async function handleUpload() {
    if (!file) {
      setError(
        "Select a file first."
      );

      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    setUploadedFile(null);

    try {
      /*
       * Step 1
       * Ask FastAPI for a tenant-scoped,
       * short-lived S3 upload URL.
       */
      const authorization =
        await requestSecureUpload({
          section: "PHOTO",
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        });


      /*
       * Step 2
       * Browser uploads directly to S3.
       *
       * AWS credentials never reach
       * the frontend.
       */
      await uploadFileToS3(
        authorization.upload_url,
        file,
        authorization.required_headers
      );


      /*
       * Step 3
       * Ask FastAPI to verify the S3
       * object and persist metadata.
       */
      const result =
        await completeSecureUpload(
          authorization.upload_id
        );


      setUploadedFile(result);

      setMessage(
        "Secure upload completed successfully."
      );

    } catch (err) {
      console.error(
        "Secure upload error:",
        err
      );

      setError(
        err.message ||
          "Secure upload failed."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Phase 5 Validation
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Secure Storage Test
        </h1>

        <p className="mt-3 text-slate-600">
          Test the private S3 + KMS upload
          foundation before onboarding modules
          begin using it.
        </p>
      </div>


      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Test file
          </span>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ||
                  null
              );

              setMessage("");
              setError("");
            }}
            className="mt-3 block w-full rounded-lg border border-slate-300 p-3"
          />
        </label>


        {file && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <strong>Name:</strong>{" "}
              {file.name}
            </p>

            <p className="mt-1">
              <strong>Type:</strong>{" "}
              {file.type}
            </p>

            <p className="mt-1">
              <strong>Size:</strong>{" "}
              {file.size} bytes
            </p>
          </div>
        )}


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


        {uploadedFile && (
          <div className="mt-6 rounded-lg border border-slate-200 p-4">

            <h2 className="font-semibold">
              Verified file metadata
            </h2>

            <p className="mt-3 text-sm">
              ID: {uploadedFile.id}
            </p>

            <p className="mt-1 text-sm">
              Section: {uploadedFile.section}
            </p>

            <p className="mt-1 text-sm">
              Type: {uploadedFile.content_type}
            </p>

            <p className="mt-1 text-sm">
              Size: {uploadedFile.size}
            </p>

            <p className="mt-1 text-sm">
              Status:{" "}
              <strong>
                {uploadedFile.status}
              </strong>
            </p>

          </div>
        )}


        <button
          type="button"
          disabled={
            !file ||
            loading
          }
          onClick={handleUpload}
          className="mt-8 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Uploading securely..."
            : "Run secure upload test"}
        </button>

      </div>
    </div>
  );
}
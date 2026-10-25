"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  authorizeBackgroundCheck,
  getBackgroundAuthorization,
} from "@/lib/api";


const DISCLOSURE_VERSION =
  "1.0";

const AUTHORIZATION_VERSION =
  "1.0";


export default function BackgroundAuthorizationForm() {
  const [authorized, setAuthorized] =
    useState(false);

  const [typedName, setTypedName] =
    useState("");

  const [existing, setExisting] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadAuthorization() {
      try {
        const data =
          await getBackgroundAuthorization();

        if (
          data?.authorized
        ) {
          setExisting(data);
        }

      } catch (err) {
        setError(
          err.message ||
            "Unable to load background check authorization."
        );

      } finally {
        setLoading(false);
      }
    }

    loadAuthorization();
  }, []);


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setMessage("");


    if (!authorized) {
      setError(
        "You must provide authorization before continuing."
      );

      return;
    }


    if (
      !typedName.trim()
    ) {
      setError(
        "Enter your full legal name before continuing."
      );

      return;
    }


    setSaving(true);


    try {
      const result =
        await authorizeBackgroundCheck({
          authorized: true,

          typed_name:
            typedName.trim(),

          disclosure_version:
            DISCLOSURE_VERSION,

          authorization_version:
            AUTHORIZATION_VERSION,
        });


      setExisting(
        result
      );


      setMessage(
        "Background check authorization recorded successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to record background check authorization."
      );

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading background check authorization...
      </div>
    );
  }


  if (
    existing?.authorized
  ) {
    return (
      <div>

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Candidate Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Background Check Authorization
          </h1>

        </div>


        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}


        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">

          <h2 className="text-xl font-semibold text-green-950">
            Authorization completed
          </h2>

          <p className="mt-3 text-green-800">
            Your authorization to proceed
            with the background check has
            been recorded.
          </p>


          <dl className="mt-6 space-y-4">

            <div>

              <dt className="text-sm text-green-700">
                Authorized by
              </dt>

              <dd className="mt-1 font-semibold">
                {existing.typed_name}
              </dd>

            </div>


            <div>

              <dt className="text-sm text-green-700">
                Authorized at
              </dt>

              <dd className="mt-1 font-semibold">
                {existing.authorized_at
                  ? new Date(
                      existing.authorized_at
                    ).toLocaleString()
                  : "Recorded"}
              </dd>

            </div>

          </dl>


          <Link
            href="/candidate/onboarding"
            className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white"
          >
            Return to onboarding
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div>

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Candidate Onboarding
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Background Check
          Disclosure &amp; Authorization
        </h1>

        <p className="mt-3 text-slate-600">
          Please review this disclosure
          carefully before providing your
          authorization.
        </p>

      </div>


      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
      >

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Disclosure
          </p>

          <h2 className="mt-3 text-xl font-semibold text-slate-950">
            Employment Background Report
          </h2>


          <div className="mt-5 space-y-4 leading-7 text-slate-700">

            <p>
              The company may obtain a
              consumer report about you for
              employment purposes as part of
              the onboarding process.
            </p>

            <p>
              The report may contain
              information relevant to the
              company&apos;s employment
              screening process.
            </p>

            <p>
              By providing authorization
              below, you authorize the
              company to request an
              employment background report
              from its background screening
              provider.
            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Authorization
          </p>


          <label className="mt-6 flex items-start gap-3">

            <input
              type="checkbox"

              checked={
                authorized
              }

              onChange={
                (event) =>
                  setAuthorized(
                    event.target.checked
                  )
              }

              className="mt-1 h-4 w-4"
            />


            <span className="text-sm leading-6 text-slate-700">
              I authorize the company to
              obtain an employment background
              report about me for employment
              purposes.
            </span>

          </label>


          <div className="mt-6">

            <label
              htmlFor="typed-name"
              className="text-sm font-medium text-slate-700"
            >
              Full legal name
            </label>


            <input
              id="typed-name"

              type="text"

              value={
                typedName
              }

              onChange={
                (event) =>
                  setTypedName(
                    event.target.value
                  )
              }

              placeholder="Type your full legal name"

              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />


            <p className="mt-2 text-xs text-slate-500">
              Typing your legal name confirms
              your authorization.
            </p>

          </div>


          <button
            type="submit"

            disabled={
              saving ||
              !authorized ||
              !typedName.trim()
            }

            className="mt-8 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Recording authorization..."
              : "Authorize background check"}
          </button>

        </section>

      </form>

    </div>
  );
}
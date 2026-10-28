"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  candidateLogin,
} from "@/lib/api";


export default function CandidateLoginPage() {
  const router =
    useRouter();


  const [
    companySlug,
    setCompanySlug,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (loading) {
      return;
    }


    setLoading(true);
    setError("");


    try {
      await candidateLogin(
        companySlug.trim(),
        email.trim(),
        password
      );


      router.replace(
        "/candidate/onboarding"
      );

      router.refresh();

    } catch (err) {
      console.error(
        "Candidate login failed:",
        err
      );


      setError(
        getReadableError(
          err
        )
      );


      setLoading(false);
    }
  }


  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2">

      {/* =====================================================
          LEFT PANEL
      ====================================================== */}

      <div className="hidden lg:block">

        <div className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2">

          <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
            ✓
          </span>

          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Secure Candidate Onboarding
          </span>

        </div>


        <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950">

          Continue your onboarding with{" "}

          <span className="text-emerald-600">
            Cris
          </span>

        </h1>


        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
          Access the secure onboarding workspace
          created for you by your employer or hiring
          company.
        </p>


        <div className="mt-10 space-y-5">

          <Feature>
            Complete your onboarding information
          </Feature>

          <Feature>
            Upload and verify identity documents
          </Feature>

          <Feature>
            Track your onboarding progress
          </Feature>

          <Feature>
            Authorize background screening securely
          </Feature>

        </div>

      </div>


      {/* =====================================================
          LOGIN CARD
      ====================================================== */}

      <div className="mx-auto w-full max-w-lg">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Candidate Sign In
          </p>


          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Sign in to Cris
          </h2>


          <p className="mt-2 text-sm text-slate-500">
            Access your candidate onboarding workspace.
          </p>


          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >

              <p className="text-sm font-semibold text-red-700">
                Sign in failed
              </p>


              <p className="mt-1 text-sm leading-5 text-red-600">
                {error}
              </p>

            </div>
          )}


          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-5"
          >

            {/* COMPANY WORKSPACE */}

            <div>

              <label
                htmlFor="company-slug"
                className="text-sm font-medium text-slate-700"
              >
                Company workspace (slug)
              </label>


              <input
                id="company-slug"
                type="text"
                value={
                  companySlug
                }
                onChange={
                  (event) => {
                    setCompanySlug(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }
                }
                required
                disabled={
                  loading
                }
                autoComplete="organization"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Example: geks"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />


              <p className="mt-2 text-xs leading-5 text-slate-400">
                Enter the company workspace provided with your application or onboarding invitation.
              </p>

            </div>


            {/* EMAIL */}

            <div>

              <label
                htmlFor="candidate-email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>


              <input
                id="candidate-email"
                type="email"
                value={
                  email
                }
                onChange={
                  (event) => {
                    setEmail(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }
                }
                autoComplete="email"
                required
                disabled={
                  loading
                }
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <div className="flex items-center justify-between">

                <label
                  htmlFor="candidate-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>


                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  Forgot password?
                </button>

              </div>


              <input
                id="candidate-password"
                type="password"
                value={
                  password
                }
                onChange={
                  (event) => {
                    setPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }
                }
                autoComplete="current-password"
                required
                disabled={
                  loading
                }
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                loading ||
                !companySlug.trim() ||
                !email.trim() ||
                !password
              }
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "Signing in..."
                : "Sign in to candidate portal"}

            </button>

          </form>


          <div className="my-7 border-t border-slate-100" />


          <div className="text-center">

            <p className="text-sm text-slate-500">
              Are you a company user?
            </p>


            <Link
              href="/login"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Go to Company Portal
            </Link>

          </div>


          <p className="mt-6 text-center text-sm text-slate-500">

            Don&apos;t have a candidate account?{" "}

            <Link
              href="/register/candidate"
              className="font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Create one
            </Link>

          </p>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
  children,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
        ✓
      </div>


      <p className="font-medium text-slate-700">
        {children}
      </p>

    </div>
  );
}


/* =========================================================
   READABLE ERROR
========================================================= */

function getReadableError(
  error
) {
  if (!error) {
    return "Unable to sign in. Please try again.";
  }


  if (
    error instanceof Error
  ) {
    return (
      error.message ||
      "Unable to sign in. Please try again."
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
      return "Unable to sign in. Please try again.";
    }
  }


  return "Unable to sign in. Please try again.";
}
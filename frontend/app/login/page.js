"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import CrisMark from "@/components/layout/CrisMark";
import { login } from "@/lib/api";


export default function CompanyLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered =
    searchParams.get("registered") === "1";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");


    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Enter your email address and password."
      );

      return;
    }


    setSubmitting(true);


    try {
      await login(
  email
    .trim()
    .toLowerCase(),

  password
);


      router.push(
        "/dashboard"
      );

      router.refresh();

    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Check your credentials and try again."
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

          <Link href="/">
            <CrisMark />
          </Link>


          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-slate-500 sm:block">
              New to Cris?
            </span>

            <Link
              href="/register/company"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Create account
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================================
          BODY
      ====================================================== */}

      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">

        {/* ===================================================
            LEFT
        ==================================================== */}

        <section className="hidden lg:flex lg:flex-col lg:justify-center">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Company Portal
            </div>


            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-950">

              Welcome back to
              <br />

              your{" "}

              <span className="text-blue-600">
                Cris
              </span>{" "}

              workspace

            </h1>


            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">

              Sign in to manage applications,
              review candidate onboarding,
              verify identity documents,
              coordinate background checks,
              and monitor progress.

            </p>


            <div className="mt-10 space-y-5">

              <Feature
                title="Candidate management"
                description="Review applications and manage each candidate through the onboarding lifecycle."
              />

              <Feature
                title="Identity verification"
                description="Process driver's licenses and resolve verification mismatches."
              />

              <Feature
                title="Background checks"
                description="Track candidate authorization and screening readiness."
              />

            </div>

          </div>

        </section>


        {/* ===================================================
            LOGIN
        ==================================================== */}

        <section className="flex items-center justify-center">

          <div className="w-full max-w-xl">

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
                  Company Sign In
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Sign in to Cris
                </h2>

                <p className="mt-3 text-slate-600">
                  Access your company workspace.
                </p>

              </div>


              {/* REGISTRATION SUCCESS */}

              {registered && (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                  <p className="font-semibold text-emerald-800">
                    Company account created successfully.
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    You can now sign in using the administrator account you just created.
                  </p>

                </div>
              )}


              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}


              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Work email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      email
                    }
                    onChange={
                      (event) =>
                        setEmail(
                          event.target.value
                        )
                    }
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                {/* PASSWORD */}

                <div className="mt-5">

                  <div className="flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>


                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>

                  </div>


                  <input
                    id="password"
                    type="password"
                    value={
                      password
                    }
                    onChange={
                      (event) =>
                        setPassword(
                          event.target.value
                        )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="mt-7 flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Signing in..."
                    : "Sign in to company portal"}
                </button>

              </form>


              {/* CANDIDATE SWITCH */}

              <div className="mt-8 border-t border-slate-100 pt-6">

                <p className="text-center text-sm text-slate-500">
                  Are you a candidate?
                </p>

                <Link
                  href="/candidate/login"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Go to Candidate Portal
                </Link>

              </div>


              <div className="mt-6 text-center text-sm text-slate-500">

                Don&apos;t have a company account?{" "}

                <Link
                  href="/register/company"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create one
                </Link>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


function Feature({
  title,
  description,
}) {
  return (
    <div className="flex gap-4">

      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
        ✓
      </div>


      <div>

        <h3 className="font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
}
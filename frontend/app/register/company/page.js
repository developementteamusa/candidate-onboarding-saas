"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import CrisMark from "@/components/layout/CrisMark";

import {
  registerCompanyAccount,
} from "@/lib/api";

export default function CompanyRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !form.company_name.trim() ||
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (
      form.password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * Phase 1:
       *
       * This page is now functional from a UI/navigation
       * standpoint.
       *
       * In the next step we will connect this payload to
       * your existing FastAPI company registration endpoint.
       */

      const payload = {
  company_name:
    form.company_name.trim(),

  first_name:
    form.first_name.trim(),

  last_name:
    form.last_name.trim(),

  email:
    form.email
      .trim()
      .toLowerCase(),

  password:
    form.password,
};


await registerCompanyAccount(
  payload
);


router.push(
  "/login?registered=1"
);

    } catch (err) {
      setError(
        err.message ||
          "Unable to create company account."
      );

    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

          <Link href="/">
            <CrisMark />
          </Link>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-slate-500 sm:block">
              Already have an account?
            </span>

            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Sign in
            </Link>

          </div>

        </div>

      </header>


      {/* BODY */}

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">

        {/* LEFT PANEL */}

        <section className="hidden lg:flex lg:flex-col lg:justify-center">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">

              Company Portal

            </div>


            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-950">

              Build a smoother
              <br />

              candidate onboarding
              <br />

              experience with{" "}

              <span className="text-blue-600">
                Cris
              </span>

            </h1>


            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">

              Create your company workspace,
              invite candidates, review
              applications, verify identity
              documents, manage background
              checks, and track onboarding
              from one secure platform.

            </p>


            <div className="mt-10 grid gap-4">

              <Benefit
                title="Multi-tenant company workspace"
                description="Keep candidates, applications, and onboarding records isolated by company."
              />

              <Benefit
                title="Identity verification"
                description="Review driver's license OCR results and resolve mismatches securely."
              />

              <Benefit
                title="Background-check workflows"
                description="Require disclosure, authorization, and verified identity before screening."
              />

            </div>

          </div>

        </section>


        {/* REGISTER CARD */}

        <section className="flex items-center justify-center">

          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
                Company account
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                Create your Cris workspace
              </h2>

              <p className="mt-3 text-slate-600">
                Set up your company and administrator account.
              </p>

            </div>


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

              {/* COMPANY */}

              <div>

                <label
                  htmlFor="company_name"
                  className="text-sm font-medium text-slate-700"
                >
                  Company name
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={
                    form.company_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Arena Healthcare"
                  autoComplete="organization"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>


              {/* NAME */}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="first_name"
                    className="text-sm font-medium text-slate-700"
                  >
                    First name
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={
                      form.first_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Sarah"
                    autoComplete="given-name"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                <div>

                  <label
                    htmlFor="last_name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Last name
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={
                      form.last_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Chen"
                    autoComplete="family-name"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="mt-5">

                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Work email
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="sarah@company.com"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>


              {/* PASSWORDS */}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                <div>

                  <label
                    htmlFor="confirm_password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm password
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={
                      form.confirm_password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>


              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">

                By creating an account, you are creating a
                company workspace in Cris. Company and
                candidate data will remain isolated within
                your organization.

              </div>


              <button
                type="submit"
                disabled={
                  submitting
                }
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Creating workspace..."
                  : "Create company account"}
              </button>

            </form>


            <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">

              Already have a company account?{" "}

              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


function Benefit({
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
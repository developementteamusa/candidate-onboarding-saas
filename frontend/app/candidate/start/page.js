"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export default function CandidateStartPage() {
  const router =
    useRouter();

  const [companySlug, setCompanySlug] =
    useState("");


  function handleSubmit(
    event
  ) {
    event.preventDefault();

    const slug =
      companySlug
        .trim()
        .toLowerCase();


    if (!slug) {
      return;
    }


    router.push(
      `/apply/${encodeURIComponent(
        slug
      )}`
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="mx-auto max-w-lg">

        <Link
          href="/"
          className="text-sm font-semibold text-blue-600"
        >
          ← Back to Cris
        </Link>


        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-8">

            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Candidate Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Create your account
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Enter the company application
              code or company slug provided
              by the employer.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <label className="block">

              <span className="text-sm font-medium text-slate-700">
                Company code
              </span>

              <input
                type="text"

                value={
                  companySlug
                }

                onChange={
                  (event) =>
                    setCompanySlug(
                      event.target.value
                    )
                }

                placeholder="arena-healthcare"

                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </label>


            <button
              type="submit"

              disabled={
                !companySlug.trim()
              }

              className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>

          </form>


          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              href="/candidate/login"
              className="font-semibold text-blue-600"
            >
              Sign in
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}
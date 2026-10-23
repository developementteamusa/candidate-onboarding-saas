"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getCandidateOnboardingStatus,
} from "@/lib/api";


const onboardingSections = [
  {
    title:
      "Driver's License Verification",

    description:
      "Upload the front and back of your driver's license for secure verification.",

    href:
      "/candidate/onboarding/drivers-license",

    enabled: true,
  },

  {
    title:
      "Photo Upload",

    description:
      "Upload your onboarding profile photo.",

    href: null,

    enabled: false,
  },

  {
    title:
      "Selfie Identity Verification",

    description:
      "Complete identity verification using a selfie.",

    href: null,

    enabled: false,
  },

  {
    title:
      "Background Check",

    description:
      "Provide information required for the background-check process.",

    href: null,

    enabled: false,
  },

  {
    title:
      "Legal Documents",

    description:
      "Review and complete required legal documents.",

    href: null,

    enabled: false,
  },
];


export default function OnboardingHome() {
  const [status, setStatus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadStatus() {
      try {
        const data =
          await getCandidateOnboardingStatus();

        setStatus(
          data.status
        );

      } catch (err) {
        setError(
          err.message ||
            "Unable to load onboarding."
        );

      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading onboarding...
      </div>
    );
  }


  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
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
          Onboarding workspace
        </h1>

        <p className="mt-3 text-slate-600">
          Complete each onboarding section
          below.
        </p>
      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Onboarding status
        </p>

        <p className="mt-2 font-semibold text-slate-950">
          {status || "UNKNOWN"}
        </p>
      </div>


      <div className="mt-8 grid gap-4">

        {onboardingSections.map(
          (section) => {
            const card = (
              <div
                className={
                  section.enabled
                    ? "rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                    : "rounded-xl border border-slate-200 bg-white p-6 opacity-75"
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {section.title}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      Not started
                    </p>
                  </div>


                  <div className="shrink-0">
                    {section.enabled ? (
                      <span className="text-sm font-semibold text-blue-600">
                        Open →
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        Coming soon
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );


            if (
              section.enabled &&
              section.href
            ) {
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="block"
                >
                  {card}
                </Link>
              );
            }


            return (
              <div
                key={section.title}
              >
                {card}
              </div>
            );
          }
        )}

      </div>
    </div>
  );
}
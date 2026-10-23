"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  acceptOnboardingInvitation,
} from "@/lib/api";


export default function OnboardingInvitation({
  token,
  companySlug,
}) {
  const router = useRouter();

  const [error, setError] =
    useState("");

  const [needsLogin, setNeedsLogin] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  async function acceptInvitation() {
    setError("");
    setNeedsLogin(false);
    setLoading(true);

    try {
      await acceptOnboardingInvitation(
        token
      );

      router.push(
        "/candidate/onboarding"
      );

      router.refresh();

    } catch (err) {
      if (err.status === 401) {
        setNeedsLogin(true);

      } else {
        setError(
          err.message ||
            "Unable to accept invitation."
        );
      }

    } finally {
      setLoading(false);
    }
  }


  const returnPath =
    `/apply/${companySlug}` +
    `/onboarding?token=` +
    encodeURIComponent(token);

  const loginUrl =
    `/apply/${companySlug}/login` +
    `?next=` +
    encodeURIComponent(
      returnPath
    );


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        Onboarding Invitation
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Start your onboarding
      </h1>

      <p className="mt-4 text-slate-600">
        Your application has been approved.
        Accept your invitation to begin the
        onboarding process.
      </p>


      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {needsLogin && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">

          <p className="text-sm text-blue-800">
            Please sign in to your candidate
            account before accepting the
            invitation.
          </p>

          <Link
            href={loginUrl}
            className="mt-3 inline-block font-semibold text-blue-700"
          >
            Sign in
          </Link>

        </div>
      )}


      <button
        type="button"
        disabled={loading}
        onClick={acceptInvitation}
        className="mt-8 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading
          ? "Starting onboarding..."
          : "Accept and start onboarding"}
      </button>

    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginCandidate,
} from "@/lib/api";


export default function CandidateLoginForm({
  companySlug,
  redirectPath = "/candidate/application",
}) {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  function getSafeRedirect() {
    if (
      typeof redirectPath !== "string" ||
      !redirectPath.startsWith("/") ||
      redirectPath.startsWith("//")
    ) {
      return "/candidate/application";
    }

    return redirectPath;
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginCandidate(
        companySlug,
        email,
        password
      );

      router.push(
        getSafeRedirect()
      );

      router.refresh();

    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="candidate-email"
          className="block text-sm font-medium text-slate-700"
        >
          Email address
        </label>

        <input
          id="candidate-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label
          htmlFor="candidate-password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <input
          id="candidate-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading
          ? "Signing in..."
          : "Sign in"}
      </button>
    </form>
  );
}
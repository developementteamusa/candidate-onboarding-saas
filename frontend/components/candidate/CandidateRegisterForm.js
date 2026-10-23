"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  registerCandidate,
} from "@/lib/api";


export default function CandidateRegisterForm({
  companySlug,
}) {
  const router = useRouter();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerCandidate(
        companySlug,
        firstName,
        lastName,
        email,
        password
      );

      router.push(
        "/candidate/application"
      );

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">

        <Field
          label="First name"
          value={firstName}
          onChange={setFirstName}
        />

        <Field
          label="Last name"
          value={lastName}
          onChange={setLastName}
        />

      </div>

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
      />

      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label className="block">

      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type={type}
        required
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
      />

    </label>
  );
}
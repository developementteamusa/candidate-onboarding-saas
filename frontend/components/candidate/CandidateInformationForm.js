"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getCandidateOnboardingProfile,
  saveCandidateOnboardingProfile,
} from "@/lib/api";


const initialForm = {
  legal_first_name: "",
  legal_middle_name: "",
  legal_last_name: "",

  date_of_birth: "",

  driver_license_number: "",
  driver_license_state: "",

  phone: "",

  street_address: "",
  city: "",
  state: "",
  postal_code: "",
};


export default function CandidateInformationForm() {
  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadProfile() {
      try {
        const data =
          await getCandidateOnboardingProfile();

        if (data?.id) {
          setForm({
            legal_first_name:
              data.legal_first_name || "",

            legal_middle_name:
              data.legal_middle_name || "",

            legal_last_name:
              data.legal_last_name || "",

            date_of_birth:
              data.date_of_birth || "",

            driver_license_number:
              data.driver_license_number || "",

            driver_license_state:
              data.driver_license_state || "",

            phone:
              data.phone || "",

            street_address:
              data.street_address || "",

            city:
              data.city || "",

            state:
              data.state || "",

            postal_code:
              data.postal_code || "",
          });

          setCompleted(
            Boolean(
              data.completed
            )
          );
        }

      } catch (err) {
        setError(
          err.message ||
            "Unable to load candidate information."
        );

      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);


  function handleChange(
    event
  ) {
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

    setMessage("");
    setError("");
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result =
        await saveCandidateOnboardingProfile(
          form
        );

      setCompleted(
        Boolean(
          result.completed
        )
      );

      setForm({
        legal_first_name:
          result.legal_first_name || "",

        legal_middle_name:
          result.legal_middle_name || "",

        legal_last_name:
          result.legal_last_name || "",

        date_of_birth:
          result.date_of_birth || "",

        driver_license_number:
          result.driver_license_number || "",

        driver_license_state:
          result.driver_license_state || "",

        phone:
          result.phone || "",

        street_address:
          result.street_address || "",

        city:
          result.city || "",

        state:
          result.state || "",

        postal_code:
          result.postal_code || "",
      });

      setMessage(
        completed
          ? "Candidate information updated successfully."
          : "Candidate information saved successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to save candidate information."
      );

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading candidate information...
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
          Candidate Information
        </h1>

        <p className="mt-3 text-slate-600">
          Enter the information exactly
          as it appears on your
          driver&apos;s license.
        </p>

      </div>


      {completed && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Candidate information completed.
        </div>
      )}


      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}


      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >

        <div className="grid gap-6 md:grid-cols-2">

          <Field
            label="Legal first name"
            name="legal_first_name"
            value={
              form.legal_first_name
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Legal middle name"
            name="legal_middle_name"
            value={
              form.legal_middle_name
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Legal last name"
            name="legal_last_name"
            value={
              form.legal_last_name
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Date of birth"
            name="date_of_birth"
            type="date"
            value={
              form.date_of_birth
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Driver's license number"
            name="driver_license_number"
            value={
              form.driver_license_number
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Driver's license state"
            name="driver_license_state"
            value={
              form.driver_license_state
            }
            onChange={
              handleChange
            }
            placeholder="KS"
            required
          />


          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={
              form.phone
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Street address"
            name="street_address"
            value={
              form.street_address
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="City"
            name="city"
            value={
              form.city
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="State"
            name="state"
            value={
              form.state
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Postal code"
            name="postal_code"
            value={
              form.postal_code
            }
            onChange={
              handleChange
            }
            required
          />

        </div>


        <div className="mt-8 flex flex-wrap gap-4">

          <button
            type="submit"
            disabled={
              saving
            }
            className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : completed
                ? "Update information"
                : "Save information"}
          </button>


          {completed && (
            <Link
              href="/candidate/onboarding/drivers-license"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Upload driver&apos;s license
            </Link>
          )}

        </div>

      </form>
    </div>
  );
}


function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <label className="block">

      <span className="text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}*
          </span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={
          placeholder
        }
        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

    </label>
  );
}
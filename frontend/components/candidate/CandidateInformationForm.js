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
  drivers_license_number: "",
  drivers_license_state: "",
  phone: "",
  street_address: "",
  city: "",
  state: "",
  postal_code: "",
};


export default function CandidateInformationForm() {
  const [
    form,
    setForm,
  ] = useState(
    initialForm
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =========================================================
     LOAD EXISTING PROFILE
  ========================================================= */

  useEffect(() => {
    let active = true;


    async function loadProfile() {
      try {
        setError("");


        const data =
          await getCandidateOnboardingProfile();


        if (!active) {
          return;
        }


        if (data) {
          setForm({
            legal_first_name:
              data.legal_first_name ||
              "",

            legal_middle_name:
              data.legal_middle_name ||
              "",

            legal_last_name:
              data.legal_last_name ||
              "",

            date_of_birth:
              normalizeDateForInput(
                data.date_of_birth
              ),

            drivers_license_number:
              data.drivers_license_number ||
              "",

            drivers_license_state:
              data.drivers_license_state ||
              "",

            phone:
              data.phone ||
              "",

            street_address:
              data.street_address ||
              "",

            city:
              data.city ||
              "",

            state:
              data.state ||
              "",

            postal_code:
              data.postal_code ||
              "",
          });
        }

      } catch (err) {
        if (!active) {
          return;
        }


        setError(
          getReadableError(
            err
          )
        );

      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }


    loadProfile();


    return () => {
      active = false;
    };
  }, []);


  /* =========================================================
     INPUT CHANGE
  ========================================================= */

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

        [name]:
          value,
      })
    );


    if (error) {
      setError("");
    }


    if (success) {
      setSuccess("");
    }
  }


  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (saving) {
      return;
    }


    setSaving(true);
    setError("");
    setSuccess("");


    try {
      const payload = {
        legal_first_name:
          form.legal_first_name.trim(),

        legal_middle_name:
          form.legal_middle_name.trim(),

        legal_last_name:
          form.legal_last_name.trim(),

        date_of_birth:
          form.date_of_birth,

        drivers_license_number:
          form.drivers_license_number
            .trim(),

        drivers_license_state:
          form.drivers_license_state
            .trim()
            .toUpperCase(),

        phone:
          form.phone.trim(),

        street_address:
          form.street_address.trim(),

        city:
          form.city.trim(),

        state:
          form.state
            .trim()
            .toUpperCase(),

        postal_code:
          form.postal_code.trim(),
      };


      const result =
        await saveCandidateOnboardingProfile(
          payload
        );


      if (result) {
        setForm(
          (current) => ({
            ...current,

            legal_first_name:
              result.legal_first_name ??
              current.legal_first_name,

            legal_middle_name:
              result.legal_middle_name ??
              current.legal_middle_name,

            legal_last_name:
              result.legal_last_name ??
              current.legal_last_name,

            date_of_birth:
              normalizeDateForInput(
                result.date_of_birth ??
                current.date_of_birth
              ),

            drivers_license_number:
              result.drivers_license_number ??
              current.drivers_license_number,

            drivers_license_state:
              result.drivers_license_state ??
              current.drivers_license_state,

            phone:
              result.phone ??
              current.phone,

            street_address:
              result.street_address ??
              current.street_address,

            city:
              result.city ??
              current.city,

            state:
              result.state ??
              current.state,

            postal_code:
              result.postal_code ??
              current.postal_code,
          })
        );
      }


      setSuccess(
        "Candidate information saved successfully."
      );

    } catch (err) {
      setError(
        getReadableError(
          err
        )
      );

    } finally {
      setSaving(
        false
      );
    }
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading candidate information...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8">

        <Link
          href="/candidate/onboarding"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >

          <span>
            ←
          </span>

          <span>
            Back to onboarding
          </span>

        </Link>


        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
          Candidate Onboarding
        </p>


        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Candidate Information
        </h1>


        <p className="mt-2 text-sm text-slate-600">
          Enter the information exactly as it appears on your driver&apos;s license.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4"
        >

          <p className="text-sm font-semibold text-red-700">
            Unable to load or save information
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >

          <p className="text-sm font-semibold text-emerald-700">
            {success}
          </p>

        </div>
      )}


      {/* =====================================================
          FORM CARD
      ====================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >

        <div className="grid gap-6 md:grid-cols-2">

          {/* FIRST NAME */}

          <Field
            label="Legal first name"
            required
          >
            <input
              type="text"
              name="legal_first_name"
              value={
                form.legal_first_name
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="given-name"
              className={inputClass}
            />
          </Field>


          {/* MIDDLE NAME */}

          <Field
            label="Legal middle name"
          >
            <input
              type="text"
              name="legal_middle_name"
              value={
                form.legal_middle_name
              }
              onChange={
                handleChange
              }
              disabled={
                saving
              }
              autoComplete="additional-name"
              className={inputClass}
            />
          </Field>


          {/* LAST NAME */}

          <Field
            label="Legal last name"
            required
          >
            <input
              type="text"
              name="legal_last_name"
              value={
                form.legal_last_name
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="family-name"
              className={inputClass}
            />
          </Field>


          {/* DATE OF BIRTH */}

          <Field
            label="Date of birth"
            required
          >
            <input
              type="date"
              name="date_of_birth"
              value={
                form.date_of_birth
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              className={inputClass}
            />
          </Field>


          {/* DL NUMBER */}

          <Field
            label="Driver's license number"
            required
          >
            <input
              type="text"
              name="drivers_license_number"
              value={
                form.drivers_license_number
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoCapitalize="characters"
              spellCheck="false"
              className={inputClass}
            />
          </Field>


          {/* DL STATE */}

          <Field
            label="Driver's license state"
            required
          >
            <input
              type="text"
              name="drivers_license_state"
              value={
                form.drivers_license_state
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              maxLength={2}
              placeholder="KS"
              autoCapitalize="characters"
              spellCheck="false"
              className={inputClass}
            />
          </Field>


          {/* PHONE */}

          <Field
            label="Phone"
            required
          >
            <input
              type="tel"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="tel"
              className={inputClass}
            />
          </Field>


          {/* STREET */}

          <Field
            label="Street address"
            required
          >
            <input
              type="text"
              name="street_address"
              value={
                form.street_address
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>


          {/* CITY */}

          <Field
            label="City"
            required
          >
            <input
              type="text"
              name="city"
              value={
                form.city
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="address-level2"
              className={inputClass}
            />
          </Field>


          {/* STATE */}

          <Field
            label="State"
            required
          >
            <input
              type="text"
              name="state"
              value={
                form.state
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              maxLength={2}
              autoCapitalize="characters"
              spellCheck="false"
              autoComplete="address-level1"
              className={inputClass}
            />
          </Field>


          {/* POSTAL CODE */}

          <Field
            label="Postal code"
            required
          >
            <input
              type="text"
              name="postal_code"
              value={
                form.postal_code
              }
              onChange={
                handleChange
              }
              required
              disabled={
                saving
              }
              autoComplete="postal-code"
              className={inputClass}
            />
          </Field>

        </div>


        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

          


          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save information"}
          </button>

        </div>

      </form>

    </div>
  );
}


/* =========================================================
   FIELD WRAPPER
========================================================= */

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


/* =========================================================
   INPUT CLASS
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";


/* =========================================================
   NORMALIZE DATE FOR HTML INPUT
========================================================= */

function normalizeDateForInput(
  value
) {
  if (!value) {
    return "";
  }


  /*
   * Already YYYY-MM-DD.
   */
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }


  const year =
    date.getUTCFullYear();


  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


/* =========================================================
   READABLE ERROR
========================================================= */

function getReadableError(
  error
) {
  if (!error) {
    return (
      "An unexpected error occurred."
    );
  }


  if (
    error instanceof Error
  ) {
    return (
      error.message ||
      "An unexpected error occurred."
    );
  }


  if (
    typeof error === "string"
  ) {
    return error;
  }


  if (
    typeof error === "object"
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
      return (
        "An unexpected error occurred."
      );
    }
  }


  return (
    "An unexpected error occurred."
  );
}
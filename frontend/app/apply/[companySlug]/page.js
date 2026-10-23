import Link from "next/link";

import {
  getPublicCompany,
} from "@/lib/api";


export default async function ApplicationPortal({
  params,
}) {
  const {
    companySlug,
  } = await params;

  let company;

  try {
    company = await getPublicCompany(
      companySlug
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-950">
          Application portal unavailable
        </h1>

        <p className="mt-4 text-slate-600">
          The company application portal could not be found.
        </p>
      </main>
    );
  }


  return (
    <main className="mx-auto max-w-4xl px-6 py-20">

      <p className="font-semibold text-blue-600">
        Candidate Application
      </p>

      <h1 className="mt-3 text-4xl font-bold text-slate-950">
        Apply to {company.name}
      </h1>

      <p className="mt-5 text-lg text-slate-600">
        Create an account or sign in to continue your application.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">

        <Link
          href={`/apply/${companySlug}/register`}
          className="rounded-lg bg-slate-900 px-6 py-3 text-center font-semibold text-white hover:bg-slate-800"
        >
          Create account
        </Link>

        <Link
          href={`/apply/${companySlug}/login`}
          className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
        >
          Sign in
        </Link>

      </div>

    </main>
  );
}
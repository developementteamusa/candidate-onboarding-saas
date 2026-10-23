import Link from "next/link";

import CandidateRegisterForm from "@/components/candidate/CandidateRegisterForm";


export default async function RegisterPage({
  params,
}) {
  const {
    companySlug,
  } = await params;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Candidate Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Create your account
        </h1>

        <p className="mt-3 text-slate-600">
          Create an account to begin your application.
        </p>

        <div className="mt-8">
          <CandidateRegisterForm
            companySlug={companySlug}
          />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href={`/apply/${companySlug}/login`}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
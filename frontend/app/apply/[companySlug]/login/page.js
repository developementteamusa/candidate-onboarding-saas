import Link from "next/link";

import CandidateLoginForm from "@/components/candidate/CandidateLoginForm";


export default async function CandidateLoginPage({
  params,
  searchParams,
}) {
  const {
    companySlug,
  } = await params;

  const query =
    await searchParams;

  const redirectPath =
    typeof query?.next === "string"
      ? query.next
      : "/candidate/application";

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Candidate Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Candidate sign in
        </h1>

        <p className="mt-3 text-slate-600">
          Sign in to continue.
        </p>

        <div className="mt-8">
          <CandidateLoginForm
            companySlug={companySlug}
            redirectPath={
              redirectPath
            }
          />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}

            <Link
              href={`/apply/${companySlug}/register`}
              className="font-semibold text-blue-600"
            >
              Create account
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
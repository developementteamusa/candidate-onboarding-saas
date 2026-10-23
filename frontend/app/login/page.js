import LoginForm from "@/components/auth/LoginForm";


export const metadata = {
  title: "Sign In | Candidate Onboarding",
};


export default function LoginPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Company Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Sign in
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Access your company candidate
              onboarding workspace.
            </p>
          </div>

          <LoginForm />

        </div>
      </div>
    </section>
  );
}
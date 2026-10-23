import OnboardingInvitation from "@/components/candidate/OnboardingInvitation";


export default async function OnboardingInvitationPage({
  params,
  searchParams,
}) {
  const {
    companySlug,
  } = await params;

  const query =
    await searchParams;

  const token =
    typeof query?.token === "string"
      ? query.token
      : "";


  if (!token) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Invalid onboarding invitation.
        </div>

      </main>
    );
  }


  return (
    <main className="mx-auto max-w-2xl px-6 py-16">

      <OnboardingInvitation
        token={token}
        companySlug={companySlug}
      />

    </main>
  );
}
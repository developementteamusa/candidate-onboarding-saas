import BackgroundAuthorizationForm from "@/components/candidate/BackgroundAuthorizationForm";


export const metadata = {
  title:
    "Background Check Authorization | Candidate Onboarding",
};


export default function BackgroundAuthorizationPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">

      <BackgroundAuthorizationForm />

    </main>
  );
}
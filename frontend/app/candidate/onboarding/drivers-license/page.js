import DriversLicenseVerification from "@/components/candidate/DriversLicenseVerification";


export const metadata = {
  title:
    "Driver's License Verification | Candidate Onboarding",
};


export default function DriversLicensePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">

      <DriversLicenseVerification />

    </main>
  );
}
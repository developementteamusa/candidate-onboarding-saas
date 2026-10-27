// frontend/app/dashboard/layout.js

import CompanySidebar from "@/components/layout/CompanySidebar";
import CompanyTopbar from "@/components/layout/CompanyTopbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <CompanySidebar />

      <div className="lg:pl-[260px]">
        <CompanyTopbar />

        <main className="min-h-[calc(100vh-72px)]">
          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
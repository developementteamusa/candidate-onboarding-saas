"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  getCurrentCompany,
  getCurrentUser,
  logout,
} from "@/lib/api";


export default function DashboardShell() {
  const router = useRouter();

  const [user, setUser] =
    useState(null);

  const [company, setCompany] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          userData,
          companyData,
        ] = await Promise.all([
          getCurrentUser(),
          getCurrentCompany(),
        ]);

        setUser(userData);
        setCompany(companyData);

      } catch (err) {
        if (err.status === 401) {
          router.replace(
            "/login"
          );

          return;
        }

        setError(
          err.message ||
            "Unable to load dashboard."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, [router]);


  async function handleLogout() {
    try {
      await logout();

    } finally {
      router.replace(
        "/login"
      );

      router.refresh();
    }
  }


  if (loading) {
    return (
      <div className="py-20 text-center text-slate-600">
        Loading workspace...
      </div>
    );
  }


  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }


  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Company Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {company?.name}
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome,{" "}
            {user?.first_name}{" "}
            {user?.last_name}
          </p>
        </div>


        <button
          onClick={handleLogout}
          className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>


      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <DashboardCard
          title="Account"
          value={user?.email}
        />

        <DashboardCard
          title="Role"
          value={formatRole(
            user?.role
          )}
        />

        <DashboardCard
          title="Company Status"
          value={company?.status}
        />

      </div>


      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">

        <h2 className="text-xl font-bold text-slate-950">
          Candidate Management
        </h2>

        <p className="mt-3 max-w-2xl text-slate-600">
          Candidate applications and onboarding
          workflows will be introduced in the
          next development phase.
        </p>

      </div>
    </div>
  );
}


function DashboardCard({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-semibold text-slate-950">
        {value || "—"}
      </p>

    </div>
  );
}


function formatRole(role) {
  if (!role) {
    return "—";
  }

  return role
    .split("_")
    .map(
      (word) =>
        word.charAt(0) +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}
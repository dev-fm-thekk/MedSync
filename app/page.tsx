"use client"

import { use, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import LoginPage from "@/components/login-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"
import { getProfile } from "@/supabase/user"
import type { Profile } from "@/supabase/user"

/* ─── Dashboard: receives the profile promise, unwraps with use() ── */
function Dashboard({ profilePromise }: { profilePromise: Promise<Profile | null> }) {
  // use() suspends the component until the promise resolves.
  // The nearest <Suspense> boundary above catches the suspension.
  const profile = use(profilePromise)

  if (!profile) {
    return <UnknownRoleFallback />
  }

  if (profile.role === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}

/* ─── Skeleton shown while profile is loading ───────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
    </div>
  )
}

/* ─── Shown if profile row is missing in Supabase ───────────────── */
function UnknownRoleFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2 text-center px-4">
      <p className="text-lg font-semibold text-slate-800">Profile not found</p>
      <p className="text-sm text-slate-500">
        Your wallet is connected but no profile was found. Please reconnect and complete your profile.
      </p>
    </div>
  )
}

/* ─── Root: handles auth gate, kicks off the profile fetch ──────── */
export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Auth context still initializing
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Not connected — show login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Start the profile fetch immediately (no await — pass the promise down).
  // This runs as soon as we know the wallet address, before Dashboard mounts.
  const profilePromise = getProfile(user!.walletAddress!)

  return (
    // Suspense catches the use() suspension inside <Dashboard>
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard profilePromise={profilePromise} />
    </Suspense>
  )
}
"use client"

import { usePrivy } from "@privy-io/react-auth"
import LoginPage from "@/components/login-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function Home() {
  const { authenticated, ready, user } = usePrivy()

  // Handle loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Initializing MedSync...</p>
      </div>
    )
  }

  // If not authenticated, show the login page
  if (!authenticated) {
    return <LoginPage />
  }

  // Get user role from Privy custom metadata
  const userRole = user?.customMetadata?.role as string | undefined || "patient"

  // Route to appropriate dashboard
  if (userRole === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}

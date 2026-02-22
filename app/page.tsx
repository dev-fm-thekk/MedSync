"use client"

import { useAuth } from "@/lib/auth-context"
import LoginPage from "@/components/login-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Handle loading state while wallet initializes
  if (isLoading) {
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
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Get user role from localStorage (defaulting to patient)
  const userRole = user?.role || "patient"

  // Route to appropriate dashboard
  if (userRole === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}

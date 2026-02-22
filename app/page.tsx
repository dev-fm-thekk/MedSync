"use client"

import { usePrivy } from "@privy-io/react-auth"
import LoginPage from "@/components/login-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function Home() {
  // 1. Use the native Privy hook
  const { authenticated, ready, user } = usePrivy()

  // 2. Handle the loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading MedSync...</p>
      </div>
    )
  }

  // 3. If not authenticated, show the login page
  if (!authenticated) {
    return <LoginPage />
  }

  /**
   * 4. Role Selection Logic
   * In a real app, you would fetch this from your Node.js backend 
   * based on user.id or check user.customMetadata if set via Privy.
   */
  const userRole = user?.customMetadata?.role || "patient"

  if (userRole === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}
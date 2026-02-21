"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (user?.role === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}

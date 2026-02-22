"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockAppointments } from "@/lib/mock-data"
import { ScheduleView } from "./schedule-view"
import { PatientDetailView } from "./patient-detail-view"
import { WalletDetails } from "@/components/wallet-details"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, LogOut, ArrowLeft } from "lucide-react"

export function DoctorDashboard() {
  const { user, logout } = useAuth()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const doctorAppointments = mockAppointments.filter((a) => a.doctorId === "d1")

  const selectedAppointment = selectedPatientId
    ? doctorAppointments.find((a) => a.patientId === selectedPatientId)
    : null

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          {selectedPatientId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPatientId(null)}
              aria-label="Back to schedule"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-card-foreground">MedVault</span>
          </div>
          {selectedPatientId && (
            <span className="text-sm text-muted-foreground ml-2">
              / Patient: {selectedAppointment?.patientName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">MC</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-card-foreground">
              {user?.name}
            </span>
          </div>
          <div className="hidden lg:block">
            <WalletDetails />
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {selectedPatientId && selectedAppointment ? (
          <PatientDetailView
            appointment={selectedAppointment}
            onBack={() => setSelectedPatientId(null)}
          />
        ) : (
          <ScheduleView
            appointments={doctorAppointments}
            onSelectPatient={setSelectedPatientId}
          />
        )}
      </main>
    </div>
  )
}

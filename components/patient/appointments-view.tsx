"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAppointmentsByPatient, createAppointment, type Appointment } from "@/supabase/appointments"
import { getProfilesByRole, type Profile } from "@/supabase/user"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react"

const statusStyles: Record<string, string> = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  completed: "bg-muted text-muted-foreground border-border",
}

export function AppointmentsView() {
  const { walletAddress, user } = useAuth()
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"search" | "confirm" | "processing" | "success">("search")
  const [selectedDoctor, setSelectedDoctor] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [generatedSlot, setGeneratedSlot] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) {
      setPatientAppointments([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      getAppointmentsByPatient(walletAddress),
      getProfilesByRole("doctor"),
    ]).then(([appointments, doctorProfiles]) => {
      setPatientAppointments(appointments)
      setDoctors(doctorProfiles)
      setLoading(false)
    })
  }, [walletAddress])

  const filteredDoctors = doctors.filter((d) =>
    (d.full_name ?? d.id).toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleSelectDoctor(doc: Profile) {
    setSelectedDoctor(doc)
    setStep("confirm")
  }

  async function handleConfirmAccess() {
    if (!walletAddress || !selectedDoctor) return
    setStep("processing")
    setCreateError(null)
    const slot = `SLT-${Math.floor(1000 + Math.random() * 9000)}`
    const { data, error } = await createAppointment({
      doctor_id: selectedDoctor.id,
      patient_id: walletAddress,
      doctor_name: selectedDoctor.full_name,
      patient_name: user?.name ?? null,
      slot_number: slot,
      appointment_date: new Date().toISOString().slice(0, 10),
      appointment_time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "confirmed",
    })
    if (error) {
      setCreateError(error)
      setStep("confirm")
      return
    }
    setGeneratedSlot(slot)
    if (data) setPatientAppointments((prev) => [data, ...prev])
    setStep("success")
  }

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => {
      setStep("search")
      setSelectedDoctor(null)
      setSearchQuery("")
      setGeneratedSlot("")
      setCreateError(null)
    }, 200)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Appointments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your upcoming and past visits
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loading && patientAppointments.length === 0 && (
        <p className="text-sm text-muted-foreground py-6">No appointments yet. Book one above.</p>
      )}
      <div className="flex flex-col gap-3">
        {!loading && patientAppointments.map((apt: Appointment) => (
          <Card key={apt.id} className="border-border">
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {apt.doctorName
                    .split(" ")
                    .slice(1)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="font-medium text-card-foreground">{apt.doctorName}</span>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {apt.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {apt.accessGranted && (
                  <ShieldCheck className="h-4 w-4 text-accent" aria-label="Access granted" />
                )}
                <Badge variant="outline" className={statusStyles[apt.status]}>
                  {apt.status}
                </Badge>
                <span className="hidden sm:inline text-xs font-mono text-muted-foreground">
                  {apt.slotNumber}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          {step === "search" && (
            <>
              <DialogHeader>
                <DialogTitle>Find a Consultant</DialogTitle>
                <DialogDescription>
                  Search for a doctor by name or specialty
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {filteredDoctors.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">No doctors found. Ask your admin to add doctor profiles.</p>
                )}
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary"
                    onClick={() => handleSelectDoctor(doc)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(doc.full_name ?? doc.id).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{doc.full_name ?? `${doc.id.slice(0, 6)}...${doc.id.slice(-4)}`}</div>
                      <div className="text-xs text-muted-foreground font-mono">{doc.id.slice(0, 10)}...</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "confirm" && selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Book appointment</DialogTitle>
                <DialogDescription>
                  Create an appointment with {selectedDoctor.full_name ?? selectedDoctor.id.slice(0, 10) + "..."}.
                </DialogDescription>
              </DialogHeader>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(selectedDoctor.full_name ?? selectedDoctor.id).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{selectedDoctor.full_name ?? selectedDoctor.id}</div>
                    <div className="text-sm text-muted-foreground font-mono">{selectedDoctor.id.slice(0, 14)}...</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <span>
                    Access will be recorded on-chain and automatically revoked after the
                    appointment window closes.
                  </span>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmAccess}>
                  Confirm & Book
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground">Processing on-chain...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Granting time-bound access and creating your slot
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Appointment Confirmed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Booked with {selectedDoctor?.full_name ?? selectedDoctor?.id}
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-6 py-3">
                <span className="text-xs text-muted-foreground">Slot Number</span>
                <p className="text-xl font-mono font-bold text-primary">{generatedSlot}</p>
              </div>
              <Button className="mt-2" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

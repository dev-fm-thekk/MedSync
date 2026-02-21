"use client"

import { useState } from "react"
import { mockAppointments, mockDoctors, type Appointment } from "@/lib/mock-data"
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
  Star,
} from "lucide-react"

const statusStyles: Record<string, string> = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  completed: "bg-muted text-muted-foreground border-border",
}

export function AppointmentsView() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"search" | "confirm" | "processing" | "success">("search")
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof mockDoctors)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [generatedSlot, setGeneratedSlot] = useState("")

  const patientAppointments = mockAppointments.filter((a) => a.patientId === "p1")
  const filteredDoctors = mockDoctors.filter(
    (d) =>
      d.available &&
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  function handleSelectDoctor(doc: (typeof mockDoctors)[0]) {
    setSelectedDoctor(doc)
    setStep("confirm")
  }

  async function handleConfirmAccess() {
    setStep("processing")
    await new Promise((r) => setTimeout(r, 2000))
    setGeneratedSlot(`SLT-${Math.floor(1000 + Math.random() * 9000)}`)
    setStep("success")
  }

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => {
      setStep("search")
      setSelectedDoctor(null)
      setSearchQuery("")
      setGeneratedSlot("")
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

      <div className="flex flex-col gap-3">
        {patientAppointments.map((apt: Appointment) => (
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
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary"
                    onClick={() => handleSelectDoctor(doc)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {doc.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.specialty}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-chart-4 text-chart-4" />
                      {doc.rating}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "confirm" && selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle>Grant Time-Bound Access</DialogTitle>
                <DialogDescription>
                  Allow {selectedDoctor.name} to view your medical files for the duration of this
                  appointment.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedDoctor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{selectedDoctor.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedDoctor.specialty}</div>
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
                  Confirm & Grant Access
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
                  Access has been granted to {selectedDoctor?.name}
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

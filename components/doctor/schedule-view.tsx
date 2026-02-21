"use client"

import type { Appointment } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react"

interface ScheduleViewProps {
  appointments: Appointment[]
  onSelectPatient: (patientId: string) => void
}

export function ScheduleView({ appointments, onSelectPatient }: ScheduleViewProps) {
  const today = appointments.filter((a) => a.status !== "completed")
  const completed = appointments.filter((a) => a.status === "completed")

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Schedule & Appointments</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your patient appointments and view schedules
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{appointments.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{today.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <AlertCircle className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {appointments.filter((a) => a.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <Card className="border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-card-foreground">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {today.map((apt) => (
            <button
              key={apt.id}
              className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary/50 w-full"
              onClick={() => onSelectPatient(apt.patientId)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {apt.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{apt.patientName}</p>
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
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    apt.status === "confirmed"
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-chart-4/10 text-chart-4 border-chart-4/20"
                  }
                >
                  {apt.status}
                </Badge>
                <span className="hidden sm:inline text-xs font-mono text-muted-foreground">
                  {apt.slotNumber}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Completed */}
      {completed.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-card-foreground text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {completed.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 rounded-lg border border-border p-4 opacity-60"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {apt.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {apt.date} at {apt.time}
                  </p>
                </div>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                  completed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

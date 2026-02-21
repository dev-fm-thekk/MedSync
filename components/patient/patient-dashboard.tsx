"use client"

import { useState } from "react"
import { PatientSidebar, type PatientView } from "./patient-sidebar"
import { DocsView } from "./docs-view"
import { AppointmentsView } from "./appointments-view"
import { AuditView } from "./audit-view"

export function PatientDashboard() {
  const [activeView, setActiveView] = useState<PatientView>("docs")

  return (
    <div className="flex h-screen bg-background">
      <PatientSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {activeView === "docs" && <DocsView />}
        {activeView === "appointments" && <AppointmentsView />}
        {activeView === "audit" && <AuditView />}
      </main>
    </div>
  )
}

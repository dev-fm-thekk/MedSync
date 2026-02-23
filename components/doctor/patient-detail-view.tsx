"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import useApi from "@/hooks/use-api"
import type { Appointment } from "@/supabase/appointments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Shield,
  ShieldOff,
  FileText,
  Loader2,
  Brain,
} from "lucide-react"
import { RagChatbot } from "./rag-chatbot"

/** Renders markdown-like summary text (**headers**, - list items) as React nodes */
function SummaryContent({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none text-card-foreground/90">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h4 key={i} className="mt-4 mb-1 text-sm font-semibold text-card-foreground first:mt-0">
              {line.replace(/\*\*/g, "")}
            </h4>
          )
        }
        if (line.startsWith("- ")) {
          return (
            <p key={i} className="ml-4 text-sm text-card-foreground/80 leading-relaxed">
              {line}
            </p>
          )
        }
        if (line.trim() === "") return null
        return (
          <p key={i} className="text-sm text-card-foreground/80 leading-relaxed">
            {line.replace(/\*\*/g, "")}
          </p>
        )
      })}
    </div>
  )
}

interface PatientDetailViewProps {
  appointment: Appointment
  onBack: () => void
}

export function PatientDetailView({ appointment }: PatientDetailViewProps) {
  const { walletAddress } = useAuth()
  const { getRecord } = useApi()
  const [permissionState, setPermissionState] = useState<"checking" | "granted" | "denied">(
    "checking"
  )
  const [recordAccess, setRecordAccess] = useState<Record<string, { accessActive: boolean; expiry?: number }>>({})
  const [patientRecords, setPatientRecords] = useState<{ tokenId: string; name: string }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPermissionState(appointment.accessGranted ? "granted" : "denied")
    }, 500)
    return () => clearTimeout(timer)
  }, [appointment.accessGranted])

  useEffect(() => {
    if (!walletAddress || patientRecords.length === 0) return
    let cancelled = false
    Promise.all(
      patientRecords.map((rec) =>
        getRecord(rec.tokenId, walletAddress)
          .then((res) => ({ tokenId: rec.tokenId, accessActive: res.accessActive }))
          .catch(() => ({ tokenId: rec.tokenId, accessActive: false }))
      )
    ).then((results) => {
      if (cancelled) return
      setRecordAccess(
        results.reduce<Record<string, { accessActive: boolean }>>(
          (acc, { tokenId, accessActive }) => {
            acc[tokenId] = { accessActive }
            return acc
          },
          {}
        )
      )
    })
    return () => {
      cancelled = true
    }
  }, [walletAddress, patientRecords, getRecord])

  if (permissionState === "checking") {
    return (
      <div className="flex h-full items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Verifying Permissions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Checking on-chain access for {appointment.patientName}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (permissionState === "denied") {
    return (
      <div className="flex h-full items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldCheck className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Access Not Granted</p>
            <p className="text-sm text-muted-foreground mt-1">
              This patient has not granted time-bound access to their medical records for this
              appointment. Please ask the patient to grant access through their portal.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent">
            Time-bound access verified
          </span>
          <Badge variant="outline" className="text-xs font-mono">
            {appointment.slotNumber}
          </Badge>
        </div>

        {/* AI Summary – mock only (no n8n summarizer) */}
        <Card className="border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              <Brain className="h-5 w-5 text-primary" />
              AI-Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SummaryContent
              text="**No AI summary available.**\n\nSummaries can be generated when connected to your RAG pipeline."
            />
          </CardContent>
        </Card>

        {/* Record NFTs & access */}
        {patientRecords.length > 0 && (
          <Card className="border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Record NFTs
                <Badge variant="secondary" className="ml-auto">
                  {patientRecords.length} record(s)
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Your access to each record is checked on-chain (MedicalVault NFT).
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {patientRecords.map((rec) => {
                const access = recordAccess[rec.tokenId]
                const hasAccess = access?.accessActive === true
                return (
                  <div
                    key={rec.tokenId}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {hasAccess ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <ShieldOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{rec.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">Token ID: {rec.tokenId}</p>
                    </div>
                    <Badge variant={hasAccess ? "default" : "secondary"} className="shrink-0">
                      {access === undefined ? "Checking…" : hasAccess ? "You have access" : "No access"}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Documents - no table in Supabase; show empty state */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Patient Files
              <Badge variant="secondary" className="ml-auto">
                0 files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No documents stored for this view. Minted records appear under Record NFTs above.</p>
          </CardContent>
        </Card>
      </div>

      {/* RAG Chatbot sidebar */}
      <div className="hidden lg:flex w-96 border-l border-border">
        <RagChatbot patientName={appointment.patientName} />
      </div>
    </div>
  )
}

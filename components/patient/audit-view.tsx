"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, ShieldOff, ExternalLink, RefreshCw } from "lucide-react"

interface AuditLog {
  id: string
  user_id: string
  log_content: string        // JSON string: { event, doctorName, doctorWallet, filesAccessed }
  blockchain_txn_hash: string | null
  created_at: string
}

interface ParsedLog {
  id: string
  event: "access_granted" | "access_revoked" | string
  doctorName: string
  doctorWallet: string
  filesAccessed: number
  txHash: string | null
  timestamp: string
}

function parseLog(log: AuditLog): ParsedLog {
  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(log.log_content)
  } catch {
    // log_content isn't JSON — treat as plain string event
    parsed = { event: log.log_content }
  }

  return {
    id: log.id,
    event: (parsed.event as string) ?? "unknown",
    doctorName: (parsed.doctorName as string) ?? "Unknown",
    doctorWallet: (parsed.doctorWallet as string) ?? "—",
    filesAccessed: (parsed.filesAccessed as number) ?? 0,
    txHash: log.blockchain_txn_hash,
    timestamp: log.created_at
      ? new Date(log.created_at).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—",
  }
}

export function AuditView() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ParsedLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    if (!user?.walletAddress) return
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user.walletAddress.toLowerCase())
        .order("created_at", { ascending: false })

      if (dbError) throw new Error(dbError.message)

      setLogs((data as AuditLog[]).map(parseLog))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [user?.walletAddress])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audit & Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            On-chain access events for your medical records
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead>Event</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead className="hidden md:table-cell">Wallet</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="hidden sm:table-cell">Tx Hash</TableHead>
                <TableHead className="text-right">Files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-secondary animate-pulse w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          ⚠ &nbsp;{error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && logs.length === 0 && (
        <div className="rounded-lg border border-border py-16 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No audit events yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Events will appear here when doctors are granted or revoked access.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && logs.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-foreground">Event</TableHead>
                <TableHead className="text-foreground">Doctor</TableHead>
                <TableHead className="text-foreground hidden md:table-cell">Wallet</TableHead>
                <TableHead className="text-foreground">Timestamp</TableHead>
                <TableHead className="text-foreground hidden sm:table-cell">Tx Hash</TableHead>
                <TableHead className="text-foreground text-right">Files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-secondary/30">
                  <TableCell>
                    {log.event === "access_granted" ? (
                      <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/20">
                        <ShieldCheck className="h-3 w-3" />
                        Granted
                      </Badge>
                    ) : log.event === "access_revoked" ? (
                      <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
                        <ShieldOff className="h-3 w-3" />
                        Revoked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {log.event}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="font-medium text-foreground">
                    {log.doctorName}
                  </TableCell>

                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {log.doctorWallet.length > 20
                      ? `${log.doctorWallet.slice(0, 6)}...${log.doctorWallet.slice(-4)}`
                      : log.doctorWallet}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {log.timestamp}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {log.txHash ? (
                      <a
                        href={`https://basescan.org/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      >
                        {`${log.txHash.slice(0, 6)}...${log.txHash.slice(-4)}`}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-sm text-foreground">
                    {log.filesAccessed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAccessGrantsByPatient, type AccessGrant } from "@/supabase/access-grants"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, ExternalLink, RefreshCw } from "lucide-react"

export function AuditView() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AccessGrant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    if (!user?.walletAddress) return
    try {
      setIsLoading(true)
      setError(null)
      const list = await getAccessGrantsByPatient(user.walletAddress)
      setLogs(list)
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
                <TableHead>Token ID</TableHead>
                <TableHead>Granted at</TableHead>
                <TableHead className="hidden sm:table-cell">Tx Hash</TableHead>
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
          <p className="text-sm font-medium text-muted-foreground">No access grants yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            When you grant a doctor access to a record (on-chain), it will appear here.
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
                <TableHead className="text-foreground">Token ID</TableHead>
                <TableHead className="text-foreground">Granted at</TableHead>
                <TableHead className="text-foreground hidden sm:table-cell">Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/20">
                      <ShieldCheck className="h-3 w-3" />
                      Granted
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.doctorName}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {log.doctorId.length > 20 ? `${log.doctorId.slice(0, 6)}...${log.doctorId.slice(-4)}` : log.doctorId}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{log.tokenId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {log.txHash ? (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
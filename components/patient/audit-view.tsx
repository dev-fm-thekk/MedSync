"use client"

import { mockAuditLogs } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, ShieldOff, ExternalLink } from "lucide-react"

export function AuditView() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Audit & Logs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          On-chain access events for your medical records
        </p>
      </div>

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
            {mockAuditLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-secondary/30">
                <TableCell>
                  {log.event === "access_granted" ? (
                    <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/20">
                      <ShieldCheck className="h-3 w-3" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
                      <ShieldOff className="h-3 w-3" />
                      Revoked
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground">{log.doctorName}</TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                  {log.doctorWallet}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.timestamp}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <button className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline">
                    {log.txHash}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </TableCell>
                <TableCell className="text-right text-sm text-foreground">
                  {log.filesAccessed}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function DocsView() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Medical records minted to your wallet appear as NFTs on-chain
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No documents in this list</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          When doctors upload and mint records to your wallet, you can manage access in Access Management.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { getOwnedTokenIds, getTokenUriOnChain } from "@/lib/medical-vault-contract"
import { downloadEncryptedRecord } from "@/lib/upload-medical-record"
import { decryptFile } from "@/lib/file-encryption"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import type { Address } from "viem"

export interface DecryptedRecord {
  tokenId: string
  fileName: string
  blob: Blob
  mimeType: string
}

function getFileNameFromPath(path: string): string {
  const segments = path.split("/")
  return segments[segments.length - 1] || "document"
}

export function DocsView() {
  const { walletAddress } = useAuth()
  const [records, setRecords] = useState<DecryptedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importNfts = useCallback(async () => {
    if (!walletAddress) {
      setError("Connect your wallet to import your medical record NFTs.")
      return
    }

    setLoading(true)
    setError(null)
    setRecords([])

    try {
      const tokenIds = await getOwnedTokenIds(walletAddress as Address)
      if (tokenIds.length === 0) {
        setLoading(false)
        return
      }

      const decrypted: DecryptedRecord[] = []
      for (const tokenId of tokenIds) {
        try {
          const storagePath = await getTokenUriOnChain(tokenId)
          if (!storagePath?.trim()) continue

          const encryptedBlob = await downloadEncryptedRecord(storagePath)
          const decryptedBlob = await decryptFile(encryptedBlob)
          const fileName = getFileNameFromPath(storagePath)
          const mimeType = encryptedBlob.type || "application/octet-stream"

          decrypted.push({
            tokenId: String(tokenId),
            fileName,
            blob: decryptedBlob,
            mimeType,
          })
        } catch (e) {
          console.warn(`Failed to load token ${tokenId}:`, e)
          // Continue with other tokens
        }
      }

      setRecords(decrypted)
    } catch (e) {
      console.error("Import NFTs error:", e)
      setError(e instanceof Error ? e.message : "Failed to import NFTs. Ensure you're on Sepolia.")
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const handleDownload = (record: DecryptedRecord) => {
    const url = URL.createObjectURL(record.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = record.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const isEmpty = !loading && records.length === 0 && !error

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Medical records minted to your wallet appear as NFTs. Import them to view and download.
          </p>
        </div>
        {walletAddress && (
          <Button
            onClick={importNfts}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? "Importing…" : "Import my NFTs"}
          </Button>
        )}
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {records.length > 0 && (
        <div className="space-y-3 mb-6">
          {records.map((record) => (
            <Card key={record.tokenId} className="border-border">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{record.fileName}</p>
                  <p className="text-xs text-muted-foreground font-mono">Token ID: {record.tokenId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={() => handleDownload(record)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg border border-border py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No documents in this list</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connect your wallet and click &quot;Import my NFTs&quot; to load medical records minted to your address.
          </p>
          {!walletAddress && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              You can manage access to these records in Access Management.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

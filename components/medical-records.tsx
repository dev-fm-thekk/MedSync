/**
 * Medical Records Component
 * 
 * Handles minting and managing medical records via the backend API.
 */

"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import useApi from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FileText, Plus, AlertCircle, CheckCircle } from "lucide-react"

export function MedicalRecords() {
  const { user, walletAddress } = useAuth()
  const { mintRecord, mint, setPatientSignature } = useApi()
  
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [recordData, setRecordData] = useState({
    encryptedPayload: "",
    metadata: "",
  })
  const [signature, setSignature] = useState("")

  if (!user || !walletAddress) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-2 text-sm text-yellow-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>Please connect your wallet to manage medical records.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleMintRecord = async () => {
    if (!recordData.encryptedPayload || !signature) {
      alert("Please fill in all required fields")
      return
    }

    try {
      // Store signature for API authentication
      setPatientSignature(signature)

      const result = await mintRecord(user.id, {
        patientAddress: walletAddress as `0x${string}`,
        encryptedPayload: recordData.encryptedPayload,
        metadata: recordData.metadata ? JSON.parse(recordData.metadata) : undefined,
        account: walletAddress as `0x${string}`,
      })

      setShowMintDialog(false)
      setShowSuccessDialog(true)
      setRecordData({ encryptedPayload: "", metadata: "" })
      setSignature("")
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to mint record"}`)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Records
              </CardTitle>
              <CardDescription>Manage your encrypted medical data on the blockchain</CardDescription>
            </div>
            <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mint Medical Record</DialogTitle>
                  <DialogDescription>
                    Upload and encrypt your medical record to the blockchain
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Patient Address</label>
                    <Input value={walletAddress} disabled className="mt-1 bg-gray-100" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Encrypted Payload / IPFS CID</label>
                    <Textarea
                      placeholder="Paste encrypted data or IPFS CID..."
                      value={recordData.encryptedPayload}
                      onChange={(e) =>
                        setRecordData({ ...recordData, encryptedPayload: e.target.value })
                      }
                      className="mt-1 font-mono text-xs"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Metadata (JSON)</label>
                    <Textarea
                      placeholder='{"recordType": "lab_result", "date": "2024-01-01"}'
                      value={recordData.metadata}
                      onChange={(e) => setRecordData({ ...recordData, metadata: e.target.value })}
                      className="mt-1 font-mono text-xs"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Digital Signature</label>
                    <Textarea
                      placeholder="Paste your digital signature..."
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="mt-1 font-mono text-xs"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowMintDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleMintRecord} disabled={mint.isLoading}>
                      {mint.isLoading ? "Minting..." : "Mint Record"}
                    </Button>
                  </div>

                  {mint.error && <div className="text-sm text-red-600">{mint.error}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600">Records will appear here once minted on the blockchain.</p>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Record Minted Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your medical record has been encrypted and minted as an NFT on the blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>Done</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

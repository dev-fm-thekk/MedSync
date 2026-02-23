/**
 * Access Management Component
 * 
 * Handles granting and managing access to medical records.
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import useApi from "@/hooks/use-api"
import { getAccessGrantsByPatient, insertAccessGrant, type AccessGrant } from "@/supabase/access-grants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Share2, AlertCircle, CheckCircle } from "lucide-react"

export function AccessManagement() {
  const { user, walletAddress } = useAuth()
  const { grantAccess, grantAccessState, setPatientSignature } = useApi()
  const [grantedAccesses, setGrantedAccesses] = useState<AccessGrant[]>([])
  const [showGrantDialog, setShowGrantDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [grantData, setGrantData] = useState({
    tokenId: "",
    doctorAddress: "",
    durationSeconds: "2592000", // 30 days default
  })

  useEffect(() => {
    if (!walletAddress) return
    getAccessGrantsByPatient(walletAddress).then(setGrantedAccesses)
  }, [walletAddress])

  if (!user || !walletAddress) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-2 text-sm text-yellow-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>Please connect your wallet to manage access.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleGrantAccess = async () => {
    if (!grantData.tokenId || !grantData.doctorAddress) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setPatientSignature("doctor-signature-placeholder")

      const result = await grantAccess(user.id, {
        tokenId: grantData.tokenId,
        doctorAddress: grantData.doctorAddress,
        account: walletAddress as `0x${string}`,
        durationSeconds: parseInt(grantData.durationSeconds),
      })

      const expiryAt = new Date(Date.now() + parseInt(grantData.durationSeconds) * 1000).toISOString()
      await insertAccessGrant({
        token_id: grantData.tokenId,
        patient_id: walletAddress,
        doctor_id: grantData.doctorAddress,
        expiry_at: expiryAt,
        tx_hash: result.txHash,
      })
      getAccessGrantsByPatient(walletAddress).then(setGrantedAccesses)

      setShowGrantDialog(false)
      setShowSuccessDialog(true)
      setGrantData({ tokenId: "", doctorAddress: "", durationSeconds: "2592000" })
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to grant access"}`)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Access Management
              </CardTitle>
              <CardDescription>Grant doctors access to your medical records</CardDescription>
            </div>
            <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Grant Access
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grant Access to Doctor</DialogTitle>
                  <DialogDescription>
                    Allow a doctor to view your medical record for a specified duration
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Record Token ID</label>
                    <Input
                      placeholder="Enter token ID"
                      value={grantData.tokenId}
                      onChange={(e) => setGrantData({ ...grantData, tokenId: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Doctor Wallet Address</label>
                    <Input
                      placeholder="0x..."
                      value={grantData.doctorAddress}
                      onChange={(e) =>
                        setGrantData({ ...grantData, doctorAddress: e.target.value })
                      }
                      className="mt-1 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Access Duration (seconds)</label>
                    <Input
                      type="number"
                      value={grantData.durationSeconds}
                      onChange={(e) =>
                        setGrantData({ ...grantData, durationSeconds: e.target.value })
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Default: 30 days (2592000 seconds)
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGrantAccess} disabled={grantAccessState.isLoading}>
                      {grantAccessState.isLoading ? "Granting..." : "Grant Access"}
                    </Button>
                  </div>

                  {grantAccessState.error && (
                    <div className="text-sm text-red-600">{grantAccessState.error}</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {grantedAccesses.length === 0 ? (
            <p className="text-sm text-gray-600">No access grants yet. Grant a doctor access to a record (token ID) above.</p>
          ) : (
            <div className="space-y-2">
              {grantedAccesses.map((access) => (
                <div key={access.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="text-sm">
                    <p className="font-medium">{access.doctorName || `${access.doctorId.slice(0, 10)}...`}</p>
                    <p className="text-gray-600 font-mono text-xs">Token {access.tokenId}</p>
                    <p className="text-gray-500 text-xs">
                      {access.expiryAt ? `Expires: ${new Date(access.expiryAt).toLocaleDateString()}` : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Access Granted Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              The doctor now has access to your medical record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>Done</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

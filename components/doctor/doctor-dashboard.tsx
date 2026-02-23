"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiConfig } from "@/lib/api-config"
import { mockAppointments } from "@/lib/mock-data"
import { ScheduleView } from "./schedule-view"
import { PatientDetailView } from "./patient-detail-view"
import { WalletDetails } from "@/components/wallet-details"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, LogOut, ArrowLeft, Plus, X, Upload, FileText, Check } from "lucide-react"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export function DoctorDashboard() {
  const { user, logout, walletAddress } = useAuth()
  const { mintRecord } = useApi()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const doctorAppointments = mockAppointments.filter((a) => a.doctorId === "d1")
  const selectedAppointment = selectedPatientId
    ? doctorAppointments.find((a) => a.patientId === selectedPatientId)
    : null

  const handleFileChange = (file: File | null) => {
    if (!file) return
    setSelectedFile(file)
    setUploadStatus("idle")
    setUploadError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0] ?? null
    handleFileChange(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    const patientWallet = selectedAppointment?.patientWallet
    const patientId = selectedAppointment?.patientId
    if (!patientId || !patientWallet) {
      setUploadError("Select a patient from the schedule first to upload a file for them.")
      return
    }
    if (!walletAddress) {
      setUploadError("Connect your wallet to upload and mint the record.")
      return
    }

    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")
    const uploadPdfUrl = apiConfig.n8nRagUploadPdfUrl?.trim()

    try {
      setUploadStatus("uploading")
      setUploadError("")

      // 1) Encrypt file and compute hash (for NFT mint)
      const { encryptedBlob, fileHash } = await encryptAndHashFile(selectedFile)
      const recordId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      // 2) Upload encrypted file to Supabase
      const { path: storagePath } = await uploadEncryptedRecord(
        patientId,
        recordId,
        encryptedBlob,
        selectedFile.name
      )

      // 3) Mint NFT for patient (backend calls MedicalVaultNFT.mintRecord)
      await mintRecord(patientWallet, {
        patientAddress: patientWallet as `0x${string}`,
        encryptedPayload: storagePath,
        account: walletAddress as `0x${string}`,
        metadata: { fileHash },
      })

      // Optional: also send PDF to RAG for embeddings if configured
      if (isPdf && uploadPdfUrl) {
        try {
          const formData = new FormData()
          formData.append("data", selectedFile, selectedFile.name)
          await fetch(uploadPdfUrl, { method: "POST", body: formData })
        } catch {
          // RAG upload is optional; mint already succeeded
        }
      }

      setUploadStatus("success")
      setTimeout(() => {
        setShowUploadModal(false)
        setSelectedFile(null)
        setUploadStatus("idle")
        setUploadError("")
      }, 1500)
    } catch (err) {
      setUploadStatus("error")
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    }
  }

  const closeModal = () => {
    if (uploadStatus === "uploading") return // prevent close mid-upload
    setShowUploadModal(false)
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadError("")
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          {selectedPatientId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPatientId(null)}
              aria-label="Back to schedule"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-card-foreground">MedVault</span>
          </div>
          {selectedPatientId && (
            <span className="text-sm text-muted-foreground ml-2">
              / Patient: {selectedAppointment?.patientName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* ── Upload button ── */}
          <Button
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="gap-2 rounded-full px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload File</span>
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name?.slice(0, 2).toUpperCase() ?? "DR"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-card-foreground">
              {user?.name}
            </span>
          </div>
          <div className="hidden lg:block">
            <WalletDetails />
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto">
        {selectedPatientId && selectedAppointment ? (
          <PatientDetailView
            appointment={selectedAppointment}
            onBack={() => setSelectedPatientId(null)}
          />
        ) : (
          <ScheduleView
            appointments={doctorAppointments}
            onSelectPatient={setSelectedPatientId}
          />
        )}
      </main>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upload Medical File</h2>
                <p className="text-xs text-slate-400 mt-0.5">Encrypted & stored in Supabase · NFT minted for patient</p>
              </div>
              <button
                onClick={closeModal}
                disabled={uploadStatus === "uploading"}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!selectedPatientId && uploadStatus !== "success" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Select a patient from the schedule first, then upload a file for them. The file will be encrypted and stored; an NFT record will be minted to the patient.
                </div>
              )}
              {/* Drop zone */}
              {uploadStatus !== "success" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed transition-all"
                  style={{
                    borderColor: dragOver ? "#3b82f6" : selectedFile ? "#10b981" : "#e2e8f0",
                    background: dragOver ? "#eff6ff" : selectedFile ? "#f0fdf4" : "#f8fafc",
                    padding: "28px 20px",
                    textAlign: "center",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.dicom,.doc,.docx"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                        <FileText size={22} className="text-emerald-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[240px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Upload size={22} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Drop file here or <span className="text-blue-600">browse</span>
                      </p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG, DICOM, DOC up to 50MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Success state */}
              {uploadStatus === "success" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={26} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">File uploaded successfully</p>
                  <p className="text-xs text-slate-400">Encrypted, stored in Supabase, and NFT minted for patient</p>
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ⚠ &nbsp;{uploadError}
                </div>
              )}

              {/* Actions */}
              {uploadStatus !== "success" && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={closeModal}
                    disabled={uploadStatus === "uploading"}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadStatus === "uploading" || !selectedPatientId || !walletAddress}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: !selectedFile || uploadStatus === "uploading" || !selectedPatientId || !walletAddress
                        ? "#94a3b8"
                        : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      boxShadow: selectedFile && uploadStatus !== "uploading" && selectedPatientId && walletAddress
                        ? "0 4px 14px rgba(37,99,235,0.30)"
                        : "none",
                    }}
                  >
                    {uploadStatus === "uploading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Uploading…
                      </span>
                    ) : "Upload"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
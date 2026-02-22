"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Wallet } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { connectWallet, isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Wallet connected</p>
          <p className="font-semibold text-slate-900">{user?.walletAddress}</p>
        </div>
      </div>
    )
  }

  const handleConnectWallet = async () => {
    try {
      setIsSubmitting(true)
      setError("")
      await connectWallet()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMessage)
      console.error("[v0] Error connecting wallet:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to MedSync</h1>
          <p className="mt-2 text-sm text-slate-500">Connect your wallet to access your healthcare dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-6">
          {/* MetaMask Connect Button */}
          <button
            onClick={handleConnectWallet}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Wallet className="h-5 w-5" />
            {isSubmitting ? "Connecting..." : "Connect MetaMask"}
          </button>

          {/* Info Section */}
          <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Using MetaMask?</p>
            <ul className="space-y-1 text-xs">
              <li>1. Make sure MetaMask extension is installed</li>
              <li>2. Click the button above to connect</li>
              <li>3. Approve the connection in your wallet</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          By connecting, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useMedSyncAuth } from "@/hooks/use-medsync-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false) // Added for better UX flow
  const { sendOtp, verifyOtp, isAuthenticated, user } = useMedSyncAuth()

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Logged in as</p>
          <p className="font-semibold text-slate-900">{user?.email?.address}</p>
        </div>
      </div>
    )
  }

  const handleSendOtp = async () => {
    await sendOtp(email)
    setShowOtp(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to MedSync</h1>
          <p className="mt-2 text-sm text-slate-500">Secure access to your healthcare dashboard</p>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {/* Email Input Group */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleSendOtp}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              {showOtp ? "Resend Code" : "Send Login Code"}
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* OTP Input Group - Conditioned for cleaner UI */}
          <div className={`space-y-2 transition-all duration-300 ${showOtp ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="text-sm font-medium leading-none text-slate-700">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <button
              onClick={() => verifyOtp(otp)}
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-300"
              disabled={!otp}
            >
              Verify & Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
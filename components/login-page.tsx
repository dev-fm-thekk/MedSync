"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { usePrivy } from "@privy-io/react-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth()
  const { user: privyUser } = usePrivy()

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Logged in as</p>
          <p className="font-semibold text-slate-900">{privyUser?.email?.address}</p>
        </div>
      </div>
    )
  }

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }
    try {
      setIsSubmitting(true)
      setError("")
      await sendOtp(email)
      setShowOtp(true)
    } catch (err) {
      setError("Failed to send code. Please try again.")
      console.error("[v0] Error sending OTP:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the verification code")
      return
    }
    try {
      setIsSubmitting(true)
      setError("")
      await verifyOtp(otp)
    } catch (err) {
      setError("Invalid verification code. Please try again.")
      console.error("[v0] Error verifying OTP:", err)
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
          <p className="mt-2 text-sm text-slate-500">Secure access to your healthcare dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-6">
          {/* Email Input Group */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="name@example.com"
              disabled={isSubmitting}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleSendOtp}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : showOtp ? "Resend Code" : "Send Login Code"}
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* OTP Input Group - Conditioned for cleaner UI */}
          <div className={`space-y-2 transition-all duration-300 ${showOtp ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="text-sm font-medium leading-none text-slate-700">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setError("")
              }}
              placeholder="Enter 6-digit code"
              disabled={isSubmitting}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={!otp || isSubmitting}
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Verify & Login"}
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

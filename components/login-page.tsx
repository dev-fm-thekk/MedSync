"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Wallet, Loader2, AlertCircle, Heart } from "lucide-react"

export function LoginPage() {
  const { login, connectWallet } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await login(email, password)
    } catch {
      setError("Invalid credentials. Try patient@health.io or doctor@health.io")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleWalletConnect() {
    setError("")
    setIsWalletLoading(true)
    try {
      await connectWallet()
    } catch {
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsWalletLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-5xl items-center gap-16">
        {/* Left branding section */}
        <div className="hidden flex-1 lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MedSync</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground text-balance">
            Secure, decentralized healthcare data management.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Your medical records, protected by blockchain technology. Share securely with healthcare providers using time-bound, auditable access controls.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>End-to-end encrypted medical records</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Wallet className="h-5 w-5 text-primary" />
              <span>MetaMask wallet authentication</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>Immutable audit trail on-chain</span>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MedVault</span>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-card-foreground">Sign in to your account</CardTitle>
              <CardDescription>Use your email or connect a Web3 wallet</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@health.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter any password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleWalletConnect}
                disabled={isWalletLoading}
              >
                {isWalletLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect with MetaMask
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo: Use <strong>patient@health.io</strong> or <strong>doctor@health.io</strong> with any password.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

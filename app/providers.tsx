"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { AuthProvider } from "@/lib/auth-context"
import { type ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "your_app_id"}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  )
}

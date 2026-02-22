"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { type ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      // Replace with your actual App ID from the Privy Dashboard
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "your_app_id"}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Automatically creates an embedded wallet for MedSync's dApp features
      }}
    >
      {children}
    </PrivyProvider>
  )
}
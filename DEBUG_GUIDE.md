# Debugging Guide - Privy Integration

## Common Issues & Solutions

### 1. "useAuth must be used within AuthProvider"

**Problem**: Error thrown when using `useAuth()` in a component.

**Cause**: Component is not wrapped by `AuthProvider`.

**Solution**:
- Ensure the component is used inside the app (after `<Providers>`)
- Check that `app/providers.tsx` correctly wraps children with `<AuthProvider>`
- Verify that `app/layout.tsx` uses `<Providers>` component

**Debug Steps**:
```tsx
// Check this is true in your component tree:
// RootLayout
//   └─ Providers
//      ├─ PrivyProvider
//      └─ AuthProvider ← Your component should be inside this
//         └─ YourComponent
```

---

### 2. Wallet Not Displaying

**Problem**: Wallet details button doesn't appear or shows "No wallet connected".

**Cause**: Either not logged in or no wallet connected in Privy.

**Solution**:
1. Check that you're logged in (not on login page)
2. In Privy's UI, ensure a wallet is connected
3. Check browser console for errors

**Debug Steps**:
```tsx
import { useAuth } from "@/lib/auth-context"

export function DebugComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  console.log("[DEBUG] Auth state:", {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    walletAddress: user?.walletAddress,
    user: user
  })
  
  return null // Just for debugging
}
```

Run this and check the browser console (F12).

---

### 3. OTP Code Not Being Sent

**Problem**: Clicking "Send Login Code" doesn't work or shows no feedback.

**Cause**: 
- Missing/incorrect `NEXT_PUBLIC_PRIVY_APP_ID`
- Network error
- Privy rate limiting

**Solution**:
1. Check environment variable: `NEXT_PUBLIC_PRIVY_APP_ID=<value>`
2. Check browser console for errors
3. Try a different email
4. Wait a minute and retry (rate limit)

**Debug Steps**:
```tsx
// In browser console (F12)
console.log(process.env.NEXT_PUBLIC_PRIVY_APP_ID)
// Should show your Privy app ID, not undefined

// Add logging in login-page.tsx
const handleSendOtp = async () => {
  console.log("[DEBUG] Sending OTP for:", email)
  try {
    await sendOtp(email)
    console.log("[DEBUG] OTP sent successfully")
    setShowOtp(true)
  } catch (err) {
    console.log("[DEBUG] Error sending OTP:", err)
    setError("Failed to send code. Please try again.")
  }
}
```

---

### 4. Wallet Modal Won't Open

**Problem**: Clicking wallet button does nothing.

**Cause**: Component not rendering or Dialog component missing.

**Solution**:
1. Check Dialog component is imported
2. Verify `WalletDetails` component is imported
3. Look for console errors

**Debug Steps**:
```tsx
// In wallet-details.tsx, add logging:
export function WalletDetails() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  
  console.log("[DEBUG] WalletDetails rendered")
  console.log("[DEBUG] Wallets:", wallets)
  console.log("[DEBUG] Privy user:", user)
  
  if (!wallets.length) {
    console.log("[DEBUG] No wallets available")
  }
  
  // ... rest of component
}
```

---

### 5. Balance Not Showing

**Problem**: Balance section shows "No balance data available" or loading forever.

**Cause**: 
- RPC fetch timing out (expected - currently mock)
- No wallet address available

**Solution**:
1. This is currently expected behavior (mock data)
2. To implement real balance, use ethers.js or web3.js
3. Check wallet address is available first

**Debug Steps**:
```tsx
// In wallet-details.tsx useEffect
useEffect(() => {
  if (!wallet?.address) {
    console.log("[DEBUG] No wallet address, skipping balance fetch")
    return
  }

  const fetchBalance = async () => {
    console.log("[DEBUG] Fetching balance for:", wallet.address)
    setIsLoading(true)
    try {
      // Mock for now
      await new Promise((r) => setTimeout(r, 800))
      console.log("[DEBUG] Balance fetched")
      setBalanceData({
        balance: "1234567890000000000",
        formattedBalance: "1.234567890 ETH",
      })
    } catch (error) {
      console.error("[DEBUG] Balance error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  fetchBalance()
}, [wallet?.address])
```

---

### 6. "Ready is not defined" Error

**Problem**: Console error about `ready` being undefined.

**Cause**: Privy not initialized when checking `ready`.

**Solution**:
- Wait for `ready` to be true before rendering
- Check app/page.tsx handles loading state

**Debug Steps**:
```tsx
// In app/page.tsx
const { authenticated, ready, user } = usePrivy()

console.log("[DEBUG] Privy state:", { 
  ready, 
  authenticated, 
  hasUser: !!user 
})

if (!ready) {
  return <div>Loading...</div>
}
```

---

### 7. Login Page Shows "Logged in as undefined"

**Problem**: After login, shows "Logged in as undefined".

**Cause**: Privy user data not synced yet, or email missing.

**Solution**:
1. Wait for sync to complete
2. Check email is available from Privy
3. Verify AuthProvider is running

**Debug Steps**:
```tsx
// In login-page.tsx
export default function LoginPage() {
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth()
  const { user: privyUser, ready } = usePrivy()

  console.log("[DEBUG] Login page state:", {
    isAuthenticated,
    ready,
    privyUserEmail: privyUser?.email?.address,
    privyUserId: privyUser?.id
  })

  if (isAuthenticated && ready && privyUser) {
    return (
      <div>
        <p>Logged in as</p>
        <p>{privyUser?.email?.address || "No email"}</p>
      </div>
    )
  }
  
  // ... show form
}
```

---

### 8. Role-Based Routing Not Working

**Problem**: Always showing Patient Dashboard, even for doctors.

**Cause**: Role not in Privy custom metadata.

**Solution**:
1. Set role in Privy custom metadata from your backend
2. Verify app/page.tsx is checking the role correctly
3. Console log to verify role is present

**Debug Steps**:
```tsx
// In app/page.tsx
export default function Home() {
  const { authenticated, ready, user } = usePrivy()

  if (!ready) {
    return <div>Loading...</div>
  }

  if (!authenticated) {
    return <LoginPage />
  }

  console.log("[DEBUG] User metadata:", user?.customMetadata)
  console.log("[DEBUG] Role:", user?.customMetadata?.role)
  
  const userRole = user?.customMetadata?.role as string | undefined || "patient"

  console.log("[DEBUG] Routing to:", userRole)

  if (userRole === "doctor") {
    return <DoctorDashboard />
  }

  return <PatientDashboard />
}
```

---

## Browser DevTools Debugging

### Open Console (F12)
- Check for red errors
- Look for `[DEBUG]` or `[v0]` logs
- Note any error messages

### Check Network Tab
- Look for failed requests
- Check Privy API calls
- Verify environment variables are used

### React DevTools
- Inspect component tree
- Check props being passed
- Verify context values

### Performance
- Check if components re-rendering too much
- Look for memory leaks
- Watch for slow operations

---

## Adding Debug Logs

The codebase uses `[v0]` prefix for debug logs:

```tsx
console.log("[v0] Something happened:", data)
console.error("[v0] Error occurred:", error)
```

**To enable detailed debugging**:
1. Search for `console.log("[v0]` in the codebase
2. Or add your own logs with this prefix
3. Check the console in browser (F12)

---

## Environment Variable Debugging

```tsx
// In app/providers.tsx or any component
console.log("NEXT_PUBLIC_PRIVY_APP_ID:", process.env.NEXT_PUBLIC_PRIVY_APP_ID)

// Should print your app ID, not "undefined"
// If undefined, add it to:
// - .env.local (local development)
// - Vercel dashboard (production)
```

---

## Testing the Full Flow

```tsx
// Create a debug component to test everything:

import { useAuth } from "@/lib/auth-context"
import { usePrivy, useWallets } from "@privy-io/react-auth"

export function DebugPanel() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { user: privyUser, authenticated, ready } = usePrivy()
  const { wallets } = useWallets()

  return (
    <div style={{ padding: 20, background: "#f5f5f5", margin: 20 }}>
      <h2>Debug Panel</h2>
      <pre>{JSON.stringify({
        privy: {
          ready,
          authenticated,
          userEmail: privyUser?.email?.address,
          userId: privyUser?.id,
          wallets: wallets.length
        },
        medsync: {
          isLoading,
          isAuthenticated,
          user: user?.email,
          walletAddress: user?.walletAddress
        }
      }, null, 2)}</pre>
    </div>
  )
}

// Add to your page temporarily, then remove
```

---

## Common Console Errors & Fixes

| Error | Fix |
|-------|-----|
| `"useAuth must be used..."` | Wrap component with `<Providers>` |
| `"undefined is not a function"` | Check imports, ensure hook is from auth-context |
| `"Cannot read property 'address'"` | Wallet might not exist, add null check |
| `"Privy not initialized"` | Wait for `ready === true` |
| `"Failed to fetch wallet"` | Network issue, check RPC endpoint |

---

## When All Else Fails

1. **Clear cache**: 
   - `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Or use Incognito/Private mode

2. **Hard refresh**:
   - `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

3. **Check Privy status**:
   - Visit https://status.privy.io

4. **Review logs**:
   - Check all `[v0]` and `[DEBUG]` logs
   - Note exact error messages

5. **Verify environment**:
   - `.env.local` has NEXT_PUBLIC_PRIVY_APP_ID
   - Privy app exists in Privy dashboard
   - No typos in environment variable name

---

## Getting Help

1. Check this guide first
2. Read `PRIVY_INTEGRATION.md`
3. Review `COMPONENT_ARCHITECTURE.md`
4. Check browser console for errors
5. Verify environment variables
6. Look at Privy docs: https://docs.privy.io

---

**Last Updated**: 2026-02-22  
**Integration Version**: 1.0  
**Status**: Production Ready ✅

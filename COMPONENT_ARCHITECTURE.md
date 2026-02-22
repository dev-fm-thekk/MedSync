# Component Architecture & Data Flow

## Provider Hierarchy

```
RootLayout (Server Component)
  ↓
Providers (Client Component)
  ↓
┌─────────────────────────────┐
│   PrivyProvider             │  ← Privy handles auth & wallets
│ ┌───────────────────────────┤
│ │  AuthProvider             │  ← MedSync custom context
│ │ ┌─────────────────────────┤
│ │ │  Home (app/page.tsx)    │  ← Routes based on auth state
│ │ │ ├─ LoginPage           │  ← Shows login form
│ │ │ ├─ PatientDashboard    │  ← Patient UI
│ │ │ │ └─ PatientSidebar    │  ← Includes WalletDetails
│ │ │ └─ DoctorDashboard     │  ← Doctor UI
│ │ │   └─ WalletDetails     │  ← In header
│ │ └─────────────────────────┤
│ └───────────────────────────┘
└─────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User Input (email/OTP)
  ↓
LoginPage Component
  ↓
useAuth() hook
  ↓
AuthContext (sendOtp, verifyOtp)
  ↓
usePrivy() + useLoginWithEmail()
  ↓
Privy Service
  ↓
User authenticated
  ↓
App routes to Dashboard
```

### 2. Wallet Data Flow
```
Privy (when authenticated)
  ↓
useWallets() hook → Returns wallet array
  ↓
AuthProvider (useEffect watches wallets)
  ↓
Updates User object with walletAddress
  ↓
useAuth() returns updated user
  ↓
WalletDetails component displays wallet info
```

## Key Context: AuthProvider

```typescript
// Location: lib/auth-context.tsx

interface AuthContextType {
  user: User | null              // User info with wallet
  isAuthenticated: boolean       // Is user logged in?
  isLoading: boolean            // Still initializing?
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  connectWallet: () => Promise<void>
  logout: () => void
}

// Usage in components:
const { user, isAuthenticated, isLoading, logout } = useAuth()
```

## Component: WalletDetails

```
WalletDetails (Client Component)
  ↓
Uses: usePrivy(), useWallets()
  ↓
┌─────────────────────────────┐
│ Dialog Trigger Button       │  ← "0x1a2B...9a0b"
│ (Shows wallet preview)      │
├─────────────────────────────┤
│ Dialog Content (Modal)      │
│ ├─ Wallet Address          │  ← Copy button
│ ├─ Wallet ID               │  ← Copy button
│ ├─ Network                 │  ← Human readable
│ ├─ Balance                 │  ← Loading/Loaded/Error
│ └─ View on Etherscan       │  ← External link
└─────────────────────────────┘
```

## Component Usage Examples

### In Patient Sidebar
```tsx
// Location: components/patient/patient-sidebar.tsx

import { WalletDetails } from "@/components/wallet-details"

export function PatientSidebar() {
  const { user, logout } = useAuth()
  
  return (
    <aside>
      {/* ... other content ... */}
      <div className="user-section">
        {/* User info */}
        <WalletDetails />  ← Wallet button here
        <LogoutButton />
      </div>
    </aside>
  )
}
```

### In Doctor Dashboard
```tsx
// Location: components/doctor/doctor-dashboard.tsx

import { WalletDetails } from "@/components/wallet-details"

export function DoctorDashboard() {
  return (
    <div>
      <header>
        {/* ... logo and user info ... */}
        <WalletDetails />  ← Wallet button in header
        <LogoutButton />
      </header>
      {/* ... main content ... */}
    </div>
  )
}
```

### In Custom Component
```tsx
// Location: any component

import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  if (!isAuthenticated) {
    return <LoginPrompt />
  }
  
  return (
    <div>
      <p>User: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Wallet: {user?.walletAddress}</p>
    </div>
  )
}
```

## State Management

### AuthProvider Internal State
```typescript
// Privy State (from usePrivy)
const { 
  user: privyUser,           // Privy user object
  authenticated,             // Is authenticated?
  logout: privyLogout,       // Privy logout
  ready                      // Privy initialized?
} = usePrivy()

// Privy Wallets (from useWallets)
const { wallets } = useWallets()  // [{ address, chainId, id }]

// MedSync State
const [user, setUser] = useState<User | null>(null)
const [isLoading, setIsLoading] = useState(!ready)

// Effect: Sync Privy → MedSync
useEffect(() => {
  if (authenticated && privyUser) {
    const walletAddress = wallets[0]?.address
    setUser({
      id: privyUser.id,
      name: privyUser.customMetadata?.name,
      email: privyUser.email?.address,
      role: privyUser.customMetadata?.role,
      walletAddress
    })
  }
}, [authenticated, privyUser, wallets])
```

## Error Handling Flow

```
Component Action
  ↓
try/catch in handler
  ↓
Error → Display to user
  ↓
Success → Update state
  ↓
Component re-renders
```

### Example: Login Error Handling
```tsx
// In components/login-page.tsx

const handleSendOtp = async () => {
  try {
    setIsSubmitting(true)
    setError("")
    await sendOtp(email)
    setShowOtp(true)
  } catch (err) {
    setError("Failed to send code. Please try again.")
    console.error("[v0] Error:", err)
  } finally {
    setIsSubmitting(false)
  }
}
```

## Loading States

### App Loading
```
Privy initializing
  ↓
ready = false
  ↓
Show loading spinner in home page
  ↓
ready = true
  ↓
Render auth state
```

### Wallet Balance Loading
```
useEffect triggers
  ↓
isLoading = true
  ↓
Show "Fetching balance..."
  ↓
Fetch completes
  ↓
isLoading = false
  ↓
Display balance or error
```

## Security Considerations

1. **No Key Exposure**
   - Privy manages all private keys
   - App only reads public addresses

2. **Secure Session**
   - Privy handles session tokens
   - Auth persists via Privy

3. **Data Validation**
   - User data typed and validated
   - Safe conversions from Privy format

4. **Error Isolation**
   - Errors logged but not exposed
   - User-friendly messages only

## Performance Notes

- `useAuth()` - Lightweight context hook, safe to use anywhere
- `WalletDetails` - Loads balance asynchronously, won't block UI
- `useWallets()` - Only called when needed, memoized by Privy
- Re-renders - Only when wallet data changes (optimized)

## Testing Scenarios

### Scenario 1: New User Login
1. Click "Send Login Code"
2. Error checks for empty email
3. sendOtp called
4. OTP field becomes active
5. Enter code
6. verifyOtp called
7. useAuth hook detects authenticated
8. App routes to dashboard

### Scenario 2: View Wallet
1. User logged in
2. Click WalletDetails button
3. Modal opens
4. Wallet data displays
5. Click copy icon
6. "Copied!" message shows
7. Close modal

### Scenario 3: Logout
1. Click logout button
2. privyLogout called
3. AuthProvider sets user = null
4. App redirects to login

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Type safety throughout
- ✅ Proper error handling
- ✅ Loading states managed
- ✅ Privy integration clean
- ✅ Easy component reuse

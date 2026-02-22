# Privy Integration Guide for MedSync

## Overview
MedSync is now fully integrated with Privy for authentication and wallet management. This document outlines the integration and how to use it.

## Architecture

### Provider Hierarchy
```
RootLayout (Server Component)
  └── Providers (Client Component)
      ├── PrivyProvider (Privy - handles auth & wallets)
      │   └── AuthProvider (MedSync - custom context)
      │       └── App Components
```

### Key Components

#### 1. **PrivyProvider** (`app/providers.tsx`)
- Initializes Privy with your App ID
- Enables email and wallet login methods
- Sets up light theme with custom accent color

#### 2. **AuthProvider** (`lib/auth-context.tsx`)
- Wraps Privy's authentication state
- Maps Privy user data to MedSync's `User` interface
- Provides hooks: `useAuth()`

#### 3. **Wallet Details Component** (`components/wallet-details.tsx`)
- Displays wallet ID, address, network, and balance
- Modal dialog for detailed wallet information
- Copy-to-clipboard functionality
- Integrated into Patient Sidebar and Doctor Dashboard

## Features

### Authentication Flow
1. User enters email
2. Privy sends OTP code
3. User enters OTP
4. User is authenticated
5. App routes based on user role (patient/doctor)

### Wallet Integration
- **Automatic Detection**: Wallets are detected via Privy's `useWallets()` hook
- **Real Wallet Data**: Uses actual Privy wallet connections instead of mocks
- **Multiple Wallets**: Supports multiple wallets (currently uses first connected wallet)
- **Balance Fetching**: Includes infrastructure for RPC-based balance fetching

## Usage in Components

### Using `useAuth()` Hook
```tsx
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, isAuthenticated, logout, connectWallet } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Wallet: {user?.walletAddress}</p>
    </div>
  )
}
```

### Adding Wallet Details
```tsx
import { WalletDetails } from "@/components/wallet-details"

export function MyHeader() {
  return (
    <div>
      <WalletDetails />
    </div>
  )
}
```

## Key Files Changed

- ✅ `lib/auth-context.tsx` - Updated to use Privy's `useWallets()` and proper state sync
- ✅ `app/providers.tsx` - Now wraps PrivyProvider with AuthProvider
- ✅ `app/page.tsx` - Improved loading state and role-based routing
- ✅ `components/patient/patient-sidebar.tsx` - Added WalletDetails component
- ✅ `components/doctor/doctor-dashboard.tsx` - Added WalletDetails in header
- ✅ `components/wallet-details.tsx` - New component for displaying wallet info

## Environment Variables

Required:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Testing the Integration

### 1. Login Flow
- Visit the app
- Enter a test email
- Copy the OTP from Privy's UI
- Paste and verify
- You should be routed to Patient Dashboard

### 2. Wallet Display
- After login, look for wallet button in:
  - Patient Sidebar (bottom section)
  - Doctor Dashboard (top-right header)
- Click to view wallet details modal

### 3. Wallet Details Modal
- Shows Wallet Address (with copy button)
- Shows Wallet ID
- Shows Network/Chain ID
- Shows Balance (with loading state)
- Link to Etherscan

## Troubleshooting

### "useAuth must be used within AuthProvider"
- Ensure component is wrapped by `Providers` from `app/providers.tsx`
- This is already done for all app content in `layout.tsx`

### Wallet Not Showing
- Check that user has connected a wallet in Privy UI
- Use Privy's modal to connect wallet if needed
- Balance fetching might timeout - check browser console

### OTP Not Being Sent
- Verify `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly
- Check Privy dashboard for API key validity
- Look for errors in browser console

## Future Enhancements

1. **Balance Fetching**
   - Currently using mock balance
   - Implement real RPC calls with ethers.js or web3.js
   - Support multiple chains

2. **Multi-Wallet Support**
   - Currently uses first wallet
   - Could allow users to switch between wallets

3. **Transaction Signing**
   - Use Privy's transaction signing capabilities
   - Support blockchain operations

4. **User Profile Completion**
   - Fetch real user names from backend
   - Store role in Privy custom metadata

## Resources

- Privy Docs: https://docs.privy.io
- Privy React SDK: https://docs.privy.io/guide/react
- Wallet API: https://docs.privy.io/guide/react/wallet
